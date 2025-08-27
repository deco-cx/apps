// Define as tipagens para as entidades da API do Google Drive.
// Um arquivo do Google Site no Drive.
export interface DriveFile {
  kind: "drive#file";
  id: string;
  name: string;
  mimeType: string;
}

// Cliente de autenticação OAuth
export interface AuthClient {
  "POST /token": {
    searchParams: {
      grant_type: string;
      code?: string;
      refresh_token?: string;
      client_id: string;
      client_secret: string;
      redirect_uri?: string;
    };
    response: {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
      token_type?: string;
      scope?: string;
    };
  };
}

// A interface do cliente para a API do Google Drive.
export interface GoogleDriveClient {
  /**
   * Obtém os metadados de um arquivo (nosso Google Site) pelo seu ID.
   * Usaremos para verificar a existência e o nome do site.
   * @see https://developers.google.com/drive/api/reference/v3/files/get
   */
  "GET /drive/v3/files/:fileId": {
    response: DriveFile;
    searchParams: {
      fields?: string; // Ex: "id,name,mimeType"
    };
  };

  /**
   * Exporta o conteúdo de um arquivo do Google Drive.
   * Usaremos para obter o HTML completo de um Google Site.
   * @see https://developers.google.com/drive/api/reference/v3/files/export
   */
  "GET /drive/v3/files/:fileId/export": {
    // A resposta é o conteúdo bruto (HTML), então usamos Response diretamente.
    response: Response;
    searchParams: {
      mimeType: "text/html";
    };
  };
}
