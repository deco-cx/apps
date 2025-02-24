import type { AppContext } from "../mod.ts";

interface User {
  login: string;
  avatar_url: string;
}

interface Props {
  user: User;
  authorizationUrl: string;
  channelData: any;
  channel: any;
}

export function loader(_props: unknown, _req: Request, ctx: AppContext) {
  const dataUser = ctx.invoke.Youtube.loaders.authentication();
  //const channel = ctx.invoke.Youtube.loaders.channels()
  console.log(dataUser);
  return {
    ...dataUser,
    //channel
  };
}

export default function Section(
  { user, authorizationUrl, channelData, channel }: Props,
) {
  console.log(channel);
  return (
    <div>
      {!channelData
        ? (
          <div class="btn">
            <h1>{user?.login}</h1>
            <img src={user?.avatar_url} alt="avatar" />
            <a href={authorizationUrl}>Login with Google</a>
          </div>
        )
        : (
          <div>
            <h2>Logado com sucesso!</h2>
            <p>Token de acesso obtido!</p>
            {channelData.map((channel: any) => (
              <div
                key={channel.id}
                style={{
                  border: "1px solid #ccc",
                  padding: "16px",
                  margin: "16px 0",
                }}
              >
                <h3>{channel.snippet.title}</h3>
                <img
                  src={channel.snippet.thumbnails.high.url}
                  alt="Channel Thumbnail"
                  style={{ width: "100px", borderRadius: "50%" }}
                />
                <p>
                  <strong>URL Personalizada:</strong>{" "}
                  {channel.snippet.customUrl}
                </p>
                <p>
                  <strong>País:</strong> {channel.snippet.country}
                </p>
                <p>
                  <strong>Descrição:</strong>{" "}
                  {channel.snippet.description || "Sem descrição"}
                </p>
                <p>
                  <strong>Publicado em:</strong>{" "}
                  {new Date(channel.snippet.publishedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
