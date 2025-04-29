import { AppContext } from "../mod.ts";

interface LoginSectionProps {
  auth: {
    authorizationUrl: string;
  };
  token: string;
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
    token: auth.access_token,
  };
}

export default function LoginSection(
  { auth: { authorizationUrl }, token }: LoginSectionProps,
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
            <div>
              <p className="text-red-500">Token:</p>
              <div className="flex items-center gap-2">
                <p>{token}</p>
              </div>

              <p className="text-sm text-gray-500">
                Ele só é valido por 1 hora
              </p>
            </div>
          )}
      </div>
    </>
  );
}
