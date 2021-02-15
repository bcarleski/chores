<template>
  <Layout>
    <div class="listContainer">
      <div>
        <h1>Current Chore List</h1>
        <div class="chore-list">
          <ChoreItem v-for="chore in chores" :key="chore.id" :chore="chore" />
        </div>
      </div>
    </div>
  </Layout>
</template>

<script>
import ChoreItem from '../components/ChoreItem'
import axios from 'axios'

export default {
  components: { ChoreItem },
  data: function() {
    return {
      chores: []
    }
  },
  metaInfo: {
    title: 'Carleski Chore Chart'
  },
  methods: {
    async updateData() {
      try {
        const results = await axios.get(process.env.GRIDSOME_API_CHORES_DATA_URL + '?v=' + Date.now())
        this.chores = results.data
        if (localStorage) localStorage.carleskiChores = JSON.stringify(results.data)
      } catch (e) {
        console.log('Could not retrieve updated chores - ' + e)
      }

      const chores = this.chores
      const pages = this.$page.chores.edges
      for (let i = 0; i < chores.length; i++) {
        const chore = chores[i]
        const page = pages.find(x => x.node.id === chore.id)
        if (page) chore.path = page.node.path
      }
    }
  },
  async mounted () {
    if (localStorage && localStorage.carleskiChores) {
      try {
        this.chores = JSON.parse(localStorage.carleskiChores)
      } catch (e) {
        console.log('Could not get chores from local storage - ' + e)
      }
    }

    await this.updateData()
  },
  async beforeRouteUpdate(to, from, next) {
    await this.updateData()
    next()
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
      node { id path }
    }
  }
}
</page-query>