import type { AppContext } from "../mod.ts";

interface User {
  login: string;
  avatar_url: string;
}

interface Props {
  user: User;
  authorizationUrl: string;
  channelData: any;
  accessToken: string | null;
}

export async function loader(_props: unknown, _req: Request, ctx: AppContext) {
  console.log("Iniciando carregamento da seção YouTube...");
  const dataUser = await ctx.invoke.Youtube.loaders.authentication();
  console.log("Dados de autenticação carregados:", {
    accessToken: dataUser.accessToken ? "presente" : "ausente",
    canais: dataUser.channelData ? "carregados" : "não carregados",
    authURL: dataUser.authorizationUrl ? "configurada" : "não configurada",
  });

  return {
    ...dataUser,
  };
}

export default function Section(
  { user, authorizationUrl, channelData, accessToken }: Props,
) {
  // Estilos CSS inline
  const styles = {
    container: {
      maxWidth: "800px",
      margin: "0 auto",
      padding: "20px",
      fontFamily: "Arial, sans-serif",
    },
    loginButton: {
      display: "inline-block",
      backgroundColor: "#FF0000",
      color: "white",
      padding: "12px 24px",
      borderRadius: "4px",
      textDecoration: "none",
      fontWeight: "bold",
      margin: "20px 0",
      transition: "background-color 0.3s ease",
      cursor: "pointer",
    },
    loginContainer: {
      textAlign: "center" as const,
      padding: "40px 20px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      backgroundColor: "#f9f9f9",
    },
    channel: {
      border: "1px solid #ddd",
      padding: "16px",
      margin: "16px 0",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    avatar: {
      width: "100px",
      height: "100px",
      borderRadius: "50%",
      objectFit: "cover" as const,
    },
    heading: {
      color: "#333",
      borderBottom: "2px solid #FF0000",
      paddingBottom: "8px",
      marginBottom: "20px",
    },
    debug: {
      backgroundColor: "#f8f8f8",
      border: "1px solid #ddd",
      padding: "10px",
      margin: "20px 0",
      borderRadius: "4px",
      fontSize: "12px",
      fontFamily: "monospace",
    },
  };

  return (
    <div style={styles.container}>
      {!accessToken
        ? (
          <div style={styles.loginContainer}>
            <h2 style={styles.heading}>Acesse seus canais do YouTube</h2>
            <p>
              Faça login com sua conta do Google para visualizar seus canais do
              YouTube.
            </p>
            {authorizationUrl
              ? (
                <a href={authorizationUrl} style={styles.loginButton}>
                  Login com Google
                </a>
              )
              : (
                <div style={{ color: "red", marginTop: "20px" }}>
                  Erro: URL de autorização não disponível. Por favor, recarregue
                  a página.
                </div>
              )}
            {/* Debug info */}
            <div style={styles.debug}>
              <p>
                <strong>Estado:</strong> Não autenticado
              </p>
              <p>
                <strong>URL de Autorização:</strong> {authorizationUrl
                  ? authorizationUrl.substring(0, 50) + "..."
                  : "Não configurada"}
              </p>
            </div>
          </div>
        )
        : (
          <div>
            <h2 style={styles.heading}>YouTube Dashboard</h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 5px 0" }}>Usuário Autenticado</h3>
                <p style={{ margin: 0, color: "#555" }}>
                  Você está logado com sucesso no YouTube!
                </p>
              </div>
            </div>

            {/* Debug info */}
            <div style={styles.debug}>
              <p>
                <strong>Estado:</strong> Autenticado
              </p>
              <p>
                <strong>Token:</strong> {accessToken
                  ? accessToken.substring(0, 15) + "..."
                  : "Não disponível"}
              </p>
              <p>
                <strong>Canais:</strong>{" "}
                {Array.isArray(channelData) ? channelData.length : "Nenhum"}
              </p>
            </div>

            {Array.isArray(channelData) && channelData.length > 0
              ? (
                <div>
                  <h3 style={styles.heading}>Seus Canais</h3>
                  {channelData.map((channel: any) => (
                    <div key={channel.id} style={styles.channel}>
                      <h3>{channel.snippet.title}</h3>
                      {channel.snippet.thumbnails?.high?.url && (
                        <img
                          src={channel.snippet.thumbnails.high.url}
                          alt="Thumbnail do Canal"
                          style={styles.avatar}
                        />
                      )}
                      {channel.snippet.customUrl && (
                        <p>
                          <strong>URL Personalizada:</strong>{" "}
                          {channel.snippet.customUrl}
                        </p>
                      )}
                      {channel.snippet.country && (
                        <p>
                          <strong>País:</strong> {channel.snippet.country}
                        </p>
                      )}
                      <p>
                        <strong>Descrição:</strong>{" "}
                        {channel.snippet.description || "Sem descrição"}
                      </p>
                      {channel.snippet.publishedAt && (
                        <p>
                          <strong>Publicado em:</strong>{" "}
                          {new Date(channel.snippet.publishedAt)
                            .toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )
              : (
                <div
                  style={{
                    padding: "20px",
                    backgroundColor: "#f8f8f8",
                    borderRadius: "8px",
                  }}
                >
                  <p>
                    Nenhum canal encontrado. Isso pode ocorrer pelos seguintes
                    motivos:
                  </p>
                  <ul>
                    <li>Você não possui canais no YouTube</li>
                    <li>Ocorreu um erro ao buscar seus canais</li>
                    <li>A autenticação não foi concluída corretamente</li>
                  </ul>
                  <a
                    href={authorizationUrl}
                    style={{
                      ...styles.loginButton,
                      backgroundColor: "#4285F4",
                    }}
                  >
                    Tentar novamente
                  </a>
                </div>
              )}
          </div>
        )}
    </div>
  );
}
