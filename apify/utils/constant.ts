// Apify API constants
export const APIFY_API_BASE_URL = "https://api.apify.com";

export const APIFY_ERROR_MESSAGES = {
  "PERMISSION_DENIED":
    "Acesso negado ao Apify. Verifique suas permissões e token de API.",
  "NOT_FOUND": "Recurso não encontrado. Verifique o ID fornecido.",
  "INVALID_ARGUMENT":
    "Argumento inválido na requisição. Verifique os parâmetros.",
  "FAILED_PRECONDITION": "Operação não permitida no estado atual.",
  "RESOURCE_EXHAUSTED":
    "Limite de requisições da API do Apify excedido. Tente novamente mais tarde.",
  "UNAUTHENTICATED":
    "Falha na autenticação da API do Apify. Verifique seu token de API.",
  "QUOTA_EXCEEDED":
    "Cota da API do Apify excedida. Tente novamente mais tarde.",
  "ALREADY_EXISTS": "O recurso já existe.",
  "DEADLINE_EXCEEDED": "A operação expirou. Tente novamente.",
  "UNAVAILABLE":
    "Serviço do Apify temporariamente indisponível. Tente novamente mais tarde.",
  "INVALID_VALUE": "Um ou mais valores na sua requisição são inválidos.",
  "ACTOR_NOT_FOUND": "Actor não encontrado ou inacessível.",
  "RUN_NOT_FOUND": "Execução não encontrada.",
  "INVALID_TOKEN": "Token de API inválido ou expirado.",
  "INSUFFICIENT_CREDIT": "Créditos insuficientes para executar esta operação.",
} as const;
