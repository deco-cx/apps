// compat/runtime/inspect.ts
// Object inspection abstraction for apps

declare const Deno: {
  inspect(value: unknown, options?: { depth?: number; colors?: boolean }): string;
} | undefined;

const isDeno = typeof Deno !== "undefined";

// Cache the util module for Node.js
let nodeUtil: { inspect: (value: unknown, options?: object) => string } | null = null;

const getNodeUtil = async () => {
  if (nodeUtil) return nodeUtil;
  try {
    nodeUtil = await import("node:util");
    return nodeUtil;
  } catch {
    return null;
  }
};

// Preload util module in Node.js
if (!isDeno) {
  getNodeUtil();
}

export const inspect = (
  value: unknown,
  options?: { depth?: number; colors?: boolean },
): string => {
  if (isDeno) {
    return Deno!.inspect(value, options);
  }

  // Node.js / Bun - use cached module if available
  if (nodeUtil?.inspect) {
    return nodeUtil.inspect(value, {
      depth: options?.depth ?? 4,
      colors: options?.colors ?? false,
    });
  }

  // Fallback for cases where module isn't loaded yet
  // Handle errors specially
  if (value instanceof Error) {
    return `${value.name}: ${value.message}${value.stack ? `\n${value.stack}` : ""}`;
  }

  // Ultimate fallback
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

