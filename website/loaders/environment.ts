/**
 * @title Environment
 * @hideOption true
 */
export interface Environment {
  /**
   * @ignore
   */
  get: () => string | null;
}
export interface Props {
  /**
   * @title Environment Value
   */
  value: string;
  /**
   * @title Environment Name
   * @description Used in dev mode as a environment variable (should not contain spaces or special characters)
   * @pattern ^[a-zA-Z_][a-zA-Z0-9_]*$
   */
  name?: string;
}
const cache: Record<string, string | null> = {};

const getEnvironment = (props: Props): string | null => {
  const name = props?.name;
  if (name && Deno.env.has(name)) {
    return Deno.env.get(name)!;
  }
  const value = props?.value;
  if (!value) {
    return null;
  }

  return cache[value] ??= value;
};
/**
 * @title Environment
 */
export default async function Environment(props: Props): Promise<Environment> {
  const environmentValue = await getEnvironment(props);

  console.log("environmentValue", environmentValue);
  return {
    get: (): string | null => {
      return environmentValue;
    },
  };
}
