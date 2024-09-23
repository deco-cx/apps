import { join } from "std/path/mod.ts";

const appName = Deno.args[0];
const repoUrl = "https://github.com/deco-cx/app-template"
const appPath = join(Deno.cwd(), appName);
const decoTsPath = join(Deno.cwd(), "deco.ts");
const decoTs = await Deno.readTextFile(decoTsPath);

// Criar a pasta do novo app
await Deno.mkdir(appPath);

// Clonar o repositório para a nova pasta criada
const gitClone = Deno.run({
  cmd: ["git", "clone", repoUrl, appPath],
});

// Aguarda o comando de clonagem terminar
await gitClone.status();
gitClone.close();

// Atualizar o arquivo deco.ts com o novo app
await Deno.writeTextFile(
  decoTsPath,
  decoTs.replace(`  apps: [`, `  apps: [\n    app("${appName}"),`)
);

const denoJsonPath = join(appPath, "deno.json");
await Deno.remove(denoJsonPath);