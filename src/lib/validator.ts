type MessageCodes =
    "INVALID_EMAIL_FORMAT" |
    "INVALID_USERNAME_FORMAT" |
    "INVALID_USERNAME_LENGTH" |
    "INVALID_PASSWORD_LENGTH" |
    "INVALID_TURSNTILE_TOKEN" |
    "SUCCESS_VALIDATE_AUTH_CREDENTIALS" |
    "SUCCESS_VALIDATE_CLOUDFLARE_TURNSTILE";

type AuthCredentialsProps = {
    email?: string;
    username?: string;
    password?: string;
};

type ValidatorType =
    "credentials" |
    "turnstile";

type ValidatorProps = {
    "credentials": AuthCredentialsProps;
    "turnstile": string;
};

type ValidatorResponse = {
    success: boolean;
    code: MessageCodes;
};

const validateAuthCredentials = async ({
    email,
    username,
    password
}: AuthCredentialsProps): Promise<ValidatorResponse> => {
    if (
        email !== undefined &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) return {
        success: false,
        code: "INVALID_EMAIL_FORMAT",
    };

    if (username !== undefined) {
        if (username.length < 3)
            return {
                success: false,
                code: "INVALID_USERNAME_LENGTH",
            };

        if (!/^[a-zA-Z0-9_]+$/.test(username))
            return {
                success: false,
                code: "INVALID_USERNAME_FORMAT",
            };
    };

    if (
        password !== undefined &&
        password.length < 6
    ) return {
        success: false,
        code: "INVALID_PASSWORD_LENGTH",
    }

    return {
        success: true,
        code: "SUCCESS_VALIDATE_AUTH_CREDENTIALS",
    };
};

const validateCloudflareTurnstile = async (
    turnstileToken: string
): Promise<ValidatorResponse> => {
    const verifiedCloudflareTurnstileResponse =
        await fetch(Bun.env["CLOUDFLARE_TURNSTILE_VERIFY_API"]!, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                secret: Bun.env["CLOUDFLARE_TURNSTILE_SECRET_KEY"]!,
                response: turnstileToken,
            }),
        })
        .then((response) => response.json());

    if (!verifiedCloudflareTurnstileResponse.success)
        return {
            success: false,
            code: "INVALID_TURSNTILE_TOKEN",
        };

    return {
        success: true,
        code: "SUCCESS_VALIDATE_CLOUDFLARE_TURNSTILE",
    };
};

export async function validator<T extends ValidatorType>(
    type: T,
    props: ValidatorProps[T],
): Promise<ValidatorResponse> {
    switch(type) {
        case "credentials":
            return await validateAuthCredentials(props as AuthCredentialsProps);
        case "turnstile":
            return await validateCloudflareTurnstile(props as string);
    };
};
