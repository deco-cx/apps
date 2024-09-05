export async function sha256Hash(input: string) {
  const utf8Encoder = new TextEncoder();
  const inputBytes = utf8Encoder.encode(input);

  const hashBuffer = await crypto.subtle.digest("SHA-256", inputBytes);

  return Array.prototype.map.call(new Uint8Array(hashBuffer), (byte) => {
    return ("00" + byte.toString(16)).slice(-2);
  }).join("");
}

export function generateUniqueIdentifier() {
  const timestamp = new Date().getTime();
  const randomComponent = Math.floor(Math.random() * 1000000);
  const inputForHash = `${timestamp}${randomComponent}`;
  return btoa(inputForHash);
}
