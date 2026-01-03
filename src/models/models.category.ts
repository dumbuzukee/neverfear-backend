import { t } from "elysia";

export const CategoryStatusBody = t.Enum({
    active: "active",
    inactive: "inactive",
});

export const CreateCategoryBody = t.Object({
    name: t.String(),
    description: t.String(),
    image: t.String(),
    recommended: t.Boolean(),
    status: CategoryStatusBody,
    turnstileToken: t.String(),
});

export const UpdateCategoryBody = t.Object({
    name: t.String(),
    description: t.String(),
    image: t.String(),
    recommended: t.Boolean(),
    status: CategoryStatusBody,
    turnstileToken: t.String(),
});

export const DeleteCategoryBody = t.Object({
    turnstileToken: t.String(),
});

export const CategoryParams = t.Object({
    categoryId: t.String(),
});

export type Status =
    "active" |
    "inactive";

export type CategoryInsert = {
    name: string;
    description: string;
    image: string;
    recommended: boolean;
    status: Status;
};

export type CategoryUpdate = {
    name: string;
    description: string;
    image: string;
    recommended: boolean;
    status: Status;
};

export type CategoryUpdateProductsType =
    "decrease" |
    "increase";
