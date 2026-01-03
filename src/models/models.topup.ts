import { t } from "elysia";

export const CreateTopupBody = t.Object({
    userId: t.String(),
    payload: t.String(),
    transRef: t.String(),
    transDate: t.Date(),
    amount: t.Number(),
    name: t.String(),
});

export type TopupInsert = typeof CreateTopupBody.static;
