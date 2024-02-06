import { FileSystemNode, walk } from "../../files/sdk.ts";
import { Subhosting as SubhostingClient } from "./deps.ts";
import { calculateGitSha1 } from "./sha1.ts";
export interface ManifestEntryFile {
  kind: "file";
  gitSha1: string;
  size: number;
}

export interface ManifestEntryDirectory {
  kind: "directory";
  entries: Record<string, ManifestEntry>;
}

export interface ManifestEntrySymlink {
  kind: "symlink";
  target: string;
}

export type ManifestEntry =
  | ManifestEntryFile
  | ManifestEntryDirectory
  | ManifestEntrySymlink;

const textEncoder = new TextEncoder();
export const buildEntries = async (
  node: FileSystemNode,
): Promise<Record<string, ManifestEntry>> => {
  const entries: Record<string, ManifestEntry> = {};

  const entriesBuild: Promise<void>[] = [];

  for (const { path, content } of walk(node)) {
    const segments = path.split("/");
    const fileName = segments.pop()!;
    let currEntries = entries;
    for (const dir of segments) {
      const currDir = {
        kind: "directory" as const,
        entries: {},
      };
      currEntries[dir] = currDir;
      currEntries = currDir.entries;
    }
    const data = textEncoder.encode(content);
    const gitSha1Promise = calculateGitSha1(data);
    entriesBuild.push(gitSha1Promise.then((gitSha1) => {
      currEntries[fileName] = {
        kind: "file" as const,
        gitSha1,
        size: data.byteLength,
      };
    }));
  }
  await Promise.all(entriesBuild);
  return entries;
};
export class Subhosting extends SubhostingClient {
  async createDatabase(
    desc?: string,
  ): Promise<Response> {
    return await this.fetch(`/organizations/${this.orgId}/databases`, {
      method: "POST",
      body: JSON.stringify({ description: desc ?? null }),
    });
  }
  async negotiateAssets(
    projectId: string,
    manifest: { entries: Record<string, ManifestEntry> },
  ) {
    return await this.fetch(`/projects/${projectId}/assets/negotiate`, {
      method: "POST",
      body: JSON.stringify(manifest),
    });
  }
}
