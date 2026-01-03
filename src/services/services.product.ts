import { db } from "@/lib/prisma";
import { ProductInsert, ProductUpdate, ProductUpdateStock } from "@/models/models.product";

export abstract class ProductService {
    static create = async (data: ProductInsert) => {
        return await db.products
            .create({
                data,
            });
    };
    static getAll = async (categoryId?: string, withOmit: boolean = true) => {
        return await db.products
            .findMany({
                where: (categoryId !== undefined)
                    ? { categoryId }
                    : undefined,
                omit: (withOmit)
                    ? { stock: true }
                    : { stock: false },
            });
    };
    static getById = async (productId: string, withOmit: boolean = true) => {
        return await db.products
            .findUnique({
                where: { id: productId },
                omit: (withOmit)
                    ? { stock: true }
                    : { stock: false },
            });
    };
    static update = async (productId: string, data: ProductUpdate) => {
        const available = data.stock.length;

        return await db.products
            .update({
                where: { id: productId },
                data: {
                    ...data,
                    available,
                },
            });
    };
    static updateStock = async (productId: string, data: ProductUpdateStock) => {
        return await db.products
            .update({
                where: { id: productId },
                data,
            });
    };
    static delete = async (productId: string) => {
        return await db.products
            .delete({
                where: { id: productId },
            });
    };
};
