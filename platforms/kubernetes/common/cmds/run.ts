import { SOURCE_LOCAL_MOUNT_PATH } from "../../actions/build.ts";
const script = `
#!/bin/bash

CODE_DIR=${SOURCE_LOCAL_MOUNT_PATH}
start=$(date +%s)

tar xvf $SOURCE_ASSET_PATH -C $CODE_DIR &
SOURCE_TAR_PID=$!
tar xvf $CACHE_PATH -C $DENO_DIR &
CACHE_PATH_PID=$!

wait $SOURCE_TAR_PID
wait $CACHE_PATH_PID

end=$(date +%s)

echo "extraction time: $(($end-$start)) seconds"

cd $CODE_DIR
SOURCE_MOUNT_PATH="\${ASSETS_MOUNT_PATH:-/deco-sites-sources}"
deno run $EXTRA_RUN_ARGS --inspect --node-modules-dir=false --allow-env --allow-net --allow-sys --allow-hrtime --allow-read --deny-read=$SOURCE_MOUNT_PATH --allow-run --allow-write=$HOME/.cache,/tmp,$DENO_DIR"npm",$DENO_DIR"deno_esbuild",$DENO_ALLOW_WRITE_DIRS --unstable main.ts
`;

export default script;
