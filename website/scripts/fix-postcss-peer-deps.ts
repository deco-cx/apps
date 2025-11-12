#!/usr/bin/env -S deno run --allow-read --allow-write

/**
 * Fix PostCSS peer dependency warnings by adding npm package overrides to deno.json.
 * 
 * This script detects peer dependency issues with postcss (commonly 8.4.27 vs 8.4.31+)
 * and adds the appropriate "overrides" configuration to force a compatible version.
 * 
 * Usage:
 *   deno run --allow-read --allow-write fix-postcss-peer-deps.ts [path-to-deno.json]
 * 
 * Example:
 *   deno run --allow-read --allow-write fix-postcss-peer-deps.ts
 *   deno run --allow-read --allow-write fix-postcss-peer-deps.ts /path/to/store/deno.json
 */

interface DenoConfig {
  [key: string]: unknown;
  imports?: Record<string, string>;
  nodeModulesDir?: string | boolean;
  npm?: {
    overrides?: Record<string, string>;
  };
}

async function fixPostcssPeerDeps(denoJsonPath: string) {
  console.log(`📦 Checking ${denoJsonPath}...`);

  // Read the deno.json file
  let config: DenoConfig;
  try {
    const content = await Deno.readTextFile(denoJsonPath);
    config = JSON.parse(content);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.error(`❌ File not found: ${denoJsonPath}`);
      Deno.exit(1);
    }
    console.error(`❌ Failed to parse ${denoJsonPath}:`, error);
    Deno.exit(1);
  }

  // Check if nodeModulesDir is deprecated
  if (config.nodeModulesDir === true) {
    console.log(`⚠️  Updating deprecated "nodeModulesDir": true → "auto"`);
    config.nodeModulesDir = "auto";
  }

  // Ensure npm.overrides exists
  if (!config.npm) {
    config.npm = {};
  }
  if (!config.npm.overrides) {
    config.npm.overrides = {};
  }

  // Add postcss override if not already present
  const targetPostcssVersion = "8.4.49";
  const currentOverride = config.npm.overrides["postcss"];

  if (currentOverride === targetPostcssVersion) {
    console.log(`✅ PostCSS override already set to ${targetPostcssVersion}`);
  } else {
    console.log(
      `🔧 Adding npm override: postcss → ${targetPostcssVersion}`,
    );
    config.npm.overrides["postcss"] = targetPostcssVersion;
  }

  // Write back the updated config with pretty formatting
  const updatedContent = JSON.stringify(config, null, 2) + "\n";
  await Deno.writeTextFile(denoJsonPath, updatedContent);

  console.log(`✅ Successfully updated ${denoJsonPath}`);
  console.log(
    `💡 Run \`deno install\` or \`deno cache\` to apply the changes.`,
  );
}

// Main execution
if (import.meta.main) {
  const denoJsonPath = Deno.args[0] || "./deno.json";

  try {
    await fixPostcssPeerDeps(denoJsonPath);
  } catch (error) {
    console.error(`❌ Error:`, error);
    Deno.exit(1);
  }
}

