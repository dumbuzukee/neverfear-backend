import { Elysia } from "elysia";
import { authentication } from "@/lib/auth";
import { validator } from "@/lib/validator";
import { CategoryParams, CreateCategoryBody, DeleteCategoryBody, UpdateCategoryBody } from "@/models/models.category";
import { CategoryService } from "@/services/services.category";
import { ProductService } from "@/services/services.product";

import messages from "@/messages/messages.json";
import { UserService } from "@/services/services.user";

type Language = "en" | "th";

const categoriesPlugin = (lang: Language) =>
    new Elysia()
        .use(authentication(lang))
        .group(
            "/categories", (app) =>
                app
                // Create Category
                .post(
                    "/",
                    async ({
                        body,
                    }) => {
                        const {
                            name,
                            description,
                            image,
                            recommended,
                            status,
                            turnstileToken,
                        } = body;

                        const validatedCloudflareTurnstile = await validator(
                            "turnstile",
                            turnstileToken,
                        );

                        if (!validatedCloudflareTurnstile.success)
                            return {
                                ok: false,
                                message: messages[lang][validatedCloudflareTurnstile.code],
                            };

                        const category = await CategoryService
                            .create({
                                name,
                                description,
                                image,
                                recommended,
                                status,
                            });

                        if (!category)
                            return {
                                ok: false,
                                message: messages[lang]["FAILED_CREATE_CATEGORY"],
                            };

                        return {
                            ok: true,
                            message: messages[lang]["SUCCESS_CREATE_CATEGORY"],
                        };
                    }, {
                        body: CreateCategoryBody,
                        beforeHandle: async ({
                            auth,
                            isAdmin,
                        }) => await isAdmin(auth),
                    },
                )
                // Get All Categories
                .get(
                    "/",
                    async (

                    ) => {
                        const categories = await CategoryService
                            .getAll();

                        return {
                            ok: true,
                            message: messages[lang]["SUCCESS_FETCH_CATEGORIES"],
                            data: categories,
                        };
                    },
                )
                // Get Category & Products' Category
                .get(
                    "/:categoryId",
                    async ({
                        auth,
                        params: { categoryId },
                    }) => {
                        let withOmit = true;

                        if (auth) {
                            const user = await UserService
                                .getById(auth.userId);

                            if (!user)
                                return {
                                    ok: false,
                                    message: messages[lang]["USER_NOT_FOUND"],
                                };

                            if (
                                user.role === "dev" ||
                                user.role === "admin"
                            ) {
                                withOmit = false;
                            };
                        };

                        const category = await CategoryService
                            .getById(categoryId);

                        if (!category)
                            return {
                                ok: false,
                                message: messages[lang]["CATEGORY_NOT_FOUND"],
                            };

                        const products = await ProductService
                            .getAll(
                                categoryId,
                                withOmit,
                            );

                        return {
                            ok: true,
                            message: messages[lang]["SUCCESS_FETCH_CATEGORY"],
                            data: category,
                            products,
                        };
                    }, {
                        params: CategoryParams,
                    }
                )
                // Update Category
                .put(
                    "/:categoryId",
                    async ({
                        body,
                        params: { categoryId },
                    }) => {
                        const category = await CategoryService
                            .getById(categoryId);

                        if (!category)
                            return {
                                ok: false,
                                message: messages[lang]["CATEGORY_NOT_FOUND"],
                            };

                        const {
                            name,
                            description,
                            image,
                            recommended,
                            status,
                            turnstileToken,
                        } = body;

                        const validatedCloudflareTurnstile = await validator(
                            "turnstile",
                            turnstileToken,
                        );

                        if (!validatedCloudflareTurnstile.success)
                            return {
                                ok: false,
                                message: messages[lang][validatedCloudflareTurnstile.code],
                            };

                        const updatedCategory = await CategoryService
                            .update(categoryId, {
                                name,
                                description,
                                image,
                                recommended,
                                status,
                            });

                        if (!updatedCategory)
                            return {
                                ok: false,
                                message: messages[lang]["FAILED_UPDATE_CATEGORY"],
                            };

                        return {
                            ok: true,
                            message: messages[lang]["SUCCESS_UPDATE_CATEGORY"],
                        };
                    }, {
                        body: UpdateCategoryBody,
                        params: CategoryParams,
                        beforeHandle: async ({
                            auth,
                            isAdmin,
                        }) => await isAdmin(auth),
                    },
                )
                // Delete Category
                .delete(
                    "/:categoryId",
                    async ({
                        body,
                        params: { categoryId },
                    }) => {
                        const {
                            turnstileToken,
                        } = body;

                        const validatedCloudflareTurnstile = await validator(
                            "turnstile",
                            turnstileToken,
                        );

                        if (!validatedCloudflareTurnstile.success)
                            return {
                                ok: false,
                                message: messages[lang][validatedCloudflareTurnstile.code],
                            };

                        const category = await CategoryService
                            .getById(categoryId);

                        if (!category)
                            return {
                                ok: false,
                                message: messages[lang]["CATEGORY_NOT_FOUND"],
                            };

                        const deletedCategory = await CategoryService
                            .delete(categoryId);

                        if (!deletedCategory)
                            return {
                                ok: false,
                                message: messages[lang]["FAILED_DELETE_CATEGORY"],
                            };

                        const products = await ProductService
                            .getAll(categoryId);

                        const deletedProducts = (await Promise.all(
                            products.map(
                                async (product) =>
                                    await ProductService
                                        .delete(product.id),
                            ),
                        ));

                        if (!deletedProducts)
                            return {
                                ok: false,
                                message: messages[lang]["FAILED_DELETE_PRODUCT"],
                            };

                        return {
                            ok: true,
                            message: messages[lang]["SUCCESS_DELETE_CATEGORY"],
                        };
                    }, {
                        body: DeleteCategoryBody,
                        params: CategoryParams,
                        beforeHandle: async ({
                            auth,
                            isAdmin,
                        }) => await isAdmin(auth),
                    },
                )
        );

export default categoriesPlugin;
