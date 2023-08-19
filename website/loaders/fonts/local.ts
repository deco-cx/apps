export type Font = {
  family: string;
  styleSheet: string;
};

const loader = (): Promise<Font> => {
  throw new Error("Not implemented");
};

export default loader;
