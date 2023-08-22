import { Head } from "$fresh/runtime.ts";
import { useId } from "preact/hooks";

export interface Variable {
  name: string;
  value: string;
}

export type Font = {
  family: string;
  styleSheet: string;
};

export interface Props {
  variables?: Variable[];
  fonts?: Font[];
}

function Theme({ fonts = [], variables = [] }: Props) {
  const id = useId();

  const family = fonts.reduce(
    (acc, { family }) => acc ? `${acc}, ${family}` : family,
    "",
  );

  const css = [
    { name: "--font-family", value: family },
    ...variables,
  ]
    .map(({ name, value }) => `${name}: ${value}`)
    .join(";");

  return (
    <Head>
      {fonts.map(({ styleSheet }) => (
        <style
          type="text/css"
          dangerouslySetInnerHTML={{ __html: styleSheet }}
        />
      ))}
      <style
        type="text/css"
        id={`__DESIGN_SYSTEM_VARS-${id}`}
        dangerouslySetInnerHTML={{
          __html: `* {${css}}`,
        }}
      />
    </Head>
  );
}

export default Theme;
