/**
 * Extract a human-readable message from an unknown error value
 * (Error, Supabase PostgrestError, string, or anything else).
 */
export function getErrorMessage(err: unknown, fallback = "Une erreur est survenue"): string {
  if (!err) return fallback;
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (typeof err === "object") {
    const maybe = err as { message?: unknown; error_description?: unknown; msg?: unknown };
    if (typeof maybe.message === "string") return maybe.message;
    if (typeof maybe.error_description === "string") return maybe.error_description;
    if (typeof maybe.msg === "string") return maybe.msg;
  }
  return fallback;
}
