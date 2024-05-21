export const typeChecker = <T extends object>(v: T, prop: keyof T) => prop in v;
