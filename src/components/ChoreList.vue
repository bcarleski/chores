<script setup lang="ts">
import ChoreItem from './ChoreItem.vue';
import { useDataStore } from '@/stores/data';

const store = useDataStore()
</script>

<template>
  <div class="listContainer">
    <div>
      <h1>Current Chore List</h1>
      <div class="chore-list">
        <ChoreItem v-for="chore in store.chores" :key="chore.id" :chore="chore" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.listContainer {
  width: 90%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  font-size: 18px;
}
</style>