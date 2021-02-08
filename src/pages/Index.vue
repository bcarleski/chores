<template>
  <Layout>
    <div class="listContainer">
      <div>
        <h1>Current Chore List</h1>
        <div class="chore-list">
          <ChoreItem v-for="chore in $page.chores.edges" :key="chore.node.id" :chore="chore.node" />
        </div>
      </div>
    </div>
  </Layout>
</template>

<script>
import ChoreItem from '../components/ChoreItem'
export default {
  components: { ChoreItem },
  data: function() {
    return {
      chores: []
    }
  },
  metaInfo: {
    title: 'Carleski Chore Chart'
  }
}
</script>

<style scoped>
.listContainer {
    width: 90%;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    font-size: 18px;
}

.change-week {
  width: 100%;
  height: 12px;
  font-size: 0.8em;
  margin: 20px 0;
  position: relative;
}

.prev-week, .next-week {
  position: absolute;
}
.prev-week {
  left: 0;
}
.next-week {
  right: 0;
}
</style>

<page-query>
query {
  chores: allChores {
    edges {
      node { title id people path }
    }
  }
}
</page-query>