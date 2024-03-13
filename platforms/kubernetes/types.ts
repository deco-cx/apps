import { CompilerOptions } from "../../admin/platform.ts";

export interface DenoJSON {
  imports?: Record<string, string>;
  compilerOptions?: CompilerOptions;
  nodeModulesDir?: boolean;
}
