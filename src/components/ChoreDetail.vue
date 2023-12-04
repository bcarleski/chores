<script setup lang="ts">
import { useDataStore } from '@/stores/data'
import { computed, ref, type Ref } from 'vue';
import ScheduleDetail from './ScheduleDetail.vue';
import ChevronLeft from './icons/ChevronLeft.vue';

const store = useDataStore()
const chore = computed(() => store.currentChore)
const markingChore = ref(false)
const error: Ref<string | null> = ref(null)

const previous = computed(() => {
  if (chore.value?.previous) {
    return chore.value.previous[0].join(', ')
  }

  return ''
})

function setError(message: string) {
  error.value = message
  setTimeout((err: Ref<string | null>) => err.value = null, 5000, error)
}
async function markChore(complete: boolean, priorWeek: boolean) {
  markingChore.value = true
  try {
    const resp = await store.markChore(complete, priorWeek)
    if (!resp || resp.status >= 400) return setError(resp?.statusText || 'An unknown error has occured; please try again later')
    const data = await resp.json()
    if (!data || !data.success) return setError(data?.error || 'An unknown error has occured; please try again later')

    await store.refresh()
  } finally {
    markingChore.value = false
  }
}
</script>

<template>
  <div class="detail-item">
    <div class="return">
      <a @click.stop.prevent="store.selectChore()">
        <ChevronLeft />
        <div>Return to chores list</div>
      </a>
    </div>
    <h1>{{ chore?.title }}</h1>
    <div class="attribute-list">
      <div class="attribute-item">
        <div class="header">Assigned To:</div>
        <div class="simple-detail">{{ chore?.people.join(', ') }}</div>
        <div v-if="store.currentExpectedPeople">
          <div class="header">Expected:</div>
          <div class="simple-detail">{{ store.currentExpectedPeople.join(', ') }}</div>
        </div>
        <div v-if="chore?.previous">
          <div class="header">Previously:</div>
          <div class="simple-detail">{{ previous }}</div>
        </div>
        <div v-if="chore?.history">
          <div class="header">History:</div>
          <div class="simple-detail">{{ chore.history }}</div>
        </div>
        <div>
          <GoogleLogin v-show="!store.loggedIn" :callback="store.handleGoogleLogin" prompt />
          <button v-if="store.loggedIn" @click="store.performGoogleLogout" class="spaced">
            Logout
          </button>
          <button v-if="store.loggedIn" @click="markChore(true, false)" :disabled="markingChore" class="spaced">
            Mark Complete
          </button>
          <button v-if="store.loggedIn && chore?.previous" @click="markChore(false, false)" :disabled="markingChore"
            class="spaced">
            Mark Not Complete
          </button>
          <button v-if="store.loggedIn" @click="markChore(true, true)" :disabled="markingChore" class="spaced">
            Mark Last Week Complete
          </button>
          <div v-if="error" class="error">{{ error }}</div>
        </div>
      </div>
    </div>
    <ScheduleDetail v-for="schedule in chore?.schedules" :key="schedule.id" :schedule="schedule" />
  </div>
</template>


<style scoped>
.from-dates {
  margin-top: 50px;
  font-size: 9px;
}

.detail-item {
  width: 90%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  font-size: 18px;
}

.return {
  background-color: white;
  height: 36px;
  font-size: 20px;
  text-align: left;
  position: fixed;
  top: 0;
}

.return div {
  display: inline-block;
  position: relative;
  top: -4px;
  color: #aaa;
}

.return svg {
  height: 24px;
  width: 24px;
  color: #aaa;
}

.attribute-item {
  display: block;
  position: relative;
  padding: 20px 5px;
  box-shadow: 0 2px 0 -1px #ebebeb;
  text-align: left;
}

.attribute-item .header {
  display: inline-block;
  width: 150px;
  text-align: right;
  font-weight: bold;
  padding-right: 15px;
  vertical-align: top;
}

.attribute-item .simple-detail {
  display: inline-block;
  text-align: left;
  max-width: 500px;
}

button {
  padding: 8px 12px;
  font-size: 18px;
  top: 8px;
  left: 45px;
  position: relative;
}

.spaced {
  margin-left: 20px;
}

.error {
  color: red
}</style>