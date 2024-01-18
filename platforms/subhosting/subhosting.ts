import { Subhosting as SubhostingClient } from "./deps.ts";
export class Subhosting extends SubhostingClient {
  async createDatabase(
    desc?: string,
  ): Promise<Response> {
    return await this.fetch(`/organizations/${this.orgId}/databases`, {
      method: "POST",
      body: JSON.stringify({ description: desc ?? null }),
    });
  }
}
