import { CSS, KATEX_CSS, render } from "@deno/gfm";
import "npm:prismjs@1.27.0";

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
