export default function (token: string | undefined) {
  if (!token) console.error("No checkout cookie");

  return token;
}
