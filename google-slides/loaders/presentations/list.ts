import type { AppContext } from "../../mod.ts";

interface Props {
  /**
   * @title Page Size
   * @description Number of presentations to return (max 100)
   * @default 10
   */
  pageSize?: number;

  /**
   * @title Page Token
   * @description Token for pagination
   */
  pageToken?: string;

  /**
   * @title Search Query
   * @description Additional search query to filter presentations
   */
  q?: string;

  /**
   * @title Order By
   * @description Sort order for results
   * @default "modifiedTime desc"
   */
  orderBy?: string;
}

interface PresentationItem {
  id: string;
  name: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
  iconLink?: string;
}

interface ListResponse {
  presentations: PresentationItem[];
  nextPageToken?: string;
}

/**
 * @title List Presentations
 * @description Lists Google Slides presentations using Drive API
 */
export default async function listPresentations(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ListResponse> {
  const {
    pageSize = 10,
    pageToken,
    q,
    orderBy = "modifiedTime desc",
  } = props;

  // Build query for Google Slides presentations
  const mimeType = "application/vnd.google-apps.presentation";
  const baseQuery = `mimeType='${mimeType}' and trashed=false`;
  const fullQuery = q ? `${baseQuery} and (${q})` : baseQuery;

  // Note: We need to use a direct HTTP call since we're calling Drive API
  // from Slides app context. In a real implementation, you might want to
  // create a Drive client or use a shared service.

  const searchParams = new URLSearchParams({
    pageSize: pageSize.toString(),
    q: fullQuery,
    orderBy,
    fields:
      "nextPageToken,files(id,name,createdTime,modifiedTime,webViewLink,iconLink)",
  });

  if (pageToken) {
    searchParams.set("pageToken", pageToken);
  }

  // Using the oauth client to make the Drive API call
  const driveApiUrl =
    `https://www.googleapis.com/drive/v3/files?${searchParams.toString()}`;

  const response = await fetch(driveApiUrl, {
    headers: {
      "Authorization": `Bearer ${ctx.client.oauth.tokens.access_token}`,
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to list presentations: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();

  // deno-lint-ignore no-explicit-any
  const presentations: PresentationItem[] = data.files?.map((file: any) => ({
    id: file.id,
    name: file.name,
    createdTime: file.createdTime,
    modifiedTime: file.modifiedTime,
    webViewLink: file.webViewLink,
    iconLink: file.iconLink,
  })) || [];

  return {
    presentations,
    nextPageToken: data.nextPageToken,
  };
}
