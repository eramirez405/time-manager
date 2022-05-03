module.exports = {
  apps: [
    {
      name: "twiliotimemanager",
      script: "server.js",
      watch: ".",
      ignore_watch: ["node_modules", "reports"],
      env: {
        HOST: "apps.ualett.com",
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
  ],

  deploy: {
    production: {},
  },
};
