module.exports = {
    apps: [
      {
        name: "API",
        script: "npm",
        cwd: ".",
        automation: false,
        args: "run start",
        max_memory_restart: "1G",
        watch: false,
        log_date_format: "DD-MM HH:mm:ss.SSS",
        autorestart: false,
        env: {
          PORT: 5000,
          NODE_ENV: "development",
        },
        env_production: {
          PORT: 4000,
          NODE_ENV: "production",
        },
      },
    ],
  };
  