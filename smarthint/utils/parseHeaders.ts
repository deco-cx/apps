import { hash } from "https://deno.land/x/deno_cache@0.4.1/util.ts";

export const getClientIP = (headers: Headers) => {
  const cfConnectingIp = headers.get("cf-connecting-ip");
  const xForwardedFor = headers.get("x-forwarded-for");

  if (cfConnectingIp) return cfConnectingIp;

  return xForwardedFor;
};


export const getUserHash = (headers: Headers) => {
  const clientIp = getClientIP(headers) ?? ''
  const date = new Date()

  return hash(`${clientIp}${date.toISOString()}`)
}