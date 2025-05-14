import { AppContext } from "../mod.ts";

interface LoginSectionProps {
  auth: {
    authorizationUrl?: string;
    access_token?: string;
    error?: string;
  };
  token?: string;
}

export async function loader(
  _props: undefined,
  _req: Request,
  ctx: AppContext,
) {
  const auth = await ctx.invoke["google-sheets"].loaders.authClient();
  return {
    auth,
    token: auth.access_token,
  };
}

export default function LoginSection(
  { auth, token }: LoginSectionProps,
) {
  console.log("Token de autenticação:", token);
  console.log("Objeto auth completo:", auth);

  return (
    <>
      <div>
        {auth.authorizationUrl
          ? (
            <a
              href={auth.authorizationUrl}
              class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Login
            </a>
          )
          : (
            <div>
              <p className="text-red-500">Token:</p>
              <div className="flex items-center gap-2">
                <p>
                  {token ||
                    "Token não disponível ainda. Faça o login primeiro."}
                </p>
              </div>

              {token && (
                <p className="text-sm text-gray-500">
                  Ele só é valido por 1 hora
                </p>
              )}

              {auth.error && (
                <p className="text-sm text-red-500">
                  Erro: {auth.error}
                </p>
              )}
            </div>
          )}
      </div>
    </>
  );
}
