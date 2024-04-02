import { DenoJSON } from "../../types.ts";

async function build() {
  const { ensureFile } = await import(
    "https://deno.land/std@0.204.0/fs/ensure_file.ts"
  );
  const { join } = await import("https://deno.land/std@0.204.0/path/mod.ts");
  const {
    BlobReader,
    ZipReader,
  } = await import("https://deno.land/x/zipjs@v2.7.30/index.js");

  const exists = async (filename: string): Promise<boolean> => {
    try {
      await Deno.stat(filename);
      // successful, file or directory must exist
      return true;
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        // file or directory does not exist
        return false;
      } else {
        // unexpected error, maybe permissions, pass it along
        throw error;
      }
    }
  };
  const cacheLocalDir = Deno.env.get("CACHE_LOCAL_DIR");
  const sourceLocalDir = Deno.env.get("SOURCE_LOCAL_DIR");
  const sourceProvider = Deno.env.get("SOURCE_PROVIDER"); // GITHUB or FILES
  const filesLocalPath = Deno.env.get("FILES_LOCAL_PATH"); // readonly path should be copied to a writable path.
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
    join(sourceLocalDir!, DOCKER_DEPS_FILE_NAME),
    fileLines.join("\n"),
  );

  interface FreshProject {
    buildArgs?: string[];
  }

  const getFrshProject = (
    denoJson: DenoJSON | undefined,
  ): FreshProject | undefined => {
    if (!denoJson) {
      return undefined;
    }
    const hasFreshImport = denoJson?.imports?.["$fresh/"];
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

      const filepath = join(
        sourceLocalDir!,
        filename.replace(rootFilename, ""),
      );

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
      cwd: sourceLocalDir,
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
    if (!(await exists(join(sourceLocalDir!, "dev.ts")))) {
      console.log("no dev.ts file found, skipping build");
      return;
    }
    const cmd = new Deno.Command(Deno.execPath(), {
      args: buildArgs,
      cwd: sourceLocalDir,
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

  if (!sourceProvider || sourceProvider === "GITHUB") {
    console.log(
      `downloading source from git ${gitRepository} - ${commitSha}...`,
    );
    await downloadFromGit();
  } else {
    console.log(`copying source from ${filesLocalPath}...`);
    const copyCmd = new Deno.Command("cp", {
      args: ["-r", `${filesLocalPath}/.`!, `${sourceLocalDir}/.`],
      stdout: "inherit",
      stderr: "inherit",
      stdin: "inherit",
    }).spawn();
    const status = await copyCmd.status;
    if (!status.success) {
      console.error("Failed to copy files");
      Deno.exit(status.code);
    }
  }

  const getDenoJson = async () => {
    const readFileOrUndefined = (file: string) =>
      Deno.readTextFile(join(sourceLocalDir!, file)).catch((err) => {
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

    if (denoJson[0]) {
      return ["deno.json", denoJson[0]];
    } else {
      return ["deno.jsonc", denoJson[1]];
    }
  };

  const overrideDenoJson = async (
    configFileName: string,
    denoJson: DenoJSON,
  ) => {
    if (!denoJson) {
      return undefined;
    }

    // To add a new override just add a new function like those below and add it to the overrides array.
    const overrides = [overrideNodeModulesDir, overrideCompileOptions];

    const { acc: newDenoJson, hasChange } = overrides.reduce(
      ({ acc, hasChange }, override) => {
        const newOverride = override(acc);

        return {
          acc: newOverride.denoJson,
          hasChange: hasChange || newOverride.hasChange,
        };
      },
      { acc: denoJson, hasChange: false },
    );

    if (hasChange) {
      await updateFile(configFileName, denoJson);
    }

    return newDenoJson;
  };

  const overrideCompileOptions = (
    denoJson: DenoJSON,
  ) => {
    let hasChange = false;
    if (denoJson.compilerOptions === undefined) {
      denoJson.compilerOptions = {};
    }

    if (denoJson.compilerOptions.experimentalDecorators === undefined) {
      denoJson.compilerOptions.experimentalDecorators = true;
      hasChange = true;
    }

    // const freshVersion = denoJson.imports?.["$fresh/"];
    // const minFreshVersion = "1.6.0";
    // const preactVersion = denoJson.imports?.["preact"];
    // const minPreactVersion = "10.19.1";

    // if (
    //   denoJson.compilerOptions.jsx === "react-jsx" && freshVersion &&
    //   preactVersion
    // ) {
    //   if (
    //     //https://github.com/denoland/fresh/pull/2035
    //     gte(preactVersion, minPreactVersion) &&
    //     gte(freshVersion, minFreshVersion)
    //   ) {
    //     denoJson.compilerOptions.jsx = "precompile";
    //     denoJson.compilerOptions.jsxImportSource = "preact";

    //     hasChange = true;
    //   }
    // }

    return { denoJson, hasChange };
  };

  const overrideNodeModulesDir = (
    denoJson: DenoJSON,
  ) => {
    const hasNodeModulesDir = denoJson.nodeModulesDir;

    if (hasNodeModulesDir !== undefined && hasNodeModulesDir !== false) {
      denoJson.nodeModulesDir = false;

      return { denoJson, hasChange: true };
    }

    return { denoJson, hasChange: false };
  };

  const updateFile = async (
    configFileName: string,
    denoJson: DenoJSON,
  ) => {
    const fileContent = JSON.stringify(denoJson, null, 2);
    await Deno.writeTextFile(
      join(sourceLocalDir!, configFileName),
      fileContent,
    ).catch(
      (err) => {
        if (err instanceof Deno.errors.NotFound) {
          return;
        }
        throw err;
      },
    );
  };

  const [configFileName, denoJson] = await getDenoJson();

  console.log("Overriding deno.json file");
  const finalDenoJson = await overrideDenoJson(configFileName, denoJson);

  console.log(`generating cache...`);
  const freshPrj = getFrshProject(finalDenoJson);
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
BASE_BUILD_CACHE=$CACHE_REMOTE_OUTPUT
if [[ ! -f "$BASE_BUILD_CACHE" ]]; then
    BASE_BUILD_CACHE=$BUILD_CACHE_FALLBACK
fi

[[ -f "$BASE_BUILD_CACHE" ]] && echo "restoring cache..." && tar xvf "$BASE_BUILD_CACHE" -C $CACHE_LOCAL_DIR && echo "cache successfully restored! from $BASE_BUILD_CACHE"

deno run -A --unstable - << 'EOF'
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
