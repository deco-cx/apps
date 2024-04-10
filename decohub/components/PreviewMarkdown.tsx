import { render } from "https://deno.land/x/gfm@0.3.0/mod.ts";
import "https://esm.sh/prismjs@1.27.0/components/prism-diff.js?no-check";
import "https://esm.sh/prismjs@1.27.0/components/prism-jsx.js?no-check";
import "https://esm.sh/prismjs@1.27.0/components/prism-tsx.js?no-check";
import "https://esm.sh/prismjs@1.27.0/components/prism-typescript.js?no-check";

export const PreviewMarkdown = async (path: string) => {
  const content = await fetch(path).then((res) => res.text());

  return () => {
    return (
      <>
        <div
          class="w-full !max-w-full px-4 prose !prose-invert"
          dangerouslySetInnerHTML={{
            __html: render(content, {
              allowIframes: true,
              allowMath: true,
              disableHtmlSanitization: true,
            }),
          }}
        />
      </>
    );
  };
};
