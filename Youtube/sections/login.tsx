import type { AppContext } from "../mod.ts";

interface Props {
  authorizationUrl: string;
}

export async function loader(_props: Record<string, never>, req: Request, ctx: AppContext) {
  // Obtém apenas a URL de autorização
  const authData = await ctx.invoke.Youtube.loaders.authentication();
  
  return {
    authorizationUrl: authData.authorizationUrl,
  };
}

export default function LoginSection({ authorizationUrl }: Props) {
  // Estilos CSS inline
  const styles = {
    container: {
      maxWidth: "500px",
      margin: "0 auto",
      padding: "30px",
      fontFamily: "Arial, sans-serif",
      textAlign: "center" as const,
      borderRadius: "8px",
      backgroundColor: "#f9f9f9",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    },
    heading: {
      color: "#333",
      marginBottom: "20px",
    },
    description: {
      color: "#555",
      marginBottom: "25px",
      lineHeight: "1.5",
    },
    loginButton: {
      display: "inline-block",
      backgroundColor: "#FF0000",
      color: "white",
      padding: "14px 28px",
      borderRadius: "4px",
      textDecoration: "none",
      fontWeight: "bold",
      fontSize: "16px",
      transition: "all 0.3s ease",
      cursor: "pointer",
      border: "none",
    },
    errorMessage: {
      color: "#d32f2f",
      marginTop: "20px",
      padding: "10px",
      backgroundColor: "#ffebee",
      borderRadius: "4px",
    },
    youtube: {
      marginBottom: "20px",
    },
    icon: {
      width: "80px",
      height: "auto",
      marginBottom: "15px",
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.youtube}>
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2560px-YouTube_full-color_icon_%282017%29.svg.png" 
          alt="YouTube Logo" 
          style={styles.icon} 
        />
      </div>
      <h2 style={styles.heading}>Acesse sua conta do YouTube</h2>
      <p style={styles.description}>
        Faça login com sua conta do Google para gerenciar seus vídeos, 
        comentários e canal do YouTube.
      </p>
      
      {authorizationUrl ? (
        <a 
          href={authorizationUrl} 
          style={styles.loginButton}
          onMouseOver={(e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.backgroundColor = "#cc0000";
            target.style.transform = "translateY(-2px)";
            target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
          }}
          onMouseOut={(e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.backgroundColor = "#FF0000";
            target.style.transform = "translateY(0)";
            target.style.boxShadow = "none";
          }}
        >
          Login com Google
        </a>
      ) : (
        <div style={styles.errorMessage}>
          Erro: URL de autorização não disponível. Por favor, recarregue a página.
        </div>
      )}
    </div>
  );
} 