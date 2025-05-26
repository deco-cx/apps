import { join } from "@std/path";
import { Select } from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/select.ts";
import { Input } from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/input.ts";
import { Confirm } from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/confirm.ts";

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

type TemplateType = "APP" | "MCP";

interface Template {
  repoUrl: string;
  postInstall?: (appPath: string) => Promise<void>;
}

const templates: Record<TemplateType, Record<string, Template>> = {
  APP: {
    default: {
      repoUrl: "https://github.com/deco-cx/app-template",
    },
  },
  MCP: {
    Oauth: {
      repoUrl: "https://github.com/deco-cx/mcp-oauth-template",
    },
  },
};

const listTemplates = (type: TemplateType): string[] => {
  return Object.keys(templates[type]);
};

const validateProjectName = (name: string): string | true => {
  if (!name.includes("-") && !name.includes("_") && !/[A-Z]/.test(name)) {
    return true;
  }

  const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

  if (!kebabCaseRegex.test(name)) {
    return `Name must be in kebab-case format (ex: "mcp-oauth-template", not "mcpOauthTemplate")`;
  }

  return true;
};

// Initialize a new project from template
const init = async (name: string, type: TemplateType, templateName: string) => {
  const template = templates[type][templateName];
  if (!template) {
    throw new Error(`Template ${templateName} não encontrado para ${type}`);
  }

  const appPath = join(Deno.cwd(), name);

  try {
    const exists = await Deno.stat(appPath).catch(() => false);
    if (exists) {
      const overwrite = await Confirm.prompt({
        message: `A pasta ${name} já existe. Deseja sobrescrever?`,
        default: false,
      });

      if (!overwrite) {
        console.log(`${colors.yellow}Operação cancelada.${colors.reset}`);
        Deno.exit(0);
      }

      console.log(`${colors.yellow}Removing existing folder...${colors.reset}`);
      await Deno.remove(appPath, { recursive: true });
    }

    console.log(`${colors.blue}Creating project folder...${colors.reset}`);
    await Deno.mkdir(appPath);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        `${colors.red}Error creating folder: ${error.message}${colors.reset}`,
      );
    } else {
      console.error(
        `${colors.red}Unknown error creating folder${colors.reset}`,
      );
    }
    Deno.exit(1);
  }

  const decoTsPath = join(Deno.cwd(), "deco.ts");
  const decoTs = await Deno.readTextFile(decoTsPath);

  console.log(
    `${colors.blue}Cloning template from repository...${colors.reset}`,
  );
  const gitClone = new Deno.Command("git", {
    args: ["clone", "--depth", "1", template.repoUrl, appPath],
  });

  await gitClone.output();

  // Find the apps section in deco.ts file
  const searchPattern = /\s*apps:\s*\[/;
  const match = decoTs.match(searchPattern);

  if (!match) {
    throw new Error(`Não foi possível encontrar a seção apps no deco.ts`);
  }

  const lines = decoTs.split("\n");
  const lineIndex = lines.findIndex((line) => searchPattern.test(line));

  if (lineIndex === -1) {
    throw new Error(`Não foi possível encontrar a linha correta no deco.ts`);
  }

  lines.splice(lineIndex + 1, 0, `    app("${name}"),`);

  console.log(`${colors.blue}Updating deco.ts...${colors.reset}`);
  await Deno.writeTextFile(
    decoTsPath,
    lines.join("\n"),
  );

  const denoJsonPath = join(appPath, "deno.json");
  try {
    const exists = await Deno.stat(denoJsonPath).catch(() => false);
    if (exists) {
      await Deno.remove(denoJsonPath);
    }
  } catch (_error) {
    console.log(
      `${colors.yellow}Note: deno.json not found at ${denoJsonPath}${colors.reset}`,
    );
  }

  const gitDirPath = join(appPath, ".git");
  try {
    const exists = await Deno.stat(gitDirPath).catch(() => false);
    if (exists) {
      // Remove template's git history as this will be part of main repository
      await Deno.remove(gitDirPath, { recursive: true });
    }
  } catch (_error) {
    console.log(
      `${colors.yellow}Note: .git directory not found at ${gitDirPath}${colors.reset}`,
    );
  }

  // Run post-install hooks if defined
  if (template.postInstall) {
    console.log(
      `${colors.blue}Running additional configurations...${colors.reset}`,
    );
    await template.postInstall(appPath);
  }

  console.log(
    `${colors.green}${colors.bold}✅ Project ${name} created successfully!${colors.reset}`,
  );
  console.log(
    `${colors.cyan}🚀 Run 'deno task start' to update manifest...${colors.reset}`,
  );

  const startCommand = new Deno.Command("deno", {
    args: ["task", "start"],
    cwd: Deno.cwd(),
  });

  await startCommand.output();
};

if (import.meta.main) {
  console.log(
    `${colors.bold}${colors.cyan}🔧 Deco Project Generator${colors.reset}\n`,
  );

  const type = await Select.prompt({
    message: "Select the type",
    options: ["APP", "MCP"],
  }) as TemplateType;

  const availableTemplates = listTemplates(type);

  let templateName: string;

  if (availableTemplates.length === 1) {
    templateName = availableTemplates[0];
    console.log(
      `${colors.blue}Auto-selecting template: ${colors.cyan}${templateName}${colors.reset}`,
    );
  } else {
    console.log(
      `${colors.blue}Available templates for ${type}:${colors.reset}`,
    );
    templateName = await Select.prompt({
      message: "Selecione o template",
      options: availableTemplates,
    });
  }

  const name = await Input.prompt({
    message: "What is the name of your project?",
    minLength: 1,
    validate: validateProjectName,
  });

  await init(name, type, templateName);
}
