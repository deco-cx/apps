async function build() {
  const { ensureFile } = await import(
    "https://deno.land/std@0.204.0/fs/ensure_file.ts"
  );
  const { join } = await import("https://deno.land/std@0.204.0/path/mod.ts");
  const {
    BlobReader,
    ZipReader,
  } = await import("https://deno.land/x/zipjs@v2.7.30/index.js");

  const cacheLocalDir = Deno.env.get("CACHE_LOCAL_DIR");
  const soureLocalDir = Deno.env.get("SOURCE_LOCAL_DIR");
  const gitRepository = Deno.env.get("GIT_REPO");
  const commitSha = Deno.env.get("COMMIT_SHA") ?? "main";
  const ghToken = Deno.env.get("GITHUB_TOKEN");

  Deno.env.set("DENO_DIR", cacheLocalDir!);

  const runtimeDeps = [
    "https://denopkg.com/deco-sites/std/utils/worker.ts",
    "https://denopkg.com/deco-sites/std/plugins/tailwind/bundler.ts",
    "npm:daisyui",
    "https://denopkg.com/deco-cx/apps/website/utils/image/engines/wasm/worker.ts",
    "$fresh/src/build/deps.ts",
    "$fresh/src/runtime/entrypoints/main.ts",
    "$fresh/src/runtime/entrypoints/deserializer.ts",
    "$fresh/src/runtime/entrypoints/signals.ts",
  ];

  const fileLines = runtimeDeps.map((specifier) => {
    return `import "${specifier}";`;
  });

  const DOCKER_DEPS_FILE_NAME = `_docker_deps.ts`;
  const dockerDepsPromise = Deno.writeTextFile(
    join(soureLocalDir!, DOCKER_DEPS_FILE_NAME),
    fileLines.join("\n"),
  );

  interface FreshProject {
    buildArgs?: string[];
  }
  const getFrshProject = async (): Promise<FreshProject | undefined> => {
    const readFileOrUndefined = (file: string) =>
      Deno.readTextFile(join(soureLocalDir!, file)).catch((err) => {
        if (err instanceof Deno.errors.NotFound) {
          return undefined;
        }
        throw err;
      });
    const denoJson = await Promise.all([
      readFileOrUndefined("deno.json").then((str) =>
        str ? JSON.parse(str) : str
      )
        .catch((_err) => undefined),
      readFileOrUndefined("deno.jsonc").then(async (str) => {
        if (!str) {
          return undefined;
        }

        const parser = await import(
          "https://deno.land/std@0.204.0/jsonc/parse.ts"
        ).catch((_err) => undefined);
        if (!parser) {
          return undefined;
        }
        return parser.parse(str);
      }),
    ]);
    const parsedDenoJson = denoJson.find(Boolean);
    if (!parsedDenoJson) {
      return undefined;
    }
    const hasFreshImport = parsedDenoJson?.imports?.["$fresh/"];
    return {
      buildArgs: hasFreshImport
        ? ["run", "--node-modules-dir=false", "-A", "dev.ts", "build"]
        : undefined,
    };
  };

  const buildZipUrl = (gitRepo: string, commit: string) => {
    const repoWithoutGit = new URL(gitRepo.replace(".git", ""));
    repoWithoutGit.hostname = `codeload.${repoWithoutGit.hostname}`;
    repoWithoutGit.pathname = `${repoWithoutGit.pathname}/zip/${commit}`;
    return repoWithoutGit;
  };

  const downloadFromGit = async () => {
    const zipUrl = buildZipUrl(gitRepository!, commitSha);
    console.log("downloading zip from", zipUrl);
    const blob = await fetch(zipUrl, {
      headers: ghToken
        ? {
          Authorization: `token ${ghToken}`,
        }
        : undefined,
    }).then((res) => res.blob());
    const zipReader = new ZipReader(new BlobReader(blob));
    const entries = await zipReader.getEntries();

    const entry = entries.shift();
    if (!entry) {
      console.error("Failed to unzip project");
      return Deno.exit(1);
    }

    const { filename: rootFilename } = entry;

    for (const { directory, filename, getData } of entries) {
      if (directory) continue;

      const filepath = join(soureLocalDir!, filename.replace(rootFilename, ""));

      await ensureFile(filepath);
      const file = await Deno.open(filepath, { create: true, write: true });
      await getData?.(file.writable);
    }
    await zipReader.close();
  };

  const genCache = async (isFreshProject: boolean) => {
    await dockerDepsPromise;
    const cmd = new Deno.Command(Deno.execPath(), {
      args: [
        "cache",
        "--node-modules-dir=false",
        "main.ts",
        ...isFreshProject ? [DOCKER_DEPS_FILE_NAME] : [],
      ],
      cwd: soureLocalDir,
      stdout: "inherit",
      stderr: "inherit",
      stdin: "inherit",
    }).spawn();
    const status = await cmd.status;
    if (!status.success) {
      console.error("Failed to cache dependencies");
      Deno.exit(status.code);
    }
  };
  const build = async (buildArgs: string[]) => {
    const cmd = new Deno.Command(Deno.execPath(), {
      args: buildArgs,
      cwd: soureLocalDir,
      stdout: "inherit",
      stderr: "inherit",
      stdin: "inherit",
    }).spawn();
    const status = await cmd.status;
    if (!status.success) {
      console.error("Failed to build project");
      Deno.exit(status.code);
    }
  };

  console.log(`downloading source from git ${gitRepository} - ${commitSha}...`);
  await downloadFromGit();
  console.log(`generating cache...`);
  const freshPrj = await getFrshProject();
  await genCache(freshPrj !== undefined);
  if (freshPrj?.buildArgs) {
    console.log(`building project...`);
    await build(freshPrj.buildArgs);
    console.log("the build was successfully completed");
  }
  Deno.exit(0);
}
const script = `
#!/usr/bin/env sh
set -eu

# If source already exists so build isn't necessary.
if [[ -f "$SOURCE_REMOTE_OUTPUT" ]]; then
    echo "Source already exists... skipping build"
    exit 0;
fi
[[ -f "$CACHE_REMOTE_OUTPUT" ]] && echo "restoring cache..." && tar xvf "$CACHE_REMOTE_OUTPUT" -C $CACHE_LOCAL_DIR && echo "cache successfully restored!"

deno run -A - << 'EOF'
${build};
await build();
EOF

echo "exporting the code result to a tar file..."

mkdir -p $(dirname $CACHE_REMOTE_OUTPUT)
mkdir -p $(dirname $SOURCE_REMOTE_OUTPUT)

cd $SOURCE_LOCAL_DIR
tar cvfh - . | cat > $SOURCE_REMOTE_OUTPUT &
CODE_TAR_PID=$!
echo "exporting the cache result to a tar file..."
cd $CACHE_LOCAL_DIR
tar cvfh - . | cat > $CACHE_REMOTE_OUTPUT &
CACHE_TAR_PID=$!

wait $CODE_TAR_PID
wait $CACHE_TAR_PID
`;

export default script;
