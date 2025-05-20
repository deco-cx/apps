export interface McpContext<Props> {
  configure: (props: Props) => Promise<void>;
  getConfiguration: () => Promise<Props> | Props;
}
