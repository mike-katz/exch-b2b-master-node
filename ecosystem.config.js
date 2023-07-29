module.exports = {
    apps: [
      {
        name: "EXCH_B2B_MASTER_ADMIN",
        script: "npm",
        cwd: ".",
        time: true,
        args: "run start",
        max_memory_restart: "1G",
        watch: false,
        log_date_format: "DD-MM HH:mm:ss.SSS",
        autorestart: true,
        env: {
          PORT: 5000,
          NODE_ENV: "production",
        },
        env_production: {
          PORT: 4000,
          NODE_ENV: "development",
        },
      },
    ],
  };
  