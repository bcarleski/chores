<template>
  <div class="detail-item">
    <div class="return">
      <g-link to="/">
        <ChevronLeft />
        <div>Return to chores list</div>
      </g-link>
    </div>
    <div v-if="!chore">Loading the chore...</div>
    <div v-else>
        <h1>{{chore.name}} from {{startDate | formatDate}} to {{endDate | formatDate}}</h1>
        <div class="attribute-list">
            <div class="attribute-item">
                <div class="header">Assigned To:</div>
                <div class="simple-detail">{{chore.assignedTo}}</div>
            </div>
            <div class="attribute-item">
                <div class="header">Status:</div>
                <div class="simple-detail">{{chore.complete ? 'Passed Off' : 'Not Passed Off'}}</div>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import ChevronLeft from '../components/ChevronLeft'
export default {
  components: { ChevronLeft, Schedule, History },
  data: function () {
    return {
      choreId: this.$route.params.choreId,
      state: store.state
    }
  },
  computed: {
    chore: function () {
      const choreId = this.choreId
      const week = this.state.currentWeek
      const chores = week && week.chores
      if (chores && chores.length && choreId) {
        for (let i = 0; i < chores.length; i++) {
          if (chores[i].choreId === choreId) {
            return chores[i]
          }
        }
      }

      return null
    },
    startDate: function () {
      const weekId = parseInt(this.state.currentWeekId)
      if (!Number.isInteger(weekId)) return null
      const sunday = new Date((weekId - 0.5) * 7 * 24 * 60 * 60 * 1000)
      return new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate())
    },
    endDate: function () {
      const startDate = this.startDate
      return new Date(startDate.getTime() + (6 * 24 * 60 * 60 * 1000))
    },
    backLink: function () {
      return parseInt(this.state.currentWeekId) !== parseInt(this.state.homeWeekId) ? '/list/' + this.state.currentWeekId : '/'
    }
  },
  filters: {
    formatDate: function (dt) {
      const m = dt.getMonth() + 1
      const d = dt.getDate()
      return (m < 10 ? '0' : '') + m + '/' + (d < 10 ? '0' : '') + d + '/' + dt.getFullYear()
    }
  },
  methods: {
    loadWeek: function () {
      store.setWeek(this.$route.params.weekId)
    }
  },
  watch: {
    $route: function (to, from) {
      this.loadWeek()
    }
  },
  created: async function () {
    if (!(await store.verifyUser())) window.location = '/login'
  },
  mounted: function () {
    this.loadWeek()
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
</style>

<page-query>
query {
  chore: chores(id:"kitchen") {
    id title people tasks { id title subTasks }
  }
}
</page-query>