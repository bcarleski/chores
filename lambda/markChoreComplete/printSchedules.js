import { getChoresAndPeople, computeExpected } from './index.js';

const oneWeekInMillis = 7 * 24 * 60 * 60 * 1000;

function getSchedule(week, chores, people) {
    const asOfDate = Date.now() + (week * oneWeekInMillis)
    const { expectedMap: schedule } = computeExpected(asOfDate, chores, people)

    return schedule
}

function getCurrentSchedule(chores, people) {
    const asOfDate = Date.now()
    const { expectedMap } = computeExpected(asOfDate, chores, people)
    const schedule = {_asOfDateValue:Date.now(), _expected: expectedMap}

    chores.forEach(chore => schedule[chore.id] = chore.people)

    return schedule
}

function printSchedule(schedule) {
    const asOfDate = schedule['_asOfDateValue']
    const asOfDateValue = new Date(asOfDate)

    console.log(`\nSchedule for ${asOfDateValue} (${asOfDate})`)
    Object.getOwnPropertyNames(schedule).filter(key => !key.startsWith('_')).forEach(choreId => {
        const people = (schedule[choreId] || []).join(', ')
        const expectedPeople = ((schedule._expected || {})[choreId] || []).join(', ')
        const display = people + (expectedPeople && expectedPeople != people ? ` (EXPECTED: ${expectedPeople})` : '')
        console.log(`    ${choreId}: ${display}`)
    })
}

const { chores, people, error: choresPeopleError } = await getChoresAndPeople()
if (choresPeopleError) console.log('Could not get S3 data: ' + choresPeopleError)
else {
    printSchedule(getCurrentSchedule(chores, people))

    const numberOfWeeksToPrint = 4
    for (let i = 1; i < numberOfWeeksToPrint; i++) {
        printSchedule(getSchedule(i, chores, people))
    }
}