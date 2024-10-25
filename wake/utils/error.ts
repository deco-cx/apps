export interface WakeGraphqlError {
  message: string;
  path: string[];
  extensions?: {
    code: string;
  };
}
