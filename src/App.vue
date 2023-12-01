<script setup lang="ts">
import { onMounted } from 'vue';
import { useDataStore } from '@/stores/data';
import ChoreDetail from './components/ChoreDetail.vue';
import ChoreList from './components/ChoreList.vue';

const buildTimestamp = new Date().toLocaleString()
const store = useDataStore()
onMounted(() => store.refresh())
</script>

<template>
  <div class="layout">
    <ChoreDetail v-if="store.currentChore" />
    <ChoreList v-else />
  </div>
  <div class="footer">
    <div class="revision">
      Built {{ buildTimestamp }}
    </div>
    <div class="from-dates">
      Data From: {{store.lastRefresh}}
    </div>
  </div>
</template>

<style>
body {
  font-family: -apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  margin:0;
  padding:0;
  line-height: 1.5;
}

.layout {
  max-width: 760px;
  margin: 0 auto;
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 40px;
}

.nav__link {
  margin-left: 20px;
}

.footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 30px;
  background-color: white;
}

.revision {
  position: absolute;
  left: 10px;
  bottom: 10px;
  font-size: 10px;
}

.from-dates {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 9px;
}
</style>
