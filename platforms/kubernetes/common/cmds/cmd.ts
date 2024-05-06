import { SOURCE_LOCAL_MOUNT_PATH } from "../../actions/build.ts";

export const beforeBaseRun = (beforeScript = "") => `
#!/bin/bash

${beforeScript}
BASE_DIR=$(dirname ${SOURCE_LOCAL_MOUNT_PATH})
CODE_DIR=${SOURCE_LOCAL_MOUNT_PATH}
start=$(date +%s)

LOCAL_ASSET_PATH=$BASE_DIR/source.tar
cp $SOURCE_ASSET_PATH $LOCAL_ASSET_PATH
tar xvf $LOCAL_ASSET_PATH -C $CODE_DIR

end=$(date +%s)

echo "extraction time: $(($end-$start)) seconds"

cd $CODE_DIR
SOURCE_MOUNT_PATH="\${ASSETS_MOUNT_PATH:-/deco-sites-sources}"
`;
export const baseRun = beforeBaseRun();
export const runCmd = (hmr?: boolean) =>
  `deno run --lock=deno.lock --lock-write $EXTRA_RUN_ARGS --inspect --node-modules-dir=false --allow-env --allow-net --allow-sys --allow-hrtime --allow-read --deny-read=$SOURCE_MOUNT_PATH --allow-run --allow-write=$HOME/.cache,/tmp,$DENO_DIR"npm",$DENO_DIR"deno_esbuild",$DENO_ALLOW_WRITE_DIRS --unstable ${
    hmr ? "--unstable-hmr" : ""
  } main.ts`;
