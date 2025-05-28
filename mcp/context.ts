export interface Storage {
  getItem<T = unknown>(key: string): Promise<T | null>;
  setItem<T = unknown>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface McpContext<Props> {
  installId: string;
  appStorage: Storage;
  getConfig: (installId: string) => Promise<Props>;
  configure: (props: Props) => Promise<void>;
  getConfiguration: () => Promise<Props> | Props;
}
