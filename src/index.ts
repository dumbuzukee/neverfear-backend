import { Elysia } from "elysia";

import cors from "./lib/cors";
import usersPlugin from "./api/users";
import categoriesPlugin from "./api/categories";
import productsPlugin from "./api/products";

const app = new Elysia()
    .use(cors)
    .group(
        "/api/v1/neverfear", (app) =>
            app
            .group(
                "/en", (app) =>
                    app
                    .use(categoriesPlugin("en"))
                    .use(productsPlugin("en"))
                    .use(usersPlugin("en"))
            )
            .group(
                "/th", (app) =>
                    app
                    .use(categoriesPlugin("th"))
                    .use(productsPlugin("th"))
                    .use(usersPlugin("th"))
            )
    )
    .listen(3001);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
