import { db } from "@/lib/prisma";
import { TopupInsert } from "@/models/models.topup";

export abstract class TopupService {
    static create = async (data: TopupInsert) => {
        return await db.topups
            .create({
                data,
            });
    };
    static getAll = async (userId?: string) => {
        return await db.topups
            .findMany({
                where: (userId !== undefined)
                    ? { userId }
                    : undefined,
            });
    };
    static getByPayload = async (payload: string) => {
        return await db.topups
            .findUnique({
                where: { payload },
            });
    };
    static getByTransRef = async (transRef: string) => {
        return await db.topups
            .findUnique({
                where: { transRef },
            });
    };
};
