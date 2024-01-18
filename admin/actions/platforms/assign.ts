export interface Props {
  site: string;
  platform: string;
}
const kv = await Deno.openKv();
const keyPrefix = ["platforms", "sites"];
export const getPlatformOf = async (site: string): Promise<string | null> => {
  return (await kv.get<{ platform: string }>([...keyPrefix, site])).value
    ?.platform ?? null;
};
export default async function assign(
  _props: Props,
  _req: Request,
): Promise<void> {
  await kv.set([...keyPrefix, _props.site], {
    platform: _props.platform,
  });
}
