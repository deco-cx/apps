interface DenoGfm {
  render: (
    content: string,
    options: {
      allowIframes: boolean;
      allowMath: boolean;
      disableHtmlSanitization: boolean;
    },
  ) => string;
  KATEX_CSS: string;
  CSS: string;
}

let denoGfm: Promise<DenoGfm> | null = null;
const importDenoGfm = async (): Promise<DenoGfm> => {
  const gfmVersion = `0.9.0`;
  try {
    const gfm = await import(`jsr:@deno/gfm@${gfmVersion}`);
    return gfm;
  } catch (err) {
    return {
      render: () => `could not dynamic load @deno/gfm@${gfmVersion} ${err}`,
      KATEX_CSS: "",
      CSS: "",
    };
  }
};
export const Markdown = async (path: string) => {
  denoGfm ??= importDenoGfm();
  const { CSS, KATEX_CSS, render } = await denoGfm;
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
