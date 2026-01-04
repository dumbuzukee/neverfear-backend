import { CookieOptions } from "elysia";

export async function hashValue(value: string) {
    return await Bun.password.hash(value, {
        algorithm: "bcrypt",
        cost: 10,
    });
};

export async function compareValues(value: string, hashedValue: string) {
    return await Bun.password.verify(value, hashedValue);
};

export const cookieConfig = (): CookieOptions => ({
    domain: ".anastassy.com",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 86400,
    path: "/"
});
