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
            </div>
        </div>
        <Schedule v-for="schedule in $page.chore.schedules" :key="schedule.id" :schedule="schedule" />
    </div>
  </div>
</template>

<script>
import ChevronLeft from '../components/ChevronLeft'
import Schedule from '../components/Schedule'
export default {
  components: { ChevronLeft, Schedule },
  computed: {
    people: function () {
      return (this.$page.chore.people || []).join(', ')
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
</style>

<page-query>
query($id: ID!) {
  chore: chores(id: $id) {
    id title people schedules { id title tasks }
  }
}
</page-query>