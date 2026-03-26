import { S3Client, GetObjectCommand, PutObjectCommand, S3ServiceException } from "@aws-sdk/client-s3"
const s3 = new S3Client({ region: 'us-west-2' })
const validUsers = ['admin@carleski.com', 'benjamincarleski@gmail.com', 'katherine@carleski.com', 'katiecarleski@gmail.com']
const baseDate = 1700287200000 // Friday, 17-Nov-2023, 10 PM Pacific Time, meaning we switch over if they pass off the chore after 10 PM on Friday night
const oneWeek = 7 * 24 * 60 * 60 * 1000
const bucket = 'chores-data'
const choresS3Key = 'chores.json'
const peopleS3Key = 'people.json'

function writeLog(logger, message) {
    if (typeof logger !== 'function') console.log(message)
    else logger(message)
}

function validateRequest(user, choreId, preview, logger) {
    if (!preview) {
        writeLog(logger, 'Received request to complete ' + choreId + ' by ' + user)

        if (validUsers.indexOf(user) < 0) {
            writeLog(logger, 'Not a valid user requesting completion')
            return 'You are not allowed to update chore data'
        }

        if (typeof choreId !== 'string') {
            writeLog(logger, 'Missing or invalid ID')
            return 'Invalid or missing chore ID'
        }
    } else {
        writeLog(logger, 'Received preview request')
    }

    return null
}

async function getChoresAndPeople(logger, getS3) {
    if (typeof getS3 !== 'function') getS3 = (objectKey) => s3.send(new GetObjectCommand({Bucket: bucket, Key: objectKey}))

    try {
        const choresS3Content = await getS3(choresS3Key)
        var chores = JSON.parse(await choresS3Content.Body.transformToString())
        const peopleS3Content = await getS3(peopleS3Key)
        var people = JSON.parse(await peopleS3Content.Body.transformToString())

        return { chores, people };
    } catch (error) {
        if (error instanceof S3ServiceException) {
            writeLog(logger, `Error from S3 while getting object from ${bucket}.  ${error.name}: ${error.message}`);
        } else {
            writeLog(logger, `Could not retrieve or parse the chores: ${error}`)
        }
        return { error: 'Could not retrieve the chore data' };
    }
}

function computeSingleExpected(asOfDate, chores, people, assignExpected) {
    const offset = Math.floor((asOfDate - baseDate) / oneWeek)
    const expectedMap = {_offset:offset,_asOfDateValue:asOfDate,_baseDate:baseDate,_asOfDate:new Date(asOfDate).toISOString()}

    for (var i = 0; i < chores.length; i++) {
        let chore = chores[i]

        const reg = ((chores.length - (offset % chores.length)) + i) % chores.length

        let assigningTo = []
        if (people.length > reg && people[reg]) {
            let person = people[reg]
            if (person === 'Mom and Dad') person = (offset % 6) < 3 ? 'Mom' : 'Dad'  // Alternate every 3 weeks

            assigningTo.push(person)
        }

        if (assignExpected) chore.expected = assigningTo
        expectedMap[chore.id] = assigningTo
    }

    return expectedMap
}

function computeExpected(asOfDate, chores, people, weeksToCompute) {
    const choreMap = {}
    chores.forEach(chore => choreMap[chore.id] = chore)

    const weeks = weeksToCompute && weeksToCompute > 1 ? weeksToCompute : 1
    const allExpected = []

    for (let i = 0; i < weeks; i++) {
        allExpected.push(computeSingleExpected(asOfDate + (oneWeek * i), chores, people, i === 0))
    }

    return { choreMap, expectedMap: allExpected[0], allExpected }
}

function updateChore(user, chore, choreId, expected, revert, logger) {
    if (!chore) {
        writeLog(logger, 'Could not find a chore with ID=' + choreId)
        return false
    }

    let assigningTo
    if (revert) {
        if (!chore.previous) {
            writeLog(logger, 'No previous people for chore with ID=' + choreId)
            return false
        }

        assigningTo = chore.previous.splice(chore.previous.length - 1, 1)[0]
        if (chore.previous.length === 0) delete chore.previous
        writeLog(logger, `${user} reverted chore ${chore.title} assigned to ${(chore.people || []).join(', ')}, sending it back to ${assigningTo.join(', ')}`)
        chore.history = user + ' marked the chore as not completed, and sent back to ' + (assigningTo || []).join(' and ') + ' on ' + (new Date());
    } else {
        assigningTo = expected
        writeLog(logger, `${user} marked the chore ${chore.title} assigned to ${(chore.people || []).join(', ')} as complete and so we are assigning it to ${assigningTo.join(', ')}`)

        if (!chore.previous) chore.previous = []
        chore.previous.push(chore.people)
        while (chore.previous.length > 5) chore.previous.splice(0, 1)
        chore.history = user + ' marked the chore as completed by ' + (chore.people || []).join(' and ') + ' on ' + (new Date());
    }

    chore.people = assigningTo
    return true
}

async function computeChores(user, choreId, preview, revert, asOfDate, logger, getS3, updateChores, previewWeeks) {
    const validationError = validateRequest(user, choreId, preview, logger)
    if (validationError) return { error: validationError }

    const { chores, people, error: choresPeopleError } = await getChoresAndPeople(logger, getS3);
    if (choresPeopleError) return { error: choresPeopleError};

    const { choreMap, expectedMap, allExpected } = computeExpected(asOfDate, chores, people, previewWeeks)

    if (preview) return previewWeeks && previewWeeks > 1 ? allExpected : expectedMap
    if (!updateChore(user, choreMap[choreId], choreId, expectedMap[choreId], revert, logger)) return { error: 'No changes' }

    try {
        if (typeof updateChores !== 'function') updateChores = (content) => s3.send(new PutObjectCommand({Bucket: bucket, Key: choresS3Key, Body: JSON.stringify(content), ContentType: 'application/json'}))
        await updateChores(chores)
        writeLog(logger, 'Updated the chores')
    } catch (error) {
        writeLog(logger, 'Could not update the chores: ' + error)
        return { error: 'Could not update the chore data' }
    }

    return { success: true }
}

async function handler(event) {
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

    let previewWeeks = parseInt(query.previewWeeks)
    if (isNaN(previewWeeks) || !isFinite(previewWeeks)) {
        previewWeeks = 1
    }

    const computed = await computeChores(user, choreId, preview, revert, asOfDate, undefined, undefined, undefined, previewWeeks)

    if (!computed || computed.error) {
        return { statusCode: 200, body: JSON.stringify({ success: false, error: computed?.error }) }
    }

    return { statusCode: 200, body: JSON.stringify(computed) }
}

export { validateRequest, getChoresAndPeople, computeExpected, updateChore, computeChores, handler, bucket, s3 }
