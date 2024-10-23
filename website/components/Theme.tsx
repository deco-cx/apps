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
  colorScheme?: "light" | "dark";
}

const withPrefersColorScheme = (scheme: "light" | "dark", css: string) =>
  `@media (prefers-color-scheme: ${scheme}) { ${css} }`;

function Theme({ fonts = [], variables = [], colorScheme }: Props) {
  const id = useId();

  const family = fonts.reduce(
    (acc, { family }) => acc ? `${acc}, ${family}` : family,
    "",
  );

  const vars = [
    { name: "--font-family", value: family },
    ...variables,
  ]
    .map(({ name, value }) => `${name}: ${value}`)
    .join(";");

  const css = `* {${vars}}`;
  const html = colorScheme ? withPrefersColorScheme(colorScheme, css) : css;

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
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </Head>
  );
}

export default Theme;
