import type { AppContext } from "../mod.ts";

interface User {
  login: string;
  avatar_url: string;
}

interface Props {
  user: User;
  authorizationUrl: string;
  channelData: any;
  videoData: any;
  accessToken: string | null;
  tab?: string;
}

export async function loader(
  props: { tab?: string },
  req: Request, 
  ctx: AppContext
) {
  console.log("Iniciando carregamento da seção YouTube...");
  const dataUser = await ctx.invoke.Youtube.loaders.authentication();
  console.log("Dados de autenticação carregados:", {
    accessToken: dataUser.accessToken ? "presente" : "ausente",
    canais: dataUser.channelData ? "carregados" : "não carregados",
    authURL: dataUser.authorizationUrl ? "configurada" : "não configurada",
  });

  // Se temos um token de acesso, também buscamos os vídeos
  let videoData = null;
  if (dataUser.accessToken && dataUser.channelData && dataUser.channelData.length > 0) {
    try {
      // Usa o primeiro canal para buscar os vídeos
      const channelId = dataUser.channelData[0].id;
      videoData = await ctx.invoke.Youtube.loaders.videos({ 
        channelId: channelId,
        maxResults: 10
      });
      console.log("Vídeos carregados:", videoData ? "sim" : "não");
    } catch (error) {
      console.error("Erro ao carregar vídeos:", error);
    }
  }

  // Define a aba ativa a partir dos parâmetros da requisição ou usa "channels" como padrão
  const urlParams = new URL(req.url).searchParams;
  const requestedTab = props.tab || urlParams.get("tab") || "channels";

  return {
    ...dataUser,
    videoData,
    tab: requestedTab,
  };
}

export default function Section(
  { authorizationUrl, channelData, videoData, accessToken, tab = "channels" }: Props,
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
    videoGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
      gap: "20px",
      margin: "20px 0",
    },
    videoCard: {
      border: "1px solid #ddd",
      borderRadius: "8px",
      overflow: "hidden",
      transition: "transform 0.3s",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    },
    videoThumbnail: {
      width: "100%",
      aspectRatio: "16/9" as any,
      objectFit: "cover" as const,
    },
    videoInfo: {
      padding: "15px",
    },
    videoTitle: {
      margin: "0 0 8px 0",
      fontSize: "16px",
      fontWeight: "bold",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical" as const,
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    videoStats: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: "12px",
      color: "#666",
      marginTop: "8px",
    },
    tabs: {
      display: "flex",
      borderBottom: "2px solid #ddd",
      marginBottom: "20px",
    },
    tab: {
      padding: "10px 15px",
      marginRight: "5px",
      cursor: "pointer",
      borderBottom: "2px solid transparent",
      marginBottom: "-2px",
      textDecoration: "none",
      color: "#333",
    },
    activeTab: {
      borderBottom: "2px solid #FF0000",
      fontWeight: "bold" as const,
    },
  };
  
  // Função para formatar números (ex: 1500 -> 1.5K)
  const formatNumber = (num: string | number) => {
    const n = typeof num === 'string' ? parseInt(num, 10) : num;
    if (n >= 1000000) {
      return `${(n / 1000000).toFixed(1)}M`;
    } else if (n >= 1000) {
      return `${(n / 1000).toFixed(1)}K`;
    }
    return n.toString();
  };
  
  // Função para formatar data (ex: "10 dias atrás")
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Hoje";
    } else if (diffDays === 1) {
      return "Ontem";
    } else if (diffDays < 30) {
      return `${diffDays} dias atrás`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'mês' : 'meses'} atrás`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} ${years === 1 ? 'ano' : 'anos'} atrás`;
    }
  };

  // Determinar qual aba está ativa
  const activeTab = tab;

  return (
    <div style={styles.container}>
      {!accessToken
        ? (
          <div style={styles.loginContainer}>
            <h2 style={styles.heading}>Acesse seus canais do YouTube</h2>
            <p>
              Faça login com sua conta do Google para visualizar seus canais e vídeos do
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
              <p>
                <strong>Vídeos:</strong>{" "}
                {videoData?.items?.length || "Nenhum"}
              </p>
              <p>
                <strong>Aba Ativa:</strong> {activeTab}
              </p>
            </div>

            {/* Abas para navegação usando links com parâmetros de URL */}
            <div style={styles.tabs}>
              <a 
                href="?tab=channels"
                style={{
                  ...styles.tab,
                  ...(activeTab === "channels" ? styles.activeTab : {}),
                }}
              >
                Canais
              </a>
              <a 
                href="?tab=videos"
                style={{
                  ...styles.tab,
                  ...(activeTab === "videos" ? styles.activeTab : {}),
                }}
              >
                Vídeos
              </a>
            </div>

            {/* Seção de Canais */}
            {activeTab === "channels" && Array.isArray(channelData) && channelData.length > 0 ? (
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
            ) : activeTab === "channels" && (
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

            {/* Seção de Vídeos */}
            {activeTab === "videos" && videoData?.items?.length > 0 ? (
              <div>
                <h3 style={styles.heading}>Seus Vídeos</h3>
                <div style={styles.videoGrid}>
                  {videoData.items.map((video: any) => (
                    <div 
                      key={video.id} 
                      style={styles.videoCard}
                      onMouseEnter={(e) => {
                        const target = e.currentTarget as HTMLElement;
                        target.style.transform = "translateY(-5px)";
                        target.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        const target = e.currentTarget as HTMLElement;
                        target.style.transform = "translateY(0)";
                        target.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
                      }}
                    >
                      <a
                        href={`https://www.youtube.com/watch?v=${video.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <img
                          src={
                            video.snippet.thumbnails.high?.url ||
                            video.snippet.thumbnails.medium?.url ||
                            video.snippet.thumbnails.default.url
                          }
                          alt={video.snippet.title}
                          style={styles.videoThumbnail}
                        />
                        <div style={styles.videoInfo}>
                          <h4 style={styles.videoTitle}>{video.snippet.title}</h4>
                          <p style={{ fontSize: "14px", color: "#666", margin: "5px 0" }}>
                            {video.snippet.channelTitle}
                          </p>
                          <div style={styles.videoStats}>
                            <span>
                              {video.statistics?.viewCount
                                ? `${formatNumber(video.statistics.viewCount)} visualizações`
                                : ""}
                            </span>
                            <span>
                              {video.snippet.publishedAt
                                ? formatDate(video.snippet.publishedAt)
                                : ""}
                            </span>
                          </div>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeTab === "videos" && (
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#f8f8f8",
                  borderRadius: "8px",
                }}
              >
                <p>
                  Nenhum vídeo encontrado. Isso pode ocorrer pelos seguintes
                  motivos:
                </p>
                <ul>
                  <li>Você não possui vídeos no YouTube</li>
                  <li>Ocorreu um erro ao buscar seus vídeos</li>
                  <li>A autenticação não permite acesso aos seus vídeos</li>
                </ul>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
