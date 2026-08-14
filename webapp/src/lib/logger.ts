export function logError(context: string, err: unknown) {
  const detail = err instanceof Error ? err.message : String(err);
  console.error(`[${context}]`, detail, err instanceof Error ? err.stack : undefined);
}
