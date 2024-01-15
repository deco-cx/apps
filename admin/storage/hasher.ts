export async function calculateGitSha1(bytes: Uint8Array) {
  const prefix = `blob ${bytes.byteLength}\0`;
  const prefixBytes = new TextEncoder().encode(prefix);
  const fullBytes = new Uint8Array(prefixBytes.byteLength + bytes.byteLength);
  fullBytes.set(prefixBytes);
  fullBytes.set(bytes, prefixBytes.byteLength);
  const hashBytes = await crypto.subtle.digest("SHA-1", fullBytes);
  const hashHex = Array.from(new Uint8Array(hashBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
