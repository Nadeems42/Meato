module.exports = {
    apps: [
        {
            name: "vaagai-backend",
            script: "./server.js",
            instances: 1, // Or 'max' for cluster mode
            autorestart: true,
            watch: false,
            max_memory_restart: "1G",
            env: {
                NODE_ENV: "development",
                PORT: 8000
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 8000
            }
        }
    ]
};
