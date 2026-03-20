export async function handler(input: Record<string, unknown>) {
  return {
    ok: true,
    message: 'Hello from {{functionName}}',
    input
  };
}
