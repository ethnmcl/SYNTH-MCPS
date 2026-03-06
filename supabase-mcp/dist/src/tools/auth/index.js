import { requireServiceRoleClient } from "../../server/apiKeys.js";
export const authTools = {
    async list_users(context, input) {
        const client = await requireServiceRoleClient(context);
        const page = Number(input.page ?? 1);
        const perPage = Number(input.per_page ?? 50);
        const { data, error } = await client.auth.admin.listUsers({ page, perPage });
        if (error)
            throw error;
        return { users: data.users };
    },
    async create_user(context, input) {
        const client = await requireServiceRoleClient(context);
        const { data, error } = await client.auth.admin.createUser({
            email: String(input.email),
            password: input.password ? String(input.password) : undefined,
            email_confirm: Boolean(input.email_confirm ?? true),
            user_metadata: input.user_metadata ?? undefined,
        });
        if (error)
            throw error;
        return { success: true, user_id: data.user?.id ?? "" };
    },
    async update_user(context, input) {
        const client = await requireServiceRoleClient(context);
        const userId = String(input.user_id);
        const updates = input.updates ?? {};
        const { error } = await client.auth.admin.updateUserById(userId, updates);
        if (error)
            throw error;
        return { success: true };
    },
    async delete_user(context, input) {
        const client = await requireServiceRoleClient(context);
        const userId = String(input.user_id);
        const { error } = await client.auth.admin.deleteUser(userId);
        if (error)
            throw error;
        return { success: true };
    },
};
