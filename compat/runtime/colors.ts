// compat/runtime/colors.ts
// ANSI color codes - works in all terminals
// Replacement for std/fmt/colors.ts

export const red = (s: string): string => `\x1b[31m${s}\x1b[0m`;
export const green = (s: string): string => `\x1b[32m${s}\x1b[0m`;
export const yellow = (s: string): string => `\x1b[33m${s}\x1b[0m`;
export const blue = (s: string): string => `\x1b[34m${s}\x1b[0m`;
export const magenta = (s: string): string => `\x1b[35m${s}\x1b[0m`;
export const cyan = (s: string): string => `\x1b[36m${s}\x1b[0m`;
export const white = (s: string): string => `\x1b[37m${s}\x1b[0m`;
export const gray = (s: string): string => `\x1b[90m${s}\x1b[0m`;
export const brightRed = (s: string): string => `\x1b[91m${s}\x1b[0m`;
export const brightGreen = (s: string): string => `\x1b[92m${s}\x1b[0m`;
export const brightYellow = (s: string): string => `\x1b[93m${s}\x1b[0m`;
export const brightBlue = (s: string): string => `\x1b[94m${s}\x1b[0m`;
export const brightMagenta = (s: string): string => `\x1b[95m${s}\x1b[0m`;
export const brightCyan = (s: string): string => `\x1b[96m${s}\x1b[0m`;
export const bold = (s: string): string => `\x1b[1m${s}\x1b[0m`;
export const dim = (s: string): string => `\x1b[2m${s}\x1b[0m`;
export const italic = (s: string): string => `\x1b[3m${s}\x1b[0m`;
export const underline = (s: string): string => `\x1b[4m${s}\x1b[0m`;
export const stripColor = (s: string): string =>
  s.replace(/\x1b\[[0-9;]*m/g, "");

