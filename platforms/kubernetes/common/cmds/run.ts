const script = `
#!/bin/bash

CODE_DIR=/app/deco
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
deno run $EXTRA_RUN_ARGS --node-modules-dir=false --allow-env --allow-net --allow-sys --allow-hrtime --allow-read --deny-read=$SOURCE_MOUNT_PATH --allow-run --allow-write=$HOME/.cache,/tmp --unstable main.ts
`;

export default script;
