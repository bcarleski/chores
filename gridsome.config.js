// This is where project configuration and plugin options are located.
// Learn more: https://gridsome.org/docs/config

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

module.exports = {
  siteName: 'Carleski Chores',
  plugins: [
    {
      use: 'gridsome-plugin-pwa',
      options: {
        disableServiceWorker: false,
        serviceWorkerPath: 'service-worker.js',
        cachedFileTypes: 'js,json,css,html,png,jpg,jpeg,svg,gif',
        disableTemplatedUrls: false,
        manifestPath: 'manifest.json',
        title: 'Carleski Chores',
        startUrl: '/',
        display: 'standalone',
        statusBarStyle: 'default',
        themeColor: '#000088',
        backgroundColor: '#ffffff',
        icon: 'static/favicon.png',
        shortName: 'Chores',
        description: 'Chore tracking for the Carleski family',
        categories: ['family'],
        lang: 'en-US'
      }
    }
  ],
  templates: {
    Chores: '/chore/:id'
  }
}
