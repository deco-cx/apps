import { dirname, fromFileUrl, resolve } from "std/path/mod.ts";
import { copy } from "std/fs/copy.ts";

// Script location
const __dirname = dirname(fromFileUrl(import.meta.url));

//Database location
const sourceFilePath = resolve(__dirname, "../db/schema.ts");

//Destiny
const destinationDir = resolve(Deno.cwd(), "db");

// Destiny full path
const destinationFilePath = resolve(destinationDir, "schema.ts");

await Deno.mkdir(destinationDir, { recursive: true });

try {
    await copy(sourceFilePath, destinationFilePath);
    console.log(`Database successfully copied to: ${destinationFilePath}`);
} catch (error) {
    console.error("Error in file copy:", error);
}
