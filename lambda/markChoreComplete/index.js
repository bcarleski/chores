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
    const user = (((((event || {}).requestContext || {}).authorizer || {}).jwt || {}).claims || {}).email
    console.log('Received request to complete ' + choreId + ' by ' + user)

    if (validUsers.indexOf(user) < 0) {
        console.log('Not a valid user requesting completion')
        return { statusCode: 401, body: '"Invalid user"' }
    }

    if (typeof choreId !== 'string') {
        console.log('Missing or invalid ID')
        return { statusCode: 400, body: '"Invalid or missing id"' }
    }

    try {
        const content = await s3.getObject({Bucket:bucket, Key:key}).promise()
        var chores = JSON.parse(content.Body)
    } catch (error) {
        console.log('Could not retrieve or parse the chores: ' + error)
        return { statusCode: 500, body: '"An unexpected error occurred"' }
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

        reason = user + ' marked chore ' + chore.title + ' assigned to ' + (chore.people || []).join(', ') + ' as complete and so we are assigning it to ' + assigningTo.join(', ')
        console.log(reason)
        chore.last = user + ' marked chore as completed by ' + (chore.people || []).join(' and ') + ' on ' + (new Date());
        chore.people = assigningTo
    }
    
    if (!reason) {
        console.log('Could not find a chore with ID=' + choreId)
        return { statusCode: 200, body: '"No changes"' }
    }
    
    try {
        await s3.putObject({Bucket:bucket, Key:key, Body: JSON.stringify(chores), ContentType: 'application/json'}).promise()
        console.log('Updated the chores')
    } catch (error) {
        console.log('Could not update the chores: ' + error)
        return { statusCode: 500, body: '"An unexpected error occurred"' }
    }

    return { statusCode: 200, body: '<html><head><title>Success</title></head><body><h1>Success</h1><p>' + reason + '</p></body></html>' }
}
