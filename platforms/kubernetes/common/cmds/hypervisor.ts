import { beforeBaseRun, runCmd } from "./cmd.ts";

const script = `
${
  beforeBaseRun(
    `
DEPLOYMENT_TAR=$(dirname $SOURCE_ASSET_PATH)/$DENO_DEPLOYMENT_ID.tar
if [[ -f $DEPLOYMENT_TAR ]]; then
  SOURCE_ASSET_PATH=$DEPLOYMENT_TAR
fi
`,
  )
}
if [[ -f "./deno.jsonc" ]]; then
    LOAD_CONFIG_ARG="--config=deno.json"
else
  if [ -f "./import_map.json" ]; then
    LOAD_CONFIG_ARG="--import-map=import_map.json"
  else
    LOAD_CONFIG_ARG="--config=deno.json"
  fi
fi
HYPERVISOR_MAIN=$(deno eval 'console.log(import.meta.resolve("deco/hypervisor/main.ts"))')
deno info $LOAD_CONFIG_ARG $HYPERVISOR_MAIN &> /dev/null

if [[ $? -ne 0 ]]; then
  ${runCmd()}
else
  deno run -A $LOAD_CONFIG_ARG $HYPERVISOR_MAIN --build-cmd "deno task build" --build-files "/_fresh/**" -- ${
  runCmd(true)
}
fi
`;

export default script;
