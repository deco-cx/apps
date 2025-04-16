import { AuthenticationResult } from "../loaders/auth/authenticate.ts";
import { AppContext } from "../mod.ts";

interface Props {
  auth: AuthenticationResult;
}

export async function loader(
  _props: undefined,
  _req: Request,
  ctx: AppContext,
) {
  const auth = await ctx.invoke.Youtube.loaders.auth.authenticate();
  return {
    auth,
  };
}

export default function LoginSection({ auth: { authorizationUrl } }: Props) {
  return (
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
            Erro: URL de autorização não disponível. Por favor, recarregue a
            página.
          </div>
        )}
    </div>
  );
}
