const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const amplify = new AWS.Amplify()
const regular = ['Robert','George','Calvin','Ben','Kristopher']
const reversed = ['Phineas', null, null, 'Caroline']
const validUsers = ['admin@carleski.com', 'benjamincarleski@gmail.com', 'katherine@carleski.com', 'katiecarleski@gmail.com']
const baseDate = 1609567200000 // Friday, 5-Feb-2021, 10 PM Pacific Time, meaning we switch over if they pass off the chore after 10 PM on Friday night
const oneWeek = 7 * 24 * 60 * 60 * 1000
const bucket = 'chores-data'
const key = 'chores.json'

exports.handler = async (event) => {
    const choreId = ((event || {}).queryStringParameters || {}).id
    const revert = ((event || {}).queryStringParameters || {}).revert
    const user = (((((event || {}).requestContext || {}).authorizer || {}).jwt || {}).claims || {}).email
    console.log('Received request to complete ' + choreId + ' by ' + user)

    if (validUsers.indexOf(user) < 0) {
        console.log('Not a valid user requesting completion')
        return { statusCode: 200, body: '{"success":false,"error":"You are not allowed to update chore data"}' }
    }

    if (typeof choreId !== 'string') {
        console.log('Missing or invalid ID')
        return { statusCode: 200, body: '{"success":false,"error":"Invalid or missing chore ID"}' }
    }

    try {
        const content = await s3.getObject({Bucket:bucket, Key:key}).promise()
        var chores = JSON.parse(content.Body)
    } catch (error) {
        console.log('Could not retrieve or parse the chores: ' + error)
        return { statusCode: 200, body: '{"success":false,"error":"Could not retrieve the chore data"}' }
    }

    const offset = Math.floor((Date.now() - baseDate) / oneWeek)
    var reason = null

    for (var i = 0; i < chores.length; i++) {
        let chore = chores[i]

        const reg = ((chores.length - (offset % chores.length)) + i) % chores.length
        const rev = (offset + i + 4) % chores.length

        let assigningTo = []
        if (regular.length > reg && regular[reg]) assigningTo.push(regular[reg])
        if (reversed.length > rev && reversed[rev]) assigningTo.push(reversed[rev])

        chore.expected = assigningTo
        if (chore.id !== choreId) continue

        if (revert && (revert === true || revert === "true")) {
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
    
    if (!reason) {
        console.log('Could not find a chore with ID=' + choreId)
        return { statusCode: 200, body: '{"success":false,"error":"No changes"}' }
    }
    
    try {
        await s3.putObject({Bucket:bucket, Key:key, Body: JSON.stringify(chores), ContentType: 'application/json'}).promise()
        console.log('Updated the chores')
    } catch (error) {
        console.log('Could not update the chores: ' + error)
        return { statusCode: 200, body: '{"success":false,"error":"Could not update the chore data"}' }
    }

    return { statusCode: 200, body: '{"success":true}' }
}
