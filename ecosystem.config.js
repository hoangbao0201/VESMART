module.exports = {
  apps: [
    {
      name: "vesmart-be",
      cwd: "/var/www/vesmart/be",
      script: "dist/src/main.js",
      instances: 1,
      exec_mode: "fork",
      env: { NODE_ENV: "production", PORT: 3001 },
      max_memory_restart: "300M",
    },
    {
      name: "vesmart-fe",
      cwd: "/var/www/vesmart/fe",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 1,
      exec_mode: "fork",
      env: { NODE_ENV: "production", PORT: 3000 },
      max_memory_restart: "450M",
    },
  ],
};
