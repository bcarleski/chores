import { computeChores } from './index.js';

const baseDate = 1774456000000;
const oneWeekInMillis = 7 * 24 * 60 * 60 * 1000;
const persistedChores = [];
let successCount = 0;
let failureCount = 0;

async function testChores() {
    return JSON.stringify([
        {"title":"Downstairs","id":"downstairs","people":["Caroline"],"schedules":[],"expected":["Caroline"],"previous":[["Ben"],["Caroline"],["Phineas"],["Kristopher"],["Ben"]],"history":"admin@carleski.com marked the chore as completed by Ben on Sun Mar 15 2026 18:59:04 GMT+0000 (Coordinated Universal Time)"},
        {"title":"Dishes","id":"dishes","people":["Ben"],"schedules":[],"expected":["Ben"],"previous":[["Phineas"],["Kristopher"],["Ben"],["Phineas"],["Kristopher"]],"history":"admin@carleski.com marked the chore as completed by Kristopher on Sat Mar 14 2026 22:07:13 GMT+0000 (Coordinated Universal Time)"},
        {"title":"Upstairs","id":"upstairs","people":["Kristopher"],"schedules":[],"expected":["Kristopher"],"previous":[["Phineas"],["Kristopher"],["Ben"],["Caroline"],["Phineas"]],"history":"admin@carleski.com marked the chore as completed by Phineas on Fri Mar 20 2026 01:22:51 GMT+0000 (Coordinated Universal Time)"},
        {"title":"Kitchen","id":"kitchen","people":["Phineas"],"schedules":[],"expected":["Phineas"],"previous":[["Caroline"],["Phineas"],["Kristopher"],["Ben"],["Caroline"]],"history":"admin@carleski.com marked the chore as completed by Caroline on Sat Mar 14 2026 22:07:16 GMT+0000 (Coordinated Universal Time)"}
    ])
}
async function testPeople() {
    return JSON.stringify([ "Ben", "Kristopher", "Phineas", "Caroline" ])
}
async function testGetS3(objectKey) {
    if (objectKey === 'chores.json') {
        return { Body: { transformToString: testChores } }
    }

    if (objectKey === 'people.json') {
        return { Body: { transformToString: testPeople } }
    }

    return null;
}

async function momDadChores() {
    return JSON.stringify([
        {"title":"Downstairs","id":"downstairs","people":["Caroline"],"schedules":[],"expected":["Caroline"],"previous":[["Ben"],["Caroline"],["Phineas"],["Kristopher"],["Ben"]],"history":"admin@carleski.com marked the chore as completed by Ben on Sun Mar 15 2026 18:59:04 GMT+0000 (Coordinated Universal Time)"},
        {"title":"Dishes","id":"dishes","people":["Mom"],"schedules":[],"expected":["Ben"],"previous":[["Phineas"],["Kristopher"],["Ben"],["Phineas"],["Kristopher"]],"history":"admin@carleski.com marked the chore as completed by Kristopher on Sat Mar 14 2026 22:07:13 GMT+0000 (Coordinated Universal Time)"},
        {"title":"Upstairs","id":"upstairs","people":["Kristopher"],"schedules":[],"expected":["Kristopher"],"previous":[["Phineas"],["Kristopher"],["Ben"],["Caroline"],["Phineas"]],"history":"admin@carleski.com marked the chore as completed by Phineas on Fri Mar 20 2026 01:22:51 GMT+0000 (Coordinated Universal Time)"},
        {"title":"Kitchen","id":"kitchen","people":["Phineas"],"schedules":[],"expected":["Phineas"],"previous":[["Caroline"],["Phineas"],["Kristopher"],["Ben"],["Caroline"]],"history":"admin@carleski.com marked the chore as completed by Caroline on Sat Mar 14 2026 22:07:16 GMT+0000 (Coordinated Universal Time)"}
    ])
}
async function momDadPeople() {
    return JSON.stringify([ "Mom and Dad", "Kristopher", "Phineas", "Caroline" ])
}
async function momDadGetS3(objectKey) {
    if (objectKey === 'chores.json') {
        return { Body: { transformToString: momDadChores } }
    }

    if (objectKey === 'people.json') {
        return { Body: { transformToString: momDadPeople } }
    }

    return null;
}

async function testUpdateChores(content) {
    const chores = JSON.parse(JSON.stringify(content)) // Make a copy so future changes don't affect our saved copy
    persistedChores.push(chores)
}

function logMessage(message, messages) {
    messages.push(message)

    if (process.argv && process.argv.length > 2 && process.argv[2] === 'debugLog') {
        console.log(message);
    }
}

function fail(messages, failureMessage) {
    messages.forEach(msg => console.log('        ' + msg.replace(/\n/g, `\n    `)))

    const failureMsg = failureMessage.replace(/\n/g, `\n    `);
    console.log(`    ${failureMsg}`);
    failureCount++;
}

async function runUserTest(name, user, preview, expectedError) {
    if (persistedChores.length) persistedChores.splice(0, persistedChores.length);
    const asOfDate = baseDate;
    console.log(`Running test ${name}`);

    const messages = [`Testing week 0 with asOfDate of ${new Date(asOfDate)}`]
    const body = await computeChores(user, 'dishes', preview, false, asOfDate, msg => logMessage(msg, messages), testGetS3, testUpdateChores);

    if (!body || body.error) {
        if (persistedChores.length) return fail(messages, `UNEXPECTED PERSISTED CHORES: ${JSON.stringify(persistedChores, null, 2)}`)
        if (expectedError) {
            if (body?.error == expectedError) {
                console.log('    SUCCESS');
                successCount++;
                return;
            } else return fail(messages, `UNEXPECTED ERROR: EXPECTED: '${expectedError}', ACTUAL:'${body?.error}'`)
        }
        return fail(messages, `BAD RESULT: ${JSON.stringify(body, null, 2)}`);
    }

    if (expectedError) return fail(messages, `MISSING ERROR: ${expectedError}`);
    if (preview && persistedChores.length) return fail(messages, `UNEXPECTED PERSISTED CHORES: ${JSON.stringify(persistedChores, null, 2)}`)
    if (!preview && !persistedChores.length) return fail(messages, 'MISSING PERSISTED CHORES')

    console.log('    SUCCESS');
    successCount++;
}

async function runTest(name, week, choreId, preview, revert, expected, previewWeeks, logger, getS3, updateChores) {
    if (persistedChores.length) persistedChores.splice(0, persistedChores.length);
    const asOfDate = baseDate + (week * oneWeekInMillis);
    console.log(`Running test ${name}`);

    const messages = [`Testing week ${week} with asOfDate of ${new Date(asOfDate)}`]
    const body = await computeChores('admin@carleski.com', choreId, preview, revert, asOfDate, logger || (msg => logMessage(msg, messages)), getS3 || testGetS3, updateChores || testUpdateChores, previewWeeks);

    if (!body || body.error) {
        if (persistedChores.length) return fail(messages, `UNEXPECTED PERSISTED CHORES: ${JSON.stringify(persistedChores, null, 2)}`)
        return fail(messages, `BAD RESULT: ${JSON.stringify(body, null, 2)}`);
    }

    const failures = {};

    if (preview) {
        if (persistedChores.length) return fail(messages, `UNEXPECTED PERSISTED CHORES: ${JSON.stringify(persistedChores, null, 2)}`)
        if (previewWeeks) {
            if (body.length !== previewWeeks) return fail(messages, `INCORRECT NUMBER OF PREVIEW WEEKS: EXPECTED: ${previewWeeks}, ACTUAL: ${body.length}`);
        } else {
            if (body['_asOfDateValue'] !== asOfDate) return fail(messages, `UNEXPECTED AS-OF DATE: ${body['_asOfDateValue']}`)

            Object.getOwnPropertyNames(expected).forEach(choreId => {
                const expectedPeople = JSON.stringify(expected[choreId])
                const actualPeople = JSON.stringify(body[choreId])

                if (expectedPeople != actualPeople) {
                    failures[choreId] = {EXPECTED: expectedPeople, ACTUAL: actualPeople}
                }
            });
        }
    } else {
        if (!persistedChores.length) return fail(messages, 'MISSING PERSISTED CHORES')
        if (persistedChores.length !== 1) return fail(messages, `TOO MANY PERSISTED CHORES: ${JSON.stringify(persistedChores, null, 2)}`)

        const actualData = {}
        persistedChores[0].forEach(chore => actualData[chore.id] = chore)

        Object.getOwnPropertyNames(expected).forEach(choreId => {
            const expChore = expected[choreId]
            const actChore = actualData[choreId]

            const expectedPeople = JSON.stringify(expChore.people)
            const actualPeople = JSON.stringify(actChore.people)

            const expectedPrevious = JSON.stringify(expChore.previous)
            const actualPrevious = JSON.stringify(actChore.previous)

            if (expectedPeople != actualPeople || expectedPrevious != actualPrevious) {
                const failure = {}

                if (expectedPeople != actualPeople) failure.people = {EXPECTED: expectedPeople, ACTUAL: actualPeople}
                if (expectedPrevious != actualPrevious) failure.previous = {EXPECTED: expectedPrevious, ACTUAL: actualPrevious}
                failures[choreId] = failure
            }
        });
    }

    if (Object.getOwnPropertyNames(failures).length > 0) {
        return fail(messages, `BAD DATA: ${JSON.stringify(failures, null, 2)}`)
    }

    console.log('    SUCCESS');
    successCount++;
}

async function runPreviewTest(name, week, expected) {
    await runTest(name, week, null, true, false, expected)
}

async function runMomDadTest(name, week, expected) {
    await runTest(name, week, null, true, false, expected, undefined, undefined, momDadGetS3)
}

async function runMultiPreviewTest(name, weeks) {
    await runTest(name, 0, null, true, false, null, weeks)
}

async function runRevertTest(name, week, choreId, expected) {
    await runTest(name, week, choreId, false, true, expected)
}

async function runUpdateTest(name, week, choreId, expected) {
    await runTest(name, week, choreId, false, false, expected)
}

console.log('Starting chore tests\n\n');

await runPreviewTest('Preview Last', -1, {downstairs:['Caroline'], dishes:['Ben'], upstairs:['Kristopher'], kitchen:['Phineas']});
await runPreviewTest('Preview Current', 0, {downstairs:['Phineas'], dishes:['Caroline'], upstairs:['Ben'], kitchen:['Kristopher']});
await runPreviewTest('Preview Next', 1, {downstairs:['Kristopher'], dishes:['Phineas'], upstairs:['Caroline'], kitchen:['Ben']});
await runPreviewTest('Preview Old', -154, {downstairs:['Ben'], dishes:['Kristopher'], upstairs:['Phineas'], kitchen:['Caroline']});
await runPreviewTest('Preview Future', 151, {downstairs:['Caroline'], dishes:['Ben'], upstairs:['Kristopher'], kitchen:['Phineas']});

await runMomDadTest('Mom/Dad Last', -1, {downstairs:['Caroline'], dishes:['Mom'], upstairs:['Kristopher'], kitchen:['Phineas']});
await runMomDadTest('Mom/Dad Current', 0, {downstairs:['Phineas'], dishes:['Caroline'], upstairs:['Mom'], kitchen:['Kristopher']});
await runMomDadTest('Mom/Dad Next', 1, {downstairs:['Kristopher'], dishes:['Phineas'], upstairs:['Caroline'], kitchen:['Dad']});

await runMultiPreviewTest('Multi-preview', 4);

await runRevertTest('Revert Dishes', 151, 'dishes', {dishes:{people:['Kristopher'],previous:[["Phineas"],["Kristopher"],["Ben"],["Phineas"]]}});

await runUpdateTest('Update Dishes Current', 1, 'dishes', {dishes:{people:['Phineas'],previous:[["Kristopher"],["Ben"],["Phineas"],["Kristopher"],["Ben"]]}});
await runUpdateTest('Update Dishes Next', 2, 'dishes', {dishes:{people:['Kristopher'],previous:[["Kristopher"],["Ben"],["Phineas"],["Kristopher"],["Ben"]]}});

await runUserTest('User Valid to Update', 'admin@carleski.com', false)
await runUserTest('User Not Valid to Update', 'ben.carleski@gmail.com', false, 'You are not allowed to update chore data')
await runUserTest('User Valid to Preview', 'ben.carleski@gmail.com', true)

console.log(`\n\n\nFinished all chore tests\nSUCCESS: ${successCount}\nFAILURES: ${failureCount}`);

if (failureCount > 0) {
    throw 'Had Failures';
}