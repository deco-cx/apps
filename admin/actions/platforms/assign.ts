export interface Props {
  site: string;
  platform: string;
}

let kvPromise: Promise<Deno.Kv> | undefined;

const keyPrefix = ["platforms", "sites"];

export const getPlatformOf = async (
  site: string,
): Promise<string | undefined> => {
  kvPromise ??= Deno.openKv();

  const kv = await kvPromise;

  return (await kv.get<{ platform: string }>([...keyPrefix, site])).value
    ?.platform ?? undefined;
};

export default async function assign(
  _props: Props,
  _req: Request,
): Promise<void> {
  kvPromise ??= Deno.openKv();

  const kv = await kvPromise;

  await kv.set([...keyPrefix, _props.site], {
    platform: _props.platform,
  });
}
