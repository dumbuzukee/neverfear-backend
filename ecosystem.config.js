module.exports = {
    apps: [
        {
            name: "neverfear-api",
            script: "src/index.ts",
            interpreter: "bun",
            env: {
                NODE_ENV: "production",
            },
        },
    ],
};
