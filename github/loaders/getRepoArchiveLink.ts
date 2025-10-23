import { AppContext } from "../mod.ts";

interface Props {
  owner: string;
  repo: string;
  ref?: string;
  format?: "tarball" | "zipball";
}

/**
 * @name GET_REPO_ARCHIVE_LINK
 * @title Get Repository Archive Link
 * @description Get an archive download URL (tar/zip) for a repository ref. Note: this returns a short-lived redirect URL.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ url: string; format: "tarball" | "zipball" }> => {
  const { owner, repo } = props;
  const ref = props.ref ?? "";
  const format = props.format ?? "tarball";
  if (format === "zipball") {
    const response = await ctx.client["GET /repos/:owner/:repo/zipball/:ref"]({
      owner,
      repo,
      ref,
    });
    return { url: response.url, format };
  }
  const response = await ctx.client["GET /repos/:owner/:repo/tarball/:ref"]({
    owner,
    repo,
    ref,
  });
  return { url: response.url, format };
};

export default loader;
