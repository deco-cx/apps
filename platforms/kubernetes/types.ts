export interface DenoJSON {
    imports?: Record<string, string>,
    compilerOptions?: {
        jsx?: string,
        jsxImportSource?: string,
        experimentalDecorators?: boolean,
    },
    nodeModulesDir?: boolean,
}