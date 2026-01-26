module.exports = {
    apps: [{
        name: "hirespark-backend",
        script: "./server.js",
        cwd: "./",
        env: {
            NODE_ENV: "production",
            PORT: 5000
        }
    }]
}
