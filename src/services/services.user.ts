import { db } from "@/lib/prisma";
import { hashValue } from "@/lib/utils";
import { UserInsert, UserUpdateBalance, UserUpdateRole } from "@/models/models.user";

export abstract class UserService {
    static create = async (data: UserInsert) => {
        const userData = {
            ...data,
        };

        userData.password = await hashValue(data.password);

        return await db.users
            .create({
                data: userData,
            });
    };
    static getAll = async () => {
        return await db.users
            .findMany({
                omit: { password: true },
            });
    };
    static getById = async (userId: string) => {
        return await db.users
            .findUnique({
                where: { id: userId },
            });
    };
    static getByOthers = async ({ email, username }: { email?: string, username?: string }) => {
        return await db.users
            .findUnique({
                where: { email, username },
            });
    };
    static updateBalance = async (userId: string, data: UserUpdateBalance) => {
        return await db.users
            .update({
                where: { id: userId },
                data,
            });
    };
    static updateRole = async (userId: string, data: UserUpdateRole) => {
        return await db.users
            .update({
                where: { id: userId },
                data,
            });
    };
    static delete = async (userId: string) => {
        return await db.users
            .delete({
                where: { id: userId },
            });
    };
};
