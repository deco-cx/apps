import { Context } from "deco/live.ts";
import {
  cancel as durableCancel,
  get as durableGet,
  history as durableHistory,
  signal as durableSignal,
  start as durableStart,
} from "./deps.ts";

const LOCAL_OPTIONS = {
  durableEndpoint: "http://localhost:8001",
  namespace: "x",
  audience: `urn:deco:site::samples:`,
  token:
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ1cm46ZGVjbzpzaXRlOjphZG1pbjpkZXBsb3ltZW50L3RzdCIsInN1YiI6InVybjpkZWNvOnNpdGU6Ong6ZGVwbG95bWVudC90c3QiLCJzY29wZXMiOlsiaHR0cDovL2xvY2FsaG9zdDo4MDAwLyoiLCJ3czovL2xvY2FsaG9zdDo4MDAwLyoiXX0.awdXDppwF-Dn7BwMWLz3hHqlx16HfVBuPuoGP4mVBihkMxwqDvZYWi_1Dg27u6ajg9br9qL6xSTlN8nauo89AyELaQavUIPDnW5u1yZpVZ5XE1C7DyVc3ncGe8L_PjuRqkfkc24POCiPVALYqKpJ7uERkjoSSRT5BBbuPvuWYZQaeNpkw6CUKWzod9myg7evtbIBEuLHnNyhT2hKmdzLuJNzakS-cyZVIQ6Pm_JDTQhdH15QyDNviJ6tM6HrNARgti40QUOAwRpACLZ16LsEpAitaZPBx7KNDr456indBP_HqZF6crO3yUQEFSN5Yb323VLjtaX2SVSqIP0uOLn0yA",
};
const decoDurableServiceUrl = Deno.env.get("DECO_DURABLE_SERVICE_URL");
const durableToken = Deno.env.get("DURABLE_TOKEN");
const durableDefaultOpts = () => {
  const context = Context.active();
  const remoteOptions = {
    durableEndpoint: decoDurableServiceUrl ??
      "https://durable-workers.deco-cx.workers.dev",
    namespace: context.site,
    audience:
      `urn:deco:site::${context.site}:deployment/${context.deploymentId}`,
    token: durableToken,
  };
  return context.isDeploy ? remoteOptions : LOCAL_OPTIONS;
};

export const cancel: typeof durableCancel = (id, reason, opts) => {
  return durableCancel(id, reason, opts ?? durableDefaultOpts());
};
export const get: typeof durableGet = (id, opts) => {
  return durableGet(id, opts ?? durableDefaultOpts());
};
export const history: typeof durableHistory = (id, pagination, opts) => {
  return durableHistory(id, pagination, opts ?? durableDefaultOpts());
};
export const signal: typeof durableSignal = (id, event, payload, opts) => {
  return durableSignal(id, event, payload, opts ?? durableDefaultOpts());
};
export const start: typeof durableStart = (exec, restart, opts) => {
  return durableStart(exec, restart, opts ?? durableDefaultOpts());
};
