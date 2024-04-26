import { baseRun, runCmd } from "./cmd.ts";

const HYPERVISOR_VERSION = "bd66446d24f69ff82a98cc92364adae7adba6103";
const script = `
${baseRun}
deno run --node-modules-dir=false --import-map https://denopkg.com/deco-sites/play@${HYPERVISOR_VERSION}/deno.json -Ar https://denopkg.com/deco-sites/play@${HYPERVISOR_VERSION}/main.ts --build-cmd "deno task build" -- ${
  runCmd(true)
}
`;

export default script;
