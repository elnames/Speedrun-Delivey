module.exports = {
  apps: [
    {
      name: 'speedrun-backend',
      script: 'dist/main.js',
      cwd: '/home/nms/proyectos/speedrun-delivery/sd-backend',
      env: {
        NODE_ENV: 'production',
        PORT: 3006,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
    },
    {
      name: 'speedrun-frontend',
      script: 'npx',
      args: 'serve -s ../sd-frontend/dist -l 3005',
      cwd: '/home/nms/proyectos/speedrun-delivery/sd-backend',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};


