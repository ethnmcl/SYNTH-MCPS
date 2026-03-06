import { requireServiceRoleClient } from "../../server/apiKeys.js";
export const edgeFunctionsTools = {
    async list_functions(context) {
        const data = await context.managementApi.listFunctions();
        return {
            functions: data.map((item) => ({
                name: String(item.name ?? item.slug ?? "unknown"),
            })),
        };
    },
    async deploy_function(context, input) {
        const name = String(input.name);
        const sourceCode = String(input.source_code);
        const verifyJwt = Boolean(input.verify_jwt ?? true);
        await context.managementApi.deployFunction(name, sourceCode, verifyJwt);
        return { success: true, name };
    },
    async invoke_function(context, input) {
        const client = await requireServiceRoleClient(context);
        const name = String(input.name);
        const payload = input.payload ?? {};
        const { data, error } = await client.functions.invoke(name, {
            body: payload,
            headers: { "content-type": "application/json" },
        });
        if (error)
            throw error;
        return { response: data };
    },
    async delete_function(context, input) {
        const name = String(input.name);
        await context.managementApi.deleteFunction(name);
        return { success: true };
    },
};
