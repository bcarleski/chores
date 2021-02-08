<template>
    <div class="schedule">
        <div class="header">{{schedule.title}}</div>
        <div class="tasks">
            <ol>
                <li v-for="(task, index) in schedule.tasks" :key="index">{{task}}</li>
            </ol>
        </div>
    </div>
</template>

<script>
export default {
  props: ['schedule']
}
</script>

<style scoped>
.schedule {
    display:block;
    position:relative;
    box-shadow:0 2px 0 -1px #ebebeb;
}
.schedule > .header {
    font-size: 24px;
    font-weight: bold;
    display:block;
    position:relative;
    margin: 10px 5px;
    padding: 8px 0;
    box-shadow:0 2px 0 -1px #ebebeb;
}
</style>
