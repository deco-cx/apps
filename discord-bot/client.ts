import { Octokit } from "octokit";
import { Endpoints } from "octokit/types";

export interface DiscordCommandOption {
  name: string;
  description: string;
  required: boolean;
  type: number;
}

export interface DiscordCommand {
  name: string;
  description: string;
  options: DiscordCommandOption[];
  type: number;
}

export interface DiscordClient {
  "PUT commands": {
    response: void;
    body: DiscordCommand[];
  };
}

/**
 * TODO: Octokit doesn't work with esm.sh (timeouts) apparently. Didn't investigate a lot on why
 * skypack was being used.
 *
 * But, also apparently, Skypack doesn't return types all that good. At least we're not leveraging it.
 *
 * So, I've included types from esm.sh (only types).
 *
 * At the same time, after using the client fully-typed,
 * I'm starting to think that we might not need this client
 * and Octokit might be enough.
 *
 * Also: RepoOwner shouldn't be constant in the future (repos will be hosted elsewhere),
 * so we might use the opportunity to take this into consideration
 */

const _client = (octokit_token: string) =>
  new Octokit({
    auth: octokit_token,
  });

export interface Reviewer {
  login: string;
}

export interface PullRequest {
  url: string;
  state: string;
  title: string;
  owner: string;
  reviewers: Reviewer[];
}

export class GithubClient {
  private static getOctokit(octokit_token: string) {
    return _client(octokit_token);
  }

  public static async getAllActivePulls(
    organization: string,
    repoName: string,
    octokit_token: string,
  ) {
    const octokit = this.getOctokit(octokit_token);
    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/pulls?state=open",
      { owner: organization, repo: repoName },
    ) as Endpoints["GET /repos/{owner}/{repo}/pulls"]["response"];

    // I'm not sure which sort is being used, but it's possible that this
    // response only contains the first page. Might need to do some pagination here
    // if we discover some important branches are not being returned.

    return response.data;
  }

  public static async requestReviewersForPull(
    organization: string,
    repoName: string,
    pullNumber: string,
    reviewers: string[],
    octokit_token: string,
  ) {
    const octokit = this.getOctokit(octokit_token);
    const response = await octokit.request(
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers",
      {
        owner: organization,
        repo: repoName,
        pull_number: pullNumber,
        reviewers,
      },
    ) as Endpoints[
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"
    ]["response"];

    return response.data;
  }
}
