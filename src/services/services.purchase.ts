import { db } from "@/lib/prisma";
import { PurchaseInsert } from "@/models/models.purchase";

export abstract class PurchaseService {
    static create = async (data: PurchaseInsert) => {
        return await db.purchases
            .create({
                data,
            });
    };
    static getAll = async (userId?: string) => {
        return await db.purchases
            .findMany({
                where: (userId !== undefined)
                    ? { userId }
                    : undefined,
            });
    };
};
