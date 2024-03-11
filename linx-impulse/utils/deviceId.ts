import { AppContext } from "../mod.ts";

const DEVICE_ID = Symbol("deviceId");

export const getDeviceIdFromBag = (ctx: AppContext) => ctx.bag.get(DEVICE_ID);
export const setDeviceIdInBag = (ctx: AppContext, deviceId: string) =>
  ctx.bag.set(DEVICE_ID, deviceId);
