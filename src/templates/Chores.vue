<template>
  <div class="detail-item">
    <div class="return">
      <g-link to="/">
        <ChevronLeft />
        <div>Return to chores list</div>
      </g-link>
    </div>
    <div v-if="chore">
        <h1>{{chore.title}}</h1>
        <div class="attribute-list">
            <div class="attribute-item">
                <div class="header">Assigned To:</div>
                <div class="simple-detail">{{people}}</div>
                <div v-if="chore.expected">
                    <div class="header">Expected:</div>
                    <div class="simple-detail">{{expected}}</div>
                </div>
                <div v-if="chore.history">
                    <div class="header">History:</div>
                    <div class="simple-detail">{{chore.history}}</div>
                </div>
                <div>
                    <GoogleLogin v-show="!loggedIn" :params="googleParams" :renderParams="googleRender" :onSuccess="googleLogin"></GoogleLogin>
                    <GoogleLogin v-show="loggedIn" :params="googleParams" :logoutButton="true" :onSuccess="googleLogout">Logout</GoogleLogin>
                    <button v-if="loggedIn" :click="markComplete" :disabled="markingComplete" class="spaced">Mark Complete</button>
                    <button v-if="loggedIn && chore.previous" :click="markComplete" :disabled="markingComplete" class="spaced">Mark Not Complete</button>
                    <div v-if="error" class="error">{{error}}</div>
                </div>
            </div>
        </div>
        <Schedule v-for="schedule in chore.schedules" :key="schedule.id" :schedule="schedule" />
    </div>
  </div>
</template>

<script>
import ChevronLeft from '../components/ChevronLeft'
import GoogleLogin from 'vue-google-login'
import Schedule from '../components/Schedule'
import axios from 'axios'
export default {
  components: { ChevronLeft, GoogleLogin, Schedule },
  computed: {
    people: function () {
      return (this.chore.people || []).join(', ')
    },
    expected: function () {
      return (this.chore.expected || []).join(', ')
    },
    chore: function () {
        const choreId = this.$page.chore.id
        const chore = this.chores.find(x => x.id === choreId)
        return chore || null
    }
  },
  data: function() {
      return {
          loggedIn: false,
          authToken: null,
          chores: [],
          markingComplete: false,
          error: null,
          googleParams: {
              client_id: process.env.GRIDSOME_API_CHORES_GOOGLE_AUTH_CLIENT_ID
          },
          googleRender: {
              width: 250,
              height: 50,
              longtitle: true
          }
      }
  },
  methods: {
      async markComplete () {
          const me = this
          me.error = null
          me.markingComplete = true

          try {
              const params = { id: me.$page.chore.id, token: me.authToken }
              const result = await axios.get(process.env.GRIDSOME_API_COMPLETE_URL, { params })
              if (result && result.success) await me.updateData()
              else if (result && result.error) me.error = result.error
              else me.error = 'Could not mark the chore complete.  An unknown error has occurred'
          } catch (e) {
              me.error = 'Could not mark complete - ' + error
          }

          me.markingComplete = false
      },
      async updateData() {
        try {
            const results = await axios.get(process.env.GRIDSOME_API_CHORES_DATA_URL + '?v=' + Date.now())
            this.chores = results.data
            if (localStorage) localStorage.carleskiChores = JSON.stringify(results.data)
        } catch (e) {
            console.log('Could not retrieve updated chores - ' + e)
        }
      },
      googleLogin: function(user) {
          const authResponse = user.getAuthResponse()
          if (localStorage) {
            const expiry = (Date.now() - 60000) + (authResponse.expires_at - authResponse.first_issued_at)
            localStorage.authResponse = JSON.stringify({ expires_at: expiry, id_token: authResponse.id_token })
          }

          this.authToken = authResponse.id_token
          this.loggedIn = true
      },
      googleLogout: function() {
          this.loggedIn = false
          this.authToken = null
      }
  },
  async mounted () {
    if (localStorage) {
      if (localStorage.carleskiChores) {
        try {
          this.chores = JSON.parse(localStorage.carleskiChores)
        } catch (e) {
          console.log('Could not get chores from local storage - ' + e)
        }
      }
      if (localStorage.authResponse) {
        try {
          const authResponse = JSON.parse(localStorage.authResponse)
          if (authResponse.expires_at > Date.now()) {
            this.authToken = authResponse.id_token
            this.loggedIn = true
          }
        } catch (e) {
          console.log('Could not get auth response from local storage - ' + e)
        }
      }
    }

    await this.updateData()
  }
}
</script>

<style scoped>
.detail-item {
    width: 90%;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    font-size: 18px;
}
.return {
    height: 36px;
    margin-bottom: 20px;
    font-size: 20px;
    text-align: left;
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
    display:block;
    position:relative;
    padding: 20px 5px;
    box-shadow:0 2px 0 -1px #ebebeb;
    text-align: left;
}
.attribute-item .header {
    display: inline-block;
    width: 150px;
    text-align: right;
    font-weight: bold;
    padding-right: 15px;
}
.attribute-item .simple-detail {
    display: inline-block;
    text-align: left;
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
}
</style>

<page-query>
query($id: ID!) {
  chore: chores(id: $id) {
    id
  }
}
</page-query>