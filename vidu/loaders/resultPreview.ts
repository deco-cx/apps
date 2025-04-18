import { AppContext } from "../mod.ts";

export interface Props {
  generationId: string;
  presignedUrl?: string;
}

export const PREVIEW_URL =
  "https://mcp.deco.site/live/invoke/vidu/loaders/resultPreview.ts?appName=Vidu";

const RESULT_URL =
  "https://mcp.deco.site/live/invoke/vidu/loaders/getGenerationResult.ts?appName=Vidu";

/**
 * @title Preview Loader
 * @description Generates HTML and JS for polling and displaying video generation status.
 */
export default function PreviewLoader(
  props: Props,
  req: Request,
  _ctx: AppContext,
): Response {
  const {
    generationId,
    presignedUrl,
  } = props;

  const url = new URL(req.url);
  const installId = url.searchParams.get("installId");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <style>
        body, html { 
            margin: 0; padding: 0; height: 100%; width: 100%; 
            display: flex; justify-content: center; align-items: center; 
            font-family: sans-serif; background-color: #000; color: #eee; 
        }
        #video-container { 
            display: none; position: absolute; top: 0; left: 0;
            width: 100%; height: 100%; background-color: #000; z-index: 10; 
        }
        video { 
            display: block; width: 100%; height: 100%; object-fit: cover; 
        }
        .container { text-align: center; }
        #status { 
            font-size: 1.2em; display: flex;
            flex-direction: column; align-items: center; gap: 20px;
        }
        .spinner {
            width: 50px; height: 50px;
            border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%; border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        #error { color: red; font-size: 1.2em; }
        #data-container { font-size: 0.8em; word-break: break-all; max-width: 80%; margin: auto; }
    </style>
</head>
<body>
    <div id="container" class="container">
        <div id="status"><div class="spinner"></div></div>
        <div id="error" style="display: none;"></div>
        <div id="video-container" style="display: none;"></div>
        <div id="data-container" style="display: none;"></div>
    </div>

    <script>
        const generationId = ${JSON.stringify(generationId)};
        const targetUrl = ${
    JSON.stringify(RESULT_URL + "&installId=" + installId)
  };
        const presignedUrl = ${JSON.stringify(presignedUrl)};
        const elements = {
            container: document.getElementById('container'),
            status: document.getElementById('status'),
            error: document.getElementById('error'),
            video: document.getElementById('video-container'),
            data: document.getElementById('data-container')
        };
        
        let isLoading = false;

        const fetchData = async () => {
            if (isLoading) return;

            isLoading = true;
            elements.status.style.display = 'flex';
            elements.error.style.display = 'none';
            elements.video.style.display = 'none';
            elements.data.style.display = 'none';

            try {
                const response = await fetch(targetUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ generationId, presignedUrl }),
                    referrerPolicy: "no-referrer"
                });

                if (!response.ok) {
                    throw new Error(\`HTTP error! status: \${response.status}\`);
                }

                const result = await response.json();

                console.log({ result });

                if (result.state === 'in-progress') {
                    setTimeout(fetchData, 2000);
                } else {
                    elements.status.style.display = 'none';
                    if (result.resultUrl) {
                        elements.video.style.display = 'block';
                        elements.video.innerHTML = \`<video src="\${result.resultUrl}" autoplay muted loop controls></video>\`;
                    } else {
                        elements.data.style.display = 'block';
                        elements.data.textContent = 'Data: ' + JSON.stringify(result);
                    }
                }
            } catch (e) {
                elements.status.style.display = 'none';
                elements.error.style.display = 'block';
                elements.error.textContent = 'Error: ' + (e instanceof Error ? e.message : String(e));
            } finally {
                isLoading = false;
            }
        };

        if (!generationId) {
             elements.status.style.display = 'none';
             elements.error.style.display = 'block';
             elements.error.textContent = 'Error: Missing ID.';
        } else {
            fetchData();
        }
    </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
    status: 200,
  });
}
