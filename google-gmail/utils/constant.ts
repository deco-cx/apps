import { GOOGLE_USER_INFO_SCOPES } from "../../mcp/utils/google/userInfo.ts";

export const SCOPES = [
  ...GOOGLE_USER_INFO_SCOPES,
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
];

export const API_URL = "https://gmail.googleapis.com";
export const OAUTH_URL = "https://oauth2.googleapis.com";
export const OAUTH_URL_AUTH = `https://accounts.google.com/o/oauth2/v2/auth`;

export const GMAIL_ERROR_MESSAGES = {
  "PERMISSION_DENIED":
    "Acesso negado ao Gmail. Por favor, verifique suas permissões.",
  "NOT_FOUND": "Email ou thread não encontrado. Verifique o ID fornecido.",
  "INVALID_ARGUMENT":
    "Argumento inválido na requisição do Gmail. Verifique os parâmetros.",
  "FAILED_PRECONDITION": "Operação não permitida no estado atual do Gmail.",
  "RESOURCE_EXHAUSTED":
    "Limite de requisições da API do Gmail excedido. Tente novamente mais tarde.",
  "UNAUTHENTICATED":
    "Falha na autenticação da API do Gmail. Verifique suas credenciais.",
  "QUOTA_EXCEEDED":
    "Cota da API do Gmail excedida. Tente novamente mais tarde.",
  "ALREADY_EXISTS": "O recurso já existe no Gmail.",
  "DEADLINE_EXCEEDED": "A operação do Gmail expirou. Tente novamente.",
  "UNAVAILABLE":
    "Serviço do Gmail temporariamente indisponível. Tente novamente mais tarde.",
  "INVALID_VALUE":
    "Um ou mais valores na sua requisição são inválidos para o Gmail.",
  "MESSAGE_NOT_FOUND": "Mensagem não encontrada ou já foi excluída.",
  "THREAD_NOT_FOUND": "Thread não encontrada ou inacessível.",
  "LABEL_NOT_FOUND": "Label não encontrada no Gmail.",
  "ATTACHMENT_NOT_FOUND": "Anexo não encontrado na mensagem.",
} as const;
