<script setup lang="ts">
import type { Chore } from '@/stores/data';
import { useDataStore } from '@/stores/data';
import InfoCircle from './icons/InfoCircle.vue';

const store = useDataStore()

defineProps<{
  chore: Chore
}>()
</script>

<template>
  <span class="chore-wrap">
    <a @click.stop.prevent="store.selectChore(chore.id)">
      <label :for="chore.id" class="chore">
        {{ chore.title }}<br /><strong>{{ chore.people.join(', ') }}</strong>
      </label>
      <div class="chore-details" title="details">
          <div>
              <InfoCircle />
          </div>
      </div>
    </a>
  </span>
</template>

<style scoped>
a, a:visited {
  color: black;
}

.chore-wrap{
    display:block;
    position:relative;
    padding-left:35px;
    box-shadow:0 2px 0 -1px #ebebeb;
    text-align: left;
    cursor: pointer;
}
.chore-wrap:last-of-type{
    box-shadow:none;
}
.chore{
    display:inline-block;
    font-weight:200;
    font-size:18px;
    padding:20px 5px;
    position:relative;
    vertical-align: middle;
    cursor: pointer;
}
.chore:before{
    content:'';
    display:block;
    position:absolute;
    top:calc(50% + 1px);
    left:0;
    width:0%;
    height:1px;
    background:#cd4400;
    transition:.25s ease-in-out;
    cursor: pointer;
}

/* Details Link */
.chore-details{
    display:block;
    position:absolute;
    height:36px;
    width:100px;
    line-height:36px;
    right:0;
    top:30px;
    text-align:right;
    color:#d8d8d8;
    cursor: pointer;
}
.chore-details div {
    display:inline-block;
}
.chore-details svg {
    color:#d8d8d8;
    width: 36px;
    height: 36px;
    margin-left: 8px;
}
.chore-wrap:hover .chore-details svg{
    color:#0eb0b7;
}
</style>