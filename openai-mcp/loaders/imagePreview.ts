export interface Props {
  /**
   * @description URL to the image that will be available once generation is complete
   */
  imageUrl: string;
}

export const PREVIEW_URL =
  "https://mcp.deco.site/live/invoke/openai-mcp/loaders/imagePreview.ts?appName=OpenAI";

/**
 * @title Image Preview Loader
 * @description Generates HTML and JS for polling and displaying image generation status.
 */
export default function ImagePreviewLoader(
  props: Props,
  _req: Request,
): Response {
  const { imageUrl } = props;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image Preview</title>
    <style>
        body, html { 
            margin: 0; padding: 0; height: 100%; width: 100%; 
            display: flex; justify-content: center; align-items: center; 
            font-family: sans-serif; background-color: #000; color: #eee; 
        }
        #image-container { 
            display: none; position: relative;
            width: 100%; height: 100%; background-color: #000; z-index: 10;
            display: flex; justify-content: center; align-items: center;
        }
        img { 
            display: block; max-width: 95%; max-height: 95%; object-fit: contain;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .container { 
            text-align: center; display: flex; flex-direction: column;
            justify-content: center; align-items: center; height: 100%; width: 100%;
            position: relative;
        }
        #status { 
            position: absolute; z-index: 20;
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
        #error { 
            color: red; font-size: 1.4em; text-align: center; 
            max-width: 80%; position: absolute; z-index: 20;
        }
        #retry-button {
            margin-top: 20px;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            background-color: #3498db;
            color: white;
            font-size: 16px;
            cursor: pointer;
        }
        #retry-button:hover {
            background-color: #2980b9;
        }
    </style>
</head>
<body>
    <div class="container">
        <div id="status">
            <div class="spinner"></div>
            <div>Generating image...</div>
        </div>
        <div id="error" style="display: none;"></div>
        <div id="image-container"></div>
    </div>

    <script>
        console.log("Image Preview Loader");
        const targetUrl = ${JSON.stringify(imageUrl)};
        const elements = {
            status: document.getElementById('status'),
            error: document.getElementById('error'),
            image: document.getElementById('image-container')
        };

        
        let isPolling = false;
        let retryCount = 0;
        const maxRetries = 60; // 2 minutes with 2-second intervals
        const pollingInterval = 2000; // 2 seconds

        
        async function checkImage() {
            if (isPolling) return;
            isPolling = true;
            
            try {
                const response = await fetch(targetUrl, {
                    method: 'GET',
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache' }
                });

                console.log({targetUrl, response});

                
                // Check if the response indicates content
                const contentLength = response.headers.get('Content-Length');
                console.log({contentLength});
                const contentType = response.headers.get('Content-Type');

                
                if (response.ok && contentLength && parseInt(contentLength) > 0) {
                    // Check if it's an error message
                    if (contentType && contentType.includes('text/plain')) {
                        const textResponse = await fetch(targetUrl);
                        const errorText = await textResponse.text();
                        showError(errorText);
                    } else if (contentType && contentType.includes('image/')) {
                        showImage(targetUrl);
                    } else {
                        showImage(targetUrl);
                    }
                } else {
                    // Continue polling
                    retryCount++;
                    if (retryCount < maxRetries) {
                        setTimeout(checkImage, pollingInterval);
                    } else {
                        showError("Image generation timed out. The process is taking longer than expected.");
                    }
                }
            } catch (error) {
                retryCount++;
                if (retryCount < maxRetries) {
                    setTimeout(checkImage, pollingInterval);
                } else {
                    showError("Failed to check image status: " + error.message);
                }
            } finally {
                isPolling = false;
            }
        }
        
        function showImage(url) {
            elements.status.style.display = 'none';
            elements.error.style.display = 'none';
            elements.image.style.display = 'flex';
            elements.image.innerHTML = \`<img src="\${url}?t=\${Date.now()}" alt="Generated image" />\`;
        }
        
        function showError(message) {
            elements.status.style.display = 'none';
            elements.image.style.display = 'none';
            elements.error.style.display = 'block';
            elements.error.innerHTML = \`
                <div>Error: \${message}</div>
                <button id="retry-button">Retry</button>
            \`;
            
            document.getElementById('retry-button').addEventListener('click', () => {
                elements.error.style.display = 'none';
                elements.status.style.display = 'flex';
                retryCount = 0;
                checkImage();
            });
        }

        console.log("Starting image check");
        // Start checking
        checkImage();
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
