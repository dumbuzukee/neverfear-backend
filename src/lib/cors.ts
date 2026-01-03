import { cors } from "@elysiajs/cors";

export default cors({
    origin: Bun.env["ORIGIN_URL"],
    credentials: true,
});
