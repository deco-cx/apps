import { join } from "@std/path";

const init = async (appName: string) => {
  const repoUrl = "https://github.com/deco-cx/app-template";
  const appPath = join(Deno.cwd(), appName);
  const decoTsPath = join(Deno.cwd(), "deco.ts");
  const decoTs = await Deno.readTextFile(decoTsPath);

  await Deno.mkdir(appPath);

  const gitClone = new Deno.Command("git", {
    args: ["clone", "--depth", "1", repoUrl, appPath],
  });

  await gitClone.output();

  await Deno.writeTextFile(
    decoTsPath,
    decoTs.replace(`  apps: [`, `  apps: [\n    app("${appName}"),`),
  );

  const denoJsonPath = join(appPath, "deno.json");
  await Deno.remove(denoJsonPath);

  const gitDirPath = join(appPath, ".git");
  await Deno.remove(gitDirPath, { recursive: true });
};

if (import.meta.main) {
  const name = prompt("What's the app name?:");

  if (name) {
    await init(name);
  } else {
    console.error("app name is required");
  }
}
