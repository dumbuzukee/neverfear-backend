import { jwt } from "@elysiajs/jwt";

export default jwt({
    name: "jwt",
    secret: Bun.env["JWT_SECRET_KEY"]!,
    alg: "HS256",
    iat: true,
    exp: "1d",
});
