export const getClientIP = (headers: Headers) => {
  const cfConnectingIp = headers.get("cf-connecting-ip");
  const xForwardedFor = headers.get("x-forwarded-for");

  if (cfConnectingIp) return cfConnectingIp;

  return xForwardedFor;
};

export const parseHeaders = (headers: Headers) => {
  const clientIP = getClientIP(headers);

  const newHeaders = new Headers();

  if (clientIP) newHeaders.set("X-Forwarded-For", clientIP);

  return newHeaders;
};
