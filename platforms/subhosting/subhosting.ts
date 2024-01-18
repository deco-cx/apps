import { Subhosting as SubhostingClient } from "./deps.ts";
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
