import { Elysia } from "elysia";
import { authentication } from "@/lib/auth";
import { validator } from "@/lib/validator";
import { CreateProductBody, DeleteProductBody, ProductParams, UpdateProductBody } from "@/models/models.product";
import { CategoryService } from "@/services/services.category";
import { ProductService } from "@/services/services.product";
import { UserService } from "@/services/services.user";

import messages from "@/messages/messages.json";

type Language = "en" | "th";

const productsPlugin = (lang: Language) =>
    new Elysia()
        .use(authentication(lang))
        .group(
            "/products", (app) =>
                app
                // Create Product
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
                            type,
                            price,
                            status,
                            categoryId,
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

                        const product = await ProductService
                            .create({
                                name,
                                description,
                                image,
                                recommended,
                                type,
                                price,
                                status,
                                categoryId,
                            });

                        if (!product)
                            return {
                                ok: false,
                                message: messages[lang]["FAILED_CREATE_PRODUCT"],
                            };

                        const updatedCategoryProducts = await CategoryService
                            .updateProducts(
                                categoryId,
                                category.products,
                                "increase",
                            );

                        if (!updatedCategoryProducts)
                            return {
                                ok: false,
                                message: messages[lang]["FAILED_UPDATE_CATEGORY_PRODUCTS"],
                            };

                        return {
                            ok: true,
                            message: messages[lang]["SUCCESS_CREATE_PRODUCT"],
                        };
                    }, {
                        body: CreateProductBody,
                        beforeHandle: async ({
                            auth,
                            isAdmin,
                        }) => await isAdmin(auth),
                    },
                )
                // Get All Products
                .get(
                    "/",
                    async (

                    ) => {
                        const products = await ProductService
                            .getAll();

                        return {
                            ok: true,
                            message: messages[lang]["SUCCESS_FETCH_PRODUCTS"],
                            data: products,
                        };
                    },
                )
                // Get Product
                .get(
                    "/:productId",
                    async ({
                        auth,
                        params: { productId },
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

                        const product = await ProductService
                            .getById(
                                productId,
                                withOmit,
                            );

                        if (!product)
                            return {
                                ok: false,
                                message: messages[lang]["PRODUCT_NOT_FOUND"],
                            };

                        return {
                            ok: true,
                            message: messages[lang]["SUCCESS_FETCH_PRODUCT"],
                        };
                    }, {
                        params: ProductParams,
                    },
                )
                // Update Product
                .put(
                    "/:productId",
                    async ({
                        body,
                        params: { productId },
                    }) => {
                        const {
                            name,
                            description,
                            image,
                            recommended,
                            price,
                            stock,
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

                        const product = await ProductService
                            .getById(
                                productId,
                                true,
                            );

                        if (!product)
                            return {
                                ok: false,
                                message: messages[lang]["PRODUCT_NOT_FOUND"],
                            }; 

                        const updatedProduct = await ProductService
                            .update(productId, {
                                name,
                                description,
                                image,
                                recommended,
                                price,
                                stock,
                                status,
                            });

                        if (!updatedProduct)
                            return {
                                ok: false,
                                message: messages[lang]["FAILED_UPDATE_PRODUCT"],
                            };

                        return {
                            ok: true,
                            message: messages[lang]["SUCCESS_UPDATE_PRODUCT"],
                        };
                    }, {
                        body: UpdateProductBody,
                        params: ProductParams,
                        beforeHandle: async ({
                            auth,
                            isAdmin,
                        }) => await isAdmin(auth),
                    },
                )
                // Delete Product
                .delete(
                    "/:productId",
                    async ({
                        body,
                        params: { productId },
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

                        const product = await ProductService
                            .getById(productId);

                        if (!product)
                            return {
                                ok: false,
                                message: messages[lang]["PRODUCT_NOT_FOUND"],
                            };

                        const category = await CategoryService
                            .getById(product.categoryId);

                        if (!category)
                            return {
                                ok: false,
                                message: messages[lang]["CATEGORY_NOT_FOUND"],
                            };

                        const deletedProduct = await ProductService
                            .delete(productId);

                        if (!deletedProduct)
                            return {
                                ok: false,
                                message: messages[lang]["FAILED_DELETE_PRODUCT"],
                            };

                        const updatedCategoryProducts = await CategoryService
                            .updateProducts(
                                product.categoryId,
                                category.products,
                                "decrease",
                            );

                        if (!updatedCategoryProducts)
                            return {
                                ok: false,
                                message: messages[lang]["FAILED_UPDATE_CATEGORY_PRODUCTS"],
                            };

                        return {
                            ok: true,
                            message: messages[lang]["SUCCESS_DELETE_PRODUCT"],
                        };
                    }, {
                        body: DeleteProductBody,
                        params: ProductParams,
                        beforeHandle: async ({
                            auth,
                            isAdmin,
                        }) => await isAdmin(auth),
                    },
                )
        );

export default productsPlugin;
