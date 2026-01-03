import { db } from "@/lib/prisma";
import { CategoryInsert, CategoryUpdate, CategoryUpdateProductsType } from "@/models/models.category";

export abstract class CategoryService {
    static create = async (data: CategoryInsert) => {
        return await db.categories
            .create({
                data,
            });
    };
    static getAll = async () => {
        return await db.categories
            .findMany();
    };
    static getById = async (categoryId: string) => {
        return await db.categories
            .findUnique({
                where: { id: categoryId },
            });
    };
    static update = async (categoryId: string, data: CategoryUpdate) => {
        return await db.categories
            .update({
                where: { id: categoryId },
                data,
            });
    };
    static updateProducts = async (
        categoryId: string,
        currentProducts: number,
        updateType: CategoryUpdateProductsType
    ) => {
        const updatedProducts = (updateType === "decrease")
            ? currentProducts - 1
            : currentProducts + 1;
        
        return await db.categories
            .update({
                where: { id: categoryId },
                data: {
                    products: updatedProducts,
                },
            });
    };
    static delete = async (categoryId: string) => {
        return await db.categories
            .delete({
                where: { id: categoryId },
            });
    };
};
