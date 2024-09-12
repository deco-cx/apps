import { CSS, KATEX_CSS, render } from "jsr:@deno/gfm@0.9.0";
import "npm:prismjs@1.29.0/components/prism-diff.js";
import "npm:prismjs@1.29.0/components/prism-jsx.js";
import "npm:prismjs@1.29.0/components/prism-tsx.js";
import "npm:prismjs@1.29.0/components/prism-typescript.js";

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
