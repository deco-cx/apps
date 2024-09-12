import "https://esm.sh/prismjs@1.27.0/components/prism-diff.js?no-check";
import "https://esm.sh/prismjs@1.27.0/components/prism-jsx.js?no-check";
import "https://esm.sh/prismjs@1.27.0/components/prism-tsx.js?no-check";
import "https://esm.sh/prismjs@1.27.0/components/prism-typescript.js?no-check";
import { CSS, KATEX_CSS, render } from "jsr:@deno/gfm@0.9.0";

export const Markdown = async (path: string) => {
  const content = await fetch(path)
    .then((res) => res.text())
    .catch(() => `Could not fetch README.md for ${path}`);

  return () => {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <style dangerouslySetInnerHTML={{ __html: KATEX_CSS }} />
        <div
          class="markdown-body"
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
