module.exports = {
    apps: [
        {
            name: "neverfear-backend",
            script: "src/index.ts",
            interpreter: "bun",
            env: {
                NODE_ENV: "production",
            },
        },
    ],
};
