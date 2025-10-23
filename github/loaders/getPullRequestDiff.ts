export interface Props {
  owner: string;
  repo: string;
  pull_number: number;
}

/**
 * @name GET_PUBLIC_PULL_REQUEST_DIFF
 * @title Get Public Pull Request Diff
 * @description Get the diff format of a pull request directly from GitHub's diff URL.
 */
const loader = async (
  props: Props,
  _req: Request,
): Promise<{ diff: string }> => {
  const { owner, repo, pull_number } = props;

  const diffUrl =
    `https://github.com/${owner}/${repo}/pull/${pull_number}.diff`;

  const response = await fetch(diffUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch diff: ${response.status} ${response.statusText}`,
    );
  }

  const diff = await response.text();

  return { diff };
};

export default loader;
