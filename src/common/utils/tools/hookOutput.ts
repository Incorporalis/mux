import { isPlainObject } from "@/common/utils/isPlainObject";

function hasHookOutput(
  result: unknown
): result is Record<string, unknown> & { hook_output: string } {
  return isPlainObject(result) && typeof result.hook_output === "string";
}

export function extractHookOutput(result: unknown): string | null {
  if (!hasHookOutput(result)) return null;
  return result.hook_output.length > 0 ? result.hook_output : null;
}

export function extractHookDuration(result: unknown): number | undefined {
  if (!isPlainObject(result)) return undefined;
  const duration = result.hook_duration_ms;
  return typeof duration === "number" && Number.isFinite(duration) ? duration : undefined;
}
