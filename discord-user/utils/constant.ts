export const SCOPES = [
  "identify",
  "email",
  "connections",
  "guilds",
  "guilds.join",
  "guilds.members.read",
  "role_connections.write",
  "webhook.incoming",
];

export const API_URL = "https://discord.com/api/v10";
export const OAUTH_URL = "https://discord.com/api/v10/oauth2/token";
export const OAUTH_URL_AUTH = "https://discord.com/oauth2/authorize";

export const DISCORD_ERROR_MESSAGES = {
  "UNAUTHORIZED":
    "Token inválido ou expirado. Verifique suas credenciais do Discord.",
  "FORBIDDEN":
    "Acesso negado. O bot não tem permissões necessárias para esta operação.",
  "NOT_FOUND":
    "Recurso não encontrado. Verifique o ID do canal, servidor ou mensagem.",
  "BAD_REQUEST": "Requisição inválida. Verifique os parâmetros enviados.",
  "RATE_LIMITED": "Limite de requisições excedido. Tente novamente mais tarde.",
  "INTERNAL_SERVER_ERROR":
    "Erro interno do Discord. Tente novamente mais tarde.",
  "SERVICE_UNAVAILABLE": "Serviço do Discord temporariamente indisponível.",
  "GATEWAY_TIMEOUT": "Timeout na requisição. Tente novamente.",
  "INVALID_BOT_TOKEN": "Token do bot inválido ou malformado.",
  "MISSING_PERMISSIONS":
    "O bot não possui as permissões necessárias no servidor.",
  "CHANNEL_NOT_FOUND": "Canal não encontrado ou não acessível.",
  "GUILD_NOT_FOUND": "Servidor não encontrado ou bot não está no servidor.",
  "MESSAGE_NOT_FOUND": "Mensagem não encontrada ou já foi deletada.",
  "USER_NOT_FOUND": "Usuário não encontrado ou não acessível.",
  "INVALID_MESSAGE_FORMAT": "Formato de mensagem inválido.",
  "MESSAGE_TOO_LONG": "Mensagem excede o limite de 2000 caracteres do Discord.",
} as const;
