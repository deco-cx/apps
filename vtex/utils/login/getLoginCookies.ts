function getLoginCookies({ cookies }: { cookies: Record<string, string> }) {
  const vid_rt = cookies.vid_rt;

  const vtexAuthCookies: Record<string, string> = {};

  Object.keys(cookies).forEach((cookieName) => {
    if (cookieName.startsWith("VtexIdclientAutCookie_")) {
      vtexAuthCookies[cookieName] = cookies[cookieName];
    }
  });

  return {
    vid_rt,
    ...vtexAuthCookies,
  };
}

export default getLoginCookies;
