import { t } from "elysia";

export const ProductTypeBody = t.Enum({
    game_account: "game_account",
    mystery_box: "mystery_box",
    redemption_code: "redemption_code",
});

export const CreatePurchaseBody = t.Object({
    userId: t.String(),
    productId: t.String(),
    productName: t.String(),
    productType: ProductTypeBody,
    productPrice: t.Number(),
    productQuantity: t.Number(),
    productTotalAmount: t.Number(),
    productInfo: t.Array(t.String()),
});

export type PurchaseInsert = typeof CreatePurchaseBody.static;
