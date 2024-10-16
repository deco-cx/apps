interface ResolvedCustomId<T extends string = string> {
  id: string;
  props: Record<T, string>;
}

export default function parseCustomId<T extends string>(
  customId: string,
): ResolvedCustomId<T> {
  const [id, ...props] = customId.split(";");

  return {
    id,
    props: props.reduce((acc, prop) => {
      const [key, value] = prop.split("=");
      return {
        ...acc,
        [key]: value,
      };
    }, {} as ResolvedCustomId<T>["props"]),
  };
}
