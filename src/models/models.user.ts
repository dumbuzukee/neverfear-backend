import { t } from "elysia";

export const LoginBody = t.Object({
    username: t.String(),
    password: t.String(),
    turnstileToken: t.String(),
});

export const RegisterBody = t.Object({
    email: t.String(),
    username: t.String(),
    password: t.String(),
    turnstileToken: t.String(),
});

export const UpdateBalanceBody = t.Object({
    amount: t.Number(),
    turnstileToken: t.String(),
});

export const UpdateRoleBody = t.Object({
    role: t.Enum({
        "admin": "admin",
        "customer": "customer",
        "guest": "guest",
    }),
    turnstileToken: t.String(),
});

export const DeleteUserBody = t.Object({
    turnstileToken: t.String(),
});

export const PurchaseItemBody = t.Object({
    quantity: t.Number(),
    turnstileToken: t.String(),
});

export const TopupBody = t.Object({
    amount: t.Number(),
    payload: t.String(),
    turnstileToken: t.String(),
});

export const UserParams = t.Object({
    userId: t.String(),
});

export type Role =
    "dev" |
    "admin" |
    "customer" |
    "guest";

export type UserInsert = {
    email: string;
    username: string;
    password: string;
};

export type UserUpdateBalance = {
    balance: number;
    totalBalance: number;
};

export type UserUpdateRole = {
    role: Exclude<Role, "dev">;
};
