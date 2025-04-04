import { getCookies } from "@std/http";

export default function getAccessToken(req: Request) {
  const cookies = getCookies(req.headers);
  return cookies.youtube_access_token;
}
