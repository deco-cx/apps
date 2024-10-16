const kv = await Deno.openKv();

export async function getPullRequestThreadId(id: string) {
  return (await kv.get<string>([id])).value;
}

export async function setPullRequestThreadId(id: string, threadId: string) {
  await kv.set([id], threadId);
  return threadId;
}

export async function deletePullRequestThreadId(id: string) {
  await kv.delete([id]);
}
