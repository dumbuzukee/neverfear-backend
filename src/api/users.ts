import { Elysia } from "elysia";
import { authentication } from "@/lib/auth";
import { validator } from "@/lib/validator";
import { compareValues, cookieConfig } from "@/lib/utils";
import { ProductParams } from "@/models/models.product";
import { DeleteUserBody, LoginBody, PurchaseItemBody, RegisterBody, TopupBody, UpdateBalanceBody, UpdateRoleBody, UserParams } from "@/models/models.user";
import { ProductService } from "@/services/services.product";
import { PurchaseService } from "@/services/services.purchase";
import { TopupService } from "@/services/services.topup";
import { UserService } from "@/services/services.user";
import messages from "@/messages/messages.json";

type Language = "en" | "th";

const usersPlugin = (lang: Language) =>
    new Elysia()
        .use(authentication(lang))
        .group(
            "/users", (app) =>
                app
                
                // Get All Users
                .get(
                    "/",
                    async (

                    )  => {
                        const users = await UserService
                            .getAll();

                        return {
                            ok: true,
                            message: messages[lang]["SUCCESS_FETCH_USERS"],
                            data: users,
                        };
                    }, {
                        beforeHandle: async ({
                            auth,
                            isAdmin,
                        }) => await isAdmin(auth),
                    },
                )
                // Get User
                .get(
                    "/:userId",
                    async ({
                        params: { userId },
                    }) => {
                        const user = await UserService
                            .getById(userId);

                        if (!user)
                            return {
                                ok: false,
                                message: messages[lang]["USER_NOT_FOUND"],
                            };

                        const {
                            email,
                            username,
                            balance,
                            totalBalance,
                            role,
                        } = user;

                        return {
                            ok: true,
                            message: messages[lang]["SUCCESS_FETCH_USER"],
                            data: {
                                email,
                                username,
                                balance,
                                totalBalance,
                                role,
                            },
                        };
                    }, {
                        params: UserParams,
                        beforeHandle: async ({
                            auth,
                            isAdmin,
                        }) => await isAdmin(auth),
                    },
                )
                // Update Target Balance
                .put(
                    "/:userId/updateBalance",
                    async ({
                        body,
                        params: { userId },
                    }) => {
                        const {
                            amount,
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

                        const target = await UserService
                            .getById(userId);

                        if (!target)
                            return {
                                ok: false,
                                message: messages[lang]["USER_NOT_FOUND"],
                            };
                        

                        const updatedUserBalance = await UserService
                            .updateBalance(userId, {
                                balance: target.balance + amount,
                                totalBalance: target.totalBalance + amount,
                            });

                        if (!updatedUserBalance)
                            return {
                                ok: false,
                                message: messages[lang]["FAILED_UPDATE_USER_BALANCE"],
                            };

                        return {
                            ok: true,
                            message: messages[lang]["SUCCESS_UPDATE_USER_BALANCE"],
                        };
                    }, {
                        body: UpdateBalanceBody,
                        params: UserParams,
                        beforeHandle: async ({
                            auth,
                            isAdmin,
                        }) => await isAdmin(auth),
                    },
                )
                // Update Target Role
                .put(
                    "/:userId/updateRole",
                    async ({
                        auth,
                        body,
                        params: { userId },
                    }) => {
                        const {
                            role,
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

                        const user = await UserService
                            .getById(auth.userId);

                        if (!user)
                            return {
                                ok: false,
                                message: messages[lang]["USER_NOT_FOUND"],
                            };

                        const target = await UserService
                            .getById(userId);

                        if (!target)
                            return {
                                ok: false,
                                message: messages[lang]["USER_NOT_FOUND"],
                            };

                        if (
                            user.role !== "dev" &&
                            target.role === "dev"
                        ) return {
                            ok: false,
                            message: messages[lang]["UPDATE_PERMISSION_NOT_ALLOWED"],
                        };

                        const updatedUserRole = await UserService
                            .updateRole(userId, {
                                role,
                            });

                        if (!updatedUserRole)
                            return {
                                ok: false,
                                message: messages[lang]["FAILED_UPDATE_USER_ROLE"],
                            };

                        return {
                            ok: true,
                            message: messages[lang]["SUCCESS_UPDATE_USER_ROLE"],
                        };
                    }, {
                        body: UpdateRoleBody,
                        params: UserParams,
                        beforeHandle: async ({
                            auth,
                            isAdmin,
                        }) => await isAdmin(auth),
                    },
                )
                // Delete User
                .delete(
                    "/:userId",
                    async ({
                        auth,
                        body,
                        params: { userId },
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

                        const user = await UserService
                            .getById(auth.userId);

                        if (!user)
                            return {
                                ok: false,
                                message: messages[lang]["USER_NOT_FOUND"],
                            };

                        const target = await UserService
                            .getById(userId);

                        if (!target)
                            return {
                                ok: false,
                                message: messages[lang]["USER_NOT_FOUND"],
                            };

                        if (user.id === target.id)
                            return {
                                ok: false,
                                message: messages[lang]["DELETE_YOURSELF_NOT_ALLOWED"],
                            };

                        if (
                            user.role !== "dev" && (
                                target.role === "dev" ||
                                target.role === "admin"
                            )
                        ) return {
                            ok: false,
                            message: messages[lang]["DELETE_PERMISSION_NOT_ALLOWED"],
                        };

                        const deletedUser = await UserService
                            .delete(userId);

                        if (!deletedUser)
                            return {
                                ok: false,
                                message: messages[lang]["FAILED_DELETE_USER"],
                            };

                        return {
                            ok: true,
                            message: messages[lang]["SUCCESS_DELETE_USER"],
                        };
                    }, {
                        body: DeleteUserBody,
                        params: UserParams,
                        beforeHandle: async ({
                            auth,
                            isAdmin,
                        }) => await isAdmin(auth),
                    },
                )
                // Login
                .post(
                    "/login",
                    async ({
                        body,
                        jwt,
                        cookie: { authToken },
                    }) => {
                        const {
                            username,
                            password,
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

                        const validatedAuthCredentials = await validator(
                            "credentials", {
                                username,
                                password,
                            },
                        );

                        if (!validatedAuthCredentials.success)
                            return {
                                ok: false,
                                message: messages[lang][validatedAuthCredentials.code],
                            };

                        const user = await UserService
                            .getByOthers({
                                username
                            });

                        if (!user)
                            return {
                                ok: false,
                                message: messages[lang]["INVALID_USERNAME"],
                            };

                        const matchedPassword = await compareValues(
                            password,
                            user.password,
                        );

                        if (!matchedPassword)
                            return {
                                ok: false,
                                message: messages[lang]["INVALID_PASSWORD"],
                            };

                        authToken.set({
                            value: await jwt.sign({
                                userId: user.id,
                                username: user.username,
                                role: user.role,
                            }),
                            ...cookieConfig(),
                        });

                        return {
                            ok: true,
                            message: messages[lang]["SUCCESS_LOGIN"],
                        };
                    }, {
                        body: LoginBody,
                    },
                )
                // Logout
                .post(
                    "/logout",
                    async ({
                        cookie: { authToken },
                    }) => {
                        authToken.remove();
                        return {
                            ok: true,
                            message: messages[lang]["SUCCESS_LOGOUT"],
                        };
                    },
                )
                // Register
                .post(
                    "/register",
                    async ({
                        body,
                        jwt,
                        cookie: { authToken },
                    }) => {
                        const {
                            email,
                            username,
                            password,
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

                        const validatedAuthCredentials = await validator(
                            "credentials", {
                                email,
                                username,
                                password,
                            },
                        );

                        if (!validatedAuthCredentials.success)
                            return {
                                ok: false,
                                message: messages[lang][validatedAuthCredentials.code],
                            };

                        const isEmailExisted = await UserService
                            .getByOthers({
                                email,
                            });

                        if (isEmailExisted)
                            return {
                                ok: false,
                                message: messages[lang]["EMAIL_EXISTED"],
                            };

                        const isUsernameExisted = await UserService
                            .getByOthers({
                                username,
                            });

                        if (isUsernameExisted)
                            return {
                                ok: false,
                                message: messages[lang]["USERNAME_EXISTED"],
                            };

                        const user = await UserService
                            .create({
                                email,
                                username,
                                password,
                            });

                        if (!user)
                            return {
                                ok: false,
                                message: messages[lang]["FAILED_CREATE_ACCOUNT"],
                            };

                        authToken.set({
                            value: await jwt.sign({
                                userId: user.id,
                                username: user.username,
                                role: user.role,
                            }),
                            ...cookieConfig(),
                        });

                        return {
                            ok: true,
                            message: messages[lang]["SUCCESS_REGISTER"],
                        };
                    }, {
                        body: RegisterBody,
                    },
                )
                // Me
                .get(
                    "/me",
                    async ({
                        auth
                    }) => {
                        const user = await UserService
                            .getById(auth?.userId as string);

                        if (!user)
                            return {
                                ok: false,
                                message: messages[lang]["USER_NOT_FOUND"],
                            };

                        const {
                            email,
                            username,
                            balance,
                            totalBalance,
                            role,
                        } = user;

                        return {
                            ok: true,
                            message: messages[lang]["AUTHORIZED"],
                            data: {
                                email,
                                username,
                                balance,
                                totalBalance,
                                role,
                            },
                        };
                    }, {
                        beforeHandle: async ({
                            auth,
                            isAuth,
                        }) => await isAuth(auth),
                    },
                )
                // Purchase
                .post(
                    "/purchaseItem/:productId",
                    async ({
                        auth,
                        body,
                        params: { productId },
                    }) => {
                        const {
                            quantity,
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

                        const user = await UserService
                            .getById(auth.userId);

                        if (!user)
                            return {
                                ok: false,
                                message: messages[lang]["USER_NOT_FOUND"],
                            };

                        const product = await ProductService
                            .getById(
                                productId,
                                false
                            );

                        if (!product)
                            return {
                                ok: false,
                                message: messages[lang]["PRODUCT_NOT_FOUND"],
                            };                    

                        if (quantity > product.available)
                            return {
                                ok: false,
                                message: messages[lang]["INSUFFICIENT_STOCK"],
                            };

                        const productTotalAmount = product.price * quantity;

                        if (productTotalAmount > user.balance)
                            return {
                                ok: false,
                                message: messages[lang]["INSUFFICIENT_BALANCE"],
                            };

                        const items: string[] = [];

                        switch (product.type) {
                            case "mystery_box":
                                for (let i = 0; i < quantity; i++) {
                                    const randomIndex = Math.floor(Math.random() * product.stock.length);
                                    const item = product.stock[randomIndex];
                                    items.push(item);
                                    product.stock.splice(randomIndex, 1);
                                };
                                break;
                            default:
                                items.push(
                                    ...product.stock.splice(0, quantity)
                                );
                                break;
                        };

                        const updatedUserBalance = await UserService
                            .updateBalance(user.id, {
                                balance: user.balance - productTotalAmount,
                                totalBalance: user.totalBalance,
                            });

                        if (!updatedUserBalance)
                            return {
                                ok: false,
                                message: messages[lang]["FAILED_UPDATE_USER_BALANCE"],
                            };

                        if (user.role === "guest") {
                            const updatedUserRole = await UserService
                                .updateRole(user.id, {
                                    role: "customer",
                                });

                            if (!updatedUserRole)
                                return {
                                    ok: false,
                                    message: messages[lang]["FAILED_UPDATE_USER_ROLE"],
                                };
                        };

                        const updatedProductStock = await ProductService
                            .updateStock(product.id, {
                                availble: product.stock.length,
                                stock: product.stock,
                            });

                        if (!updatedProductStock)
                            return {
                                ok: false,
                                message: messages[lang]["FAILED_UPDATE_PRODUCT_STOCK"],
                            };

                        const purchasedHistory = await PurchaseService
                            .create({
                                userId: user.id,
                                productId: product.id,
                                productName: product.name,
                                productType: product.type,
                                productPrice: product.price,
                                productQuantity: quantity,
                                productTotalAmount,
                                productInfo: items,
                            });

                        if (!purchasedHistory)
                            return {
                                ok: false,
                                message: messages[lang]["FAILED_CREATE_PURCHASED_HISTORY"],
                            };

                        return {
                            ok: true,
                            message: messages[lang]["SUCCESS_PURCHASE"],
                        };
                    }, {
                        body: PurchaseItemBody,
                        params: ProductParams,
                        beforeHandle: async ({
                            auth,
                            isAuth,
                        }) => await isAuth(auth),
                    },
                )
                // Get Purchased History
                .get(
                    "/purchasedHistory",
                    async ({
                        auth,
                    }) => {
                        const user = await UserService
                            .getById(auth.userId);

                        if (!user)
                            return {
                                ok: false,
                                message: messages[lang]["USER_NOT_FOUND"],
                            };

                        const purchasedHistory = await PurchaseService
                            .getAll(user.id);

                        return {
                            ok: true,
                            message: messages[lang]["SUCCESS_FETCH_PURCHASED_HISTORY"],
                            data: purchasedHistory,
                        };
                    }, {
                        beforeHandle: async ({
                            auth,
                            isAuth,
                        }) => await isAuth(auth),
                    },
                )
                // Topup
                .post(
                    "/topupBalance",
                    async ({
                        auth,
                        body,
                    }) => {
                        const {
                            amount,
                            payload,
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

                        const user = await UserService
                            .getById(auth.userId);

                        if (!user)
                            return {
                                ok: false,
                                message: messages[lang]["USER_NOT_FOUND"],
                            };

                        const verifiedSlipResponse =
                            await fetch(Bun.env["SLIP_VERIFY_RDCW_API"]!, {
                                method: "POST",
                                headers: {
                                    "Authorization": `Basic ${process.env["SLIP_VERIFY_RDCW_AUTHORIZATION"]!}`,
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    payload,
                                }),
                            })
                            .then((response) => response.json());

                        if (!verifiedSlipResponse?.data)
                            return {
                                ok: false,
                                message: messages[lang]["INVALID_SLIP_PAYLOAD"],
                            };

                        const data = verifiedSlipResponse.data;

                        if (data.amount !== amount)
                            return {
                                ok: false,
                                message: messages[lang]["INAVLID_SLIP_AMOUNT"],
                            };

                        if (
                            data.receiver.displayName !== Bun.env["RECEIVER_ACCOUNT_NAME_TH"] ||
                            data.receiver.name !== Bun.env["RECEIVER_ACCOUNT_NAME_EN"]
                        ) return {
                            ok: false,
                            message: messages[lang]["INAVLID_RECEIVER_NAME"],
                        };

                        if (
                            data.receiver.proxy.type !== process.env["RECEIVER_ACCOUNT_TYPE"] ||
                            data.receiver.proxy.value !== process.env["RECEIVER_ACCOUNT_ID"]
                        ) return {
                            ok: false,
                            message: messages[lang]["INAVLID_RECEIVER_ID"],
                        };

                        const slipYear = data.transDate.slice(0, 4);
                        const slipMonth = data.transDate.slice(4, 6);
                        const slipDay = data.transDate.slice(6, 8);
                        const slipDateFull = `${slipYear}-${slipMonth}-${slipDay}T${data.transTime}`;

                        const dateNow = new Date().getTime();
                        const slipDate = new Date(slipDateFull).getTime();

                        if ((dateNow - slipDate) > 10 * 60 * 1000)
                            return {
                                ok: false,
                                message: "สลิปหมดอายุ (สลิปมีอายุเกิน 10 นาที)",
                            };

                        const isSlipPayloadExisted = await TopupService
                            .getByPayload(payload);

                        const isSlipTransRefExisted = await TopupService
                            .getByTransRef(data.transRef);

                        if (
                            isSlipPayloadExisted ||
                            isSlipTransRefExisted
                        ) return {
                            ok: false,
                            message: messages[lang]["SLIP_EXISTED"],
                        };

                        const updatedUserBalance = await UserService
                            .updateBalance(user.id, {
                                balance: user.balance + amount,
                                totalBalance: user.totalBalance + amount,
                            });

                        if (!updatedUserBalance)
                            return {
                                ok: false,
                                message: messages[lang]["FAILED_UPDATE_USER_BALANCE"],
                            };

                        const toppedUpHistory = await TopupService
                            .create({
                                userId: user.id,
                                payload,
                                transRef: data.transRef,
                                transDate: new Date(slipDateFull),
                                amount,
                                name: data.sender.displayName,
                            });

                        if (!toppedUpHistory)
                            return {
                                ok: false,
                                message: messages[lang]["FAILED_CREATE_TOPPED_UP_HISTORY"],
                            };

                        return {
                            ok: true,
                            message: messages[lang]["SUCCESS_TOPUP"],
                        };
                    }, {
                        body: TopupBody,
                        beforeHandle: async ({
                            auth,
                            isAuth,
                        }) => await isAuth(auth),
                    },
                )
                // Get Topped Up History
                .get(
                    "/toppedUpHistory",
                    async ({
                        auth,
                    }) => {
                        const user = await UserService
                            .getById(auth.userId);

                        if (!user)
                            return {
                                ok: false,
                                message: messages[lang]["USER_NOT_FOUND"],
                            };

                        const toppedUpHistory = await TopupService
                            .getAll(user.id);

                        return {
                            ok: true,
                            message: messages[lang]["SUCCESS_FETCH_TOPPED_UP_HISTORY"],
                            data: toppedUpHistory,
                        };
                    }, {
                        beforeHandle: async ({
                            auth,
                            isAuth,
                        }) => await isAuth(auth),
                    },
                )
        );

export default usersPlugin;
