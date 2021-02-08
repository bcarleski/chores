// Server API makes it possible to hook into various parts of Gridsome
// on server-side and add custom data to the GraphQL data layer.
// Learn more: https://gridsome.org/docs/server-api/

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

module.exports = function (api) {
  api.loadSource(async ({ addCollection }) => {
    // Use the Data Store API here: https://gridsome.org/docs/data-store-api/
    addJson(addCollection, './src/data/chores.json', 'Chores')
    addJson(addCollection, './src/data/people.json', 'Persons')
  })

  api.createPages(({ createPage }) => {
    // Use the Pages API here: https://gridsome.org/docs/pages-api/
  })
}

function addJson(addCollection, jsonPath, typeName) {
  const data = require(jsonPath)
  const collection = addCollection({typeName})

  for (const item of data) collection.addNode(item)
}