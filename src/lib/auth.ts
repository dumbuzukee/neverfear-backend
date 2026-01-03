import { Elysia } from "elysia";
import { UserService } from "@/services/services.user";

import messages from "@/messages/messages.json";
import jwt from "./jwt";

type Language = "en" | "th";

type Response = {
    ok: boolean;
    message: string;
};

type DeriveData = {
    auth: any,
    isAuth: (auth: any) => Promise<Response | undefined>;
    isAdmin: (auth: any) => Promise<Response | undefined>;
};

export const authentication = (lang: Language = "en") => () =>
    new Elysia()
        .use(jwt)
        .derive(
            async ({
                jwt,
                cookie: { authToken },
            }) => {
                const data: DeriveData = {
                    auth: null,
                    isAuth: async (auth: any) => {
                        if (!auth)
                            return {
                                ok: false,
                                message: messages[lang]["UNAUTHORIZED"],
                            };
                    },
                    isAdmin: async (auth: any) => {
                        if (!auth)
                            return {
                                ok: false,
                                message: messages[lang]["UNAUTHORIZED"],
                            };

                        if (
                            auth.role !== "dev" &&
                            auth.role !== "admin"
                        ) return {
                            ok: false,
                            message: messages[lang]["API_NOT_ALLOWED"],
                        };
                    },
                };

                if (!authToken.value)
                    return data;

                const jwtPayload = await jwt.verify(
                    authToken.value as string,
                );

                if (!jwtPayload) {
                    authToken.remove();
                    return data;
                };

                const user = await UserService
                    .getById(jwtPayload.userId as string);

                if (!user) {
                    authToken.remove();
                    return data;
                };

                if (
                    user.role !== jwtPayload.role ||
                    user.username !== jwtPayload.username
                ) {
                    authToken.remove();
                    return data;
                };

                data.auth = jwtPayload;

                return data;
            },
        );
