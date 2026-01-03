import { t } from "elysia";

export const ProductStatusBody = t.Enum({
    active: "active",
    inactive: "inactive",
});

export const ProductTypeBody = t.Enum({
    game_account: "game_account",
    mystery_box: "mystery_box",
    redemption_code: "redemption_code",
});

export const CreateProductBody = t.Object({
    name: t.String(),
    description: t.String(),
    image: t.String(),
    recommended: t.Boolean(),
    type: ProductTypeBody,
    price: t.Number(),
    status: ProductStatusBody,
    categoryId: t.String(),
    turnstileToken: t.String(),
});

export const UpdateProductBody = t.Object({
    name: t.String(),
    description: t.String(),
    image: t.String(),
    recommended: t.Boolean(),
    price: t.Number(),
    stock: t.Array(t.String()),
    status: ProductStatusBody,
    turnstileToken: t.String(),
});

export const DeleteProductBody = t.Object({
    turnstileToken: t.String(),
});

export const ProductParams = t.Object({
    productId: t.String(),
});

export type Status =
    "active" |
    "inactive";

export type ProductType =
    "game_account" |
    "mystery_box" |
    "redemption_code";

export type ProductInsert = {
    name: string;
    description: string;
    image: string;
    recommended: boolean;
    type: ProductType;
    price: number;
    status: Status;
    categoryId: string;
};

export type ProductUpdate = {
    name: string;
    description: string;
    image: string;
    recommended: boolean;
    price: number;
    stock: string[];
    status: Status;
};

export type ProductUpdateStock = {
    availble: number;
    stock: string[];
};
