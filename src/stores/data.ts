import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { decodeCredential, type CallbackTypes, googleLogout } from 'vue3-google-login'

// Structure from https://developers.google.com/identity/gsi/web/reference/js-reference#CredentialResponse
interface GoogleJwt {
  readonly payload: GoogleJwtPayload
}
interface GoogleJwtPayload {
  readonly iat: number,
  readonly exp: number
}
export interface ChoreSchedule {
  readonly id: string,
  readonly title: string,
  readonly tasks: string[]
}
export interface Chore {
  readonly id: string,
  readonly title: string,
  readonly people: string[],
  readonly schedules: ChoreSchedule[],
  readonly previous?: string[],
  readonly history?: string[]
}
const markCompletedUrl = 'https://af20ym4v5b.execute-api.us-west-2.amazonaws.com/markChoreComplete'
const previewExpectedUrl = 'https://af20ym4v5b.execute-api.us-west-2.amazonaws.com/previewExpected'
const choresDataUrl = 'https://d28hmnnjtzs243.cloudfront.net/chores.json'
const peopleDataUrl = 'https://d28hmnnjtzs243.cloudfront.net/people.json'
const lastRefreshKey = 'LAST_REFRESH_TIME'
const credentialKey = 'USER_CREDENTIALS'

async function getCacheableData<Type>(url: string, defaultValue: Type): Promise<Type> {
  try {
    const resp = await fetch(url)
    const data = await resp.json()
    localStorage.setItem(url, JSON.stringify(data))
    return data
  } catch (e) {
    return getCachedData(url, defaultValue)
  }
}

function getCachedData<Type>(url: string, defaultValue: Type): Type {
  const data = localStorage.getItem(url)
  return data ? JSON.parse(data) : defaultValue
}

function getCachedCredentials() : string | null {
  const data = localStorage.getItem(credentialKey)
  const creds = data ? JSON.parse(data) : null

  if (creds && typeof creds.credential === 'string' && typeof creds.expiry === 'number' && creds.expiry > Date.now()) {
    return <string>creds.credential
  }

  return null
}

export const useDataStore = defineStore('data', () => {
  const chores = ref<Chore[]>(getCachedData<Chore[]>(choresDataUrl, []))
  const people = ref<string[]>(getCachedData<string[]>(peopleDataUrl, []))
  const expectedPeople = ref<{[key: string]: string[]}>(getCachedData<{[key: string]: string[]}>(previewExpectedUrl, {}))
  const currentChoreIdx = ref(-1)
  const cachedLastRefreshTime = localStorage.getItem(lastRefreshKey)
  const lastRefreshTime = ref(cachedLastRefreshTime ? <number>JSON.parse(cachedLastRefreshTime) : -1)
  const lastRefresh = computed(() => lastRefreshTime.value > 0 ? new Date(lastRefreshTime.value).toLocaleString() : '')
  const loggedIn = computed(() => credential.value ? true : false)
  const credential = ref(getCachedCredentials())

  const currentChore = computed(() => {
    if (currentChoreIdx.value >= 0 && currentChoreIdx.value < chores.value.length) {
      return chores.value[currentChoreIdx.value]
    }
    return null
  })
  const currentExpectedPeople = computed(() => {
    const currentChoreId = currentChore.value?.id
    if (currentChoreId) {
      const expectedPersons = expectedPeople.value[currentChoreId]
      if (expectedPersons) {
        return expectedPersons
      }
    }
    return null
  })
 
  async function refresh() {
    await refreshPeople()
    await refreshChores()
    await refreshExpectedPeople()
    const now = Date.now()
    lastRefreshTime.value = now
    localStorage.setItem(lastRefreshKey, '' + now)
  }

  function selectChore(id?: string) {
    if (id) {
      currentChoreIdx.value = chores.value.findIndex(chore => chore.id === id)
    } else {
      currentChoreIdx.value = -1
    }

    refresh()
  }
 
  async function refreshChores() {
    try {
      const newChores = await getCacheableData<Chore[]>(choresDataUrl, [])

      chores.value.splice(0, chores.value.length)
      chores.value.push(...newChores)
    } catch (e) {
      console.log('Could not refresh chores', e)
    }
  }
 
  async function refreshPeople() {
    try {
      const newPeople = await getCacheableData<string[]>(peopleDataUrl, [])

      people.value.splice(0, people.value.length)
      people.value.push(...newPeople)
    } catch (e) {
      console.log('Could not refresh people', e)
    }
  }
 
  async function refreshExpectedPeople() {
    try {
      if (chores.value.length === 0) {
        return
      }

      const newExpectedPeople = await getCacheableData<{[key: string]: string[]}>(previewExpectedUrl, {})

      chores.value.forEach(chore => {
        const newPerson = newExpectedPeople[chore.id]
        if (newPerson) {
          expectedPeople.value[chore.id] = newPerson
        }
      })
    } catch (e) {
      console.log('Could not refresh expected people', e)
    }
  }

  async function markChore(complete: boolean) : Promise<Response | null> {
    const choreId = currentChore.value?.id
    const authToken = credential.value
    if (!choreId || !authToken) return null;

    return await fetch(markCompletedUrl + '?' + new URLSearchParams({
      revert: '' + !complete,
      id: choreId,
      token: authToken
    }))
  }

  function handleGoogleLogin(response: CallbackTypes.CredentialPopupResponse) {
    const cred = response.credential
    credential.value = cred

    const parsed = <GoogleJwt>decodeCredential(cred)
    const expiry = (Date.now() - 60000) + (parsed.payload.exp - parsed.payload.iat)
    localStorage.setItem(credentialKey, JSON.stringify({expiry, credential: cred}))
  }

  function performGoogleLogout() {
    localStorage.removeItem(credentialKey)
    credential.value = null
    googleLogout()
  }

  return { chores, people, currentChore, currentExpectedPeople, lastRefresh, loggedIn, refresh, selectChore, markChore, handleGoogleLogin, performGoogleLogout }
})
