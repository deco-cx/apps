import { AppContext } from "../mod.ts";

interface LoginSectionProps {
  auth: {
    authorizationUrl: string;
    accessToken: string;
  };
}

export async function loader(
  _props: undefined,
  _req: Request,
  ctx: AppContext,
) {
  const auth = await ctx.invoke["google-slides"].loaders.authClient();
  console.log("auth", auth);
  return {
    auth,
  };
}

export default function LoginSection(
  { auth: { authorizationUrl, accessToken } }: LoginSectionProps,
) {
  return (
    <>
      <div>
        {authorizationUrl
          ? (
            <a
              href={authorizationUrl}
              class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Login
            </a>
          )
          : (
            <div class="text-red-500">
              {accessToken}
            </div>
          )}
      </div>
    </>
  );
}
