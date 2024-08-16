import { useScriptAsDataURI } from "deco/hooks/useScript.ts";
import HTMXSection from "../htmx/sections/htmx.tsx";

export function PreviewContainer({ children }: { children: any }) {
  return (
    <div class="w-full h-full">
      <script
        src={useScriptAsDataURI(() => {
          const change = (newFormState: any) => {
            top?.postMessage(
              {
                type: "editor::click",
                action: "change-prop",
                formState: newFormState,
              },
              "*",
            );
          };
          const setProp = (pathProp: string[], value: any) => {
            top?.postMessage(
              {
                type: "editor::click",
                action: "set-prop",
                pathProp,
                value,
              },
              "*",
            );
          };
          globalThis.window.DECO_FORM = {
            change,
            setProp,
          };
        })}
      />
      <HTMXSection
        version="1.9.11"
        cdn="https://cdn.jsdelivr.net/npm"
        extensions={[]}
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
                    html {
                    height: 100%;
                    font-family: sans-serif;
                    }
                    body {
                    height: 100%;
                    }
                `,
        }}
      >
      </style>
      {children}
      <script src="https://unpkg.com/windicss-runtime-dom"></script>
    </div>
  );
}
