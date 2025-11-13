interface DenoGfm {
  render: (
    content: string,
    options: {
      allowIframes: boolean;
      allowMath: boolean;
      disableHtmlSanitization: boolean;
    },
  ) => string;
}

let denoGfm: Promise<DenoGfm> | null = null;

const importDenoGfm = async (): Promise<DenoGfm> => {
  const gfmVersion = `0.9.0`;
  try {
    const gfm = await import(`jsr:@deno/gfm@${gfmVersion}`);
    return gfm;
  } catch (err) {
    console.error(`Could not load @deno/gfm@${gfmVersion}`, err);
    return {
      render: (content: string) => content,
    };
  }
};

/**
 * Processes markdown content with support for iframes (like YouTube embeds)
 * @param content - The markdown/HTML content to process
 * @returns Processed HTML string
 */
export const processMarkdown = async (content: string): Promise<string> => {
  denoGfm ??= importDenoGfm();
  const { render } = await denoGfm;

  return render(content, {
    allowIframes: true,
    allowMath: true,
    disableHtmlSanitization: true,
  });
};

