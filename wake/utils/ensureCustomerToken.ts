export default function (token: string | null) {
  if (!token) {
    throw new Error("No customer access token cookie, are you logged in?");
  }

  return token;
}
