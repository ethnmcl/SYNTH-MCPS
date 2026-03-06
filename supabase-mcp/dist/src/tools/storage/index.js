import { lookup as mimeLookup } from "mime-types";
import { requireServiceRoleClient } from "../../server/apiKeys.js";
function parseUploadContent(content, encoding) {
    if (encoding === "base64")
        return Buffer.from(content, "base64");
    return Buffer.from(content, "utf8");
}
export const storageTools = {
    async list_buckets(context) {
        const client = await requireServiceRoleClient(context);
        const { data, error } = await client.storage.listBuckets();
        if (error)
            throw error;
        return {
            buckets: (data ?? []).map((bucket) => ({
                name: bucket.name,
                public: bucket.public,
            })),
        };
    },
    async create_bucket(context, input) {
        const client = await requireServiceRoleClient(context);
        const name = String(input.name);
        const isPublic = Boolean(input.public ?? false);
        const { error } = await client.storage.createBucket(name, { public: isPublic });
        if (error)
            throw error;
        return { success: true, bucket: name };
    },
    async list_files(context, input) {
        const client = await requireServiceRoleClient(context);
        const bucket = String(input.bucket);
        const path = String(input.path ?? "");
        const { data, error } = await client.storage.from(bucket).list(path);
        if (error)
            throw error;
        return { files: data ?? [] };
    },
    async upload_file(context, input) {
        const client = await requireServiceRoleClient(context);
        const bucket = String(input.bucket);
        const path = String(input.path);
        const content = String(input.content);
        const encoding = (input.encoding === "base64" ? "base64" : "text");
        const contentType = String(input.content_type ?? mimeLookup(path) ?? "application/octet-stream");
        const buffer = parseUploadContent(content, encoding);
        const { error } = await client.storage.from(bucket).upload(path, buffer, {
            contentType,
            upsert: true,
        });
        if (error)
            throw error;
        return { success: true, path };
    },
    async download_file(context, input) {
        const client = await requireServiceRoleClient(context);
        const bucket = String(input.bucket);
        const path = String(input.path);
        const { data, error } = await client.storage.from(bucket).download(path);
        if (error)
            throw error;
        const contentType = data.type || String(mimeLookup(path) ?? "application/octet-stream");
        const arrayBuffer = await data.arrayBuffer();
        const content = Buffer.from(arrayBuffer).toString("base64");
        return { content, content_type: contentType };
    },
    async delete_file(context, input) {
        const client = await requireServiceRoleClient(context);
        const bucket = String(input.bucket);
        const path = String(input.path);
        const { error } = await client.storage.from(bucket).remove([path]);
        if (error)
            throw error;
        return { success: true };
    },
};
