// Cross-runtime cookie utilities
export function getCookies(headers: Headers): Record<string, string> {
  const cookieHeader = headers.get("cookie");
  if (!cookieHeader) return {};
  
  return Object.fromEntries(
    cookieHeader.split(";").map((cookie) => {
      const [name, ...valueParts] = cookie.trim().split("=");
      return [name, valueParts.join("=")];
    })
  );
}

export function getSetCookies(headers: Headers): { name: string; value: string }[] {
  const setCookies = headers.getSetCookie?.() ?? [];
  return setCookies.map((cookie) => {
    const [nameValue] = cookie.split(";");
    const [name, value] = nameValue.split("=");
    return { name, value };
  });
}
