import { baseRun, runCmd } from "./cmd.ts";

const script = `
${baseRun}
deno run -A --import-map=$(deno eval 'console.log(import.meta.resolve("deco/deno.json"))') $(deno eval 'console.log(import.meta.resolve("deco/hypervisor/main.ts"))')  --build-cmd "deno task build" -- ${
  runCmd(true)
}
`;

export default script;
