import dotenv from "dotenv";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
dotenv.config({ path: ".env.generated", override: false });
dotenv.config();
function usage() {
    process.stderr.write([
        "Usage:",
        "  npm run tool -- list",
        "  npm run tool -- call <tool_name> '<json_input>'",
        "",
        "Examples:",
        "  npm run tool -- list",
        "  npm run tool -- call get_project_info '{}'",
        "  npm run tool -- call list_tables '{\"schema\":\"public\"}'",
    ].join("\n") + "\n");
    process.exit(1);
}
function parseArgs() {
    const [, , mode, arg1, arg2] = process.argv;
    if (mode === "list")
        return { mode: "list" };
    if (mode === "call") {
        if (!arg1)
            usage();
        const input = arg2 ? JSON.parse(arg2) : {};
        return { mode: "call", tool: arg1, input };
    }
    usage();
}
function envForChild() {
    const out = {};
    for (const [k, v] of Object.entries(process.env)) {
        if (typeof v === "string")
            out[k] = v;
    }
    return out;
}
async function main() {
    const args = parseArgs();
    const serverCommand = process.env.MCP_SERVER_COMMAND ?? "node";
    const serverArgs = process.env.MCP_SERVER_ARGS
        ? process.env.MCP_SERVER_ARGS.split(" ").filter(Boolean)
        : ["dist/src/index.js"];
    const transport = new StdioClientTransport({
        command: serverCommand,
        args: serverArgs,
        cwd: process.cwd(),
        env: envForChild(),
        stderr: "inherit",
    });
    const client = new Client({ name: "supabase-mcp-cli", version: "1.0.0" }, { capabilities: {} });
    await client.connect(transport);
    try {
        if (args.mode === "list") {
            const result = await client.listTools();
            process.stdout.write(`${JSON.stringify(result.tools, null, 2)}\n`);
            return;
        }
        const result = await client.callTool({
            name: args.tool,
            arguments: args.input,
        });
        process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    }
    finally {
        await client.close();
    }
}
main().catch((error) => {
    process.stderr.write(`tool failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
});
