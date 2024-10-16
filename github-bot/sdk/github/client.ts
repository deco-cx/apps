import type { Endpoints, Octokit } from "../../deps/deps.ts";

type PullsParameters =
  Endpoints["GET /repos/{owner}/{repo}/pulls"]["parameters"];
type PullsResponse = Endpoints["GET /repos/{owner}/{repo}/pulls"]["response"];
type RequestReviewResponse = Endpoints[
  "POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"
][
  "response"
];

export class GithubClient {
  constructor(private octokit: Octokit) {}

  public async getPullRequests(params: PullsParameters) {
    const response = await this.octokit.request(
      "GET /repos/{owner}/{repo}/pulls",
      params,
    ) as PullsResponse;

    return response.data;
  }

  public async requestReviewersForPull(
    organization: string,
    repoName: string,
    pullNumber: number,
    reviewers: string[],
  ) {
    const response = await this.octokit.request(
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers",
      {
        owner: organization,
        repo: repoName,
        pull_number: pullNumber,
        reviewers,
      },
    ) as RequestReviewResponse;

    return response.data;
  }
}
