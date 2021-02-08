<template>
  <div class="detail-item">
    <div class="return">
      <g-link to="/">
        <ChevronLeft />
        <div>Return to chores list</div>
      </g-link>
    </div>
    <div>
        <h1>{{$page.chore.title}}</h1>
        <div class="attribute-list">
            <div class="attribute-item">
                <div class="header">Assigned To:</div>
                <div class="simple-detail">{{people}}</div>
                <div>
                    <GoogleLogin v-show="!loggedIn" :params="googleParams" :renderParams="googleRender" :onSuccess="googleLogin"></GoogleLogin>
                    <GoogleLogin v-show="loggedIn" :params="googleParams" :logoutButton="true" :onSuccess="googleLogout">Logout</GoogleLogin>
                    <a v-show="loggedIn" :href="completeUrl"><button>Mark Complete</button></a>
                </div>
            </div>
        </div>
        <Schedule v-for="schedule in $page.chore.schedules" :key="schedule.id" :schedule="schedule" />
    </div>
  </div>
</template>

<script>
import ChevronLeft from '../components/ChevronLeft'
import GoogleLogin from 'vue-google-login'
import Schedule from '../components/Schedule'
export default {
  components: { ChevronLeft, GoogleLogin, Schedule },
  computed: {
    people: function () {
      return (this.$page.chore.people || []).join(', ')
    },
    completeUrl: function () {
        return process.env.GRIDSOME_API_COMPLETE_URL + '?id=' + this.$page.chore.id + '&token=' + this.authToken
    }
  },
  data: function() {
      return {
          loggedIn: false,
          authToken: null,
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
      googleLogin: function(user) {
          this.authToken = user.getAuthResponse().id_token
          this.loggedIn = true
      },
      googleLogout: function() {
          this.loggedIn = false
          this.authToken = null
      }
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
</style>

<page-query>
query($id: ID!) {
  chore: chores(id: $id) {
    id title people schedules { id title tasks }
  }
}
</page-query>