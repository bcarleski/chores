const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3")
const s3 = new S3Client({})
const validUsers = ['admin@carleski.com', 'benjamincarleski@gmail.com', 'katherine@carleski.com', 'katiecarleski@gmail.com']
const baseDate = 1700287200000 // Friday, 17-Nov-2023, 10 PM Pacific Time, meaning we switch over if they pass off the chore after 10 PM on Friday night
const oneWeek = 7 * 24 * 60 * 60 * 1000
const bucket = 'chores-data'
const choresS3Key = 'chores.json'
const peopleS3Key = 'people.json'

async function computeChores(user, choreId, preview, revert, asOfDate) {
    if (!preview) {
        console.log('Received request to complete ' + choreId + ' by ' + user)

        if (validUsers.indexOf(user) < 0) {
            console.log('Not a valid user requesting completion')
            return { statusCode: 200, body: '{"success":false,"error":"You are not allowed to update chore data"}' }
        }

        if (typeof choreId !== 'string') {
            console.log('Missing or invalid ID')
            return { statusCode: 200, body: '{"success":false,"error":"Invalid or missing chore ID"}' }
        }
    } else {
        console.log('Received preview request')
    }

    try {
        const choresS3Content = await s3.send(new GetObjectCommand({Bucket: bucket, Key: choresS3Key}))
        var chores = JSON.parse(await choresS3Content.Body.transformToString())
        const peopleS3Content = await s3.send(new GetObjectCommand({Bucket: bucket, Key: peopleS3Key}))
        var people = JSON.parse(await peopleS3Content.Body.transformToString())
    } catch (error) {
        console.log('Could not retrieve or parse the chores: ' + error)
        return { statusCode: 200, body: '{"success":false,"error":"Could not retrieve the chore data"}' }
    }

    const offset = Math.floor((asOfDate - baseDate) / oneWeek)
    const expectedMap = {_offset:offset,_asOfDateValue:asOfDate,_baseDate:baseDate}
    var reason = null

    for (var i = 0; i < chores.length; i++) {
        let chore = chores[i]

        const reg = ((chores.length - (offset % chores.length)) + i) % chores.length

        let assigningTo = []
        if (people.length > reg && people[reg]) assigningTo.push(people[reg])

        expectedMap[chore.id] = assigningTo
        chore.expected = assigningTo
        if (preview || chore.id !== choreId) continue

        if (revert) {
            if (!chore.previous) continue

            assigningTo = chore.previous.splice(chore.previous.length - 1, 1)
            if (chore.previous.length === 0) delete chore.previous
            reason = user + ' reverted chore ' + chore.title + ' assigned to ' + (chore.people || []).join(', ') + ', sending it back to ' + assigningTo.join(', ')
            chore.history = user + ' marked the chore as not completed, and sent back to ' + (assigningTo || []).join(' and ') + ' on ' + (new Date());
        } else {
            reason = user + ' marked the chore ' + chore.title + ' assigned to ' + (chore.people || []).join(', ') + ' as complete and so we are assigning it to ' + assigningTo.join(', ')
            if (!chore.previous) chore.previous = []
            chore.previous.push(chore.people)
            while (chore.previous.length > 5) chore.previous.splice(0, 1)
            chore.history = user + ' marked the chore as completed by ' + (chore.people || []).join(' and ') + ' on ' + (new Date());
        }

        console.log(reason)
        chore.people = assigningTo
    }
    
    if (!preview) {
        if (!reason) {
            console.log('Could not find a chore with ID=' + choreId)
            return { statusCode: 200, body: '{"success":false,"error":"No changes"}' }
        }

        try {
            await s3.send(new PutObjectCommand({Bucket: bucket, Key: choresS3Key, Body: JSON.stringify(chores), ContentType: 'application/json'}))
            console.log('Updated the chores')
        } catch (error) {
            console.log('Could not update the chores: ' + error)
            return { statusCode: 200, body: '{"success":false,"error":"Could not update the chore data"}' }
        }

        return { statusCode: 200, body: '{"success":true}' }
    } else {
        expectedMap['_asOfDate'] = new Date(asOfDate).toISOString()
        return { statusCode: 200, body: JSON.stringify(expectedMap) }
    }
}

exports.handler = async (event) => {
    const evt = event || {}
    const user = ((((evt.requestContext || {}).authorizer || {}).jwt || {}).claims || {}).email
    const query = evt.queryStringParameters || {}
    const choreId = query.id
    const preview = query.preview === 'true' || query.preview === true ? true : false
    const revert = query.revert === 'true' || query.revert === true ? true : false
    let asOfInt = parseInt(query.asOfDate)
    if (!isFinite(query.asOfDate) && query.asOfDate) {
        asOfInt = new Date(query.asOfDate).getTime()
    }
    const asOfDate = asOfInt && isFinite(asOfInt) ? asOfInt : Date.now()

    return await computeChores(user, choreId, preview, revert, asOfDate)
}
