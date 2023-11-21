import { state } from "../../nuvemshop/mod.ts";

export default function Preview() {
  const publicUrl = state?.publicUrl;

  return (
    <div class="flex flex-col items-center justify-center h-full">
      <a href="https://www.nuvemshop.com.br/" style={{ marginTop: "16px" }}>
        <img
          alt="Nuvemshop"
          src="https://github.com/deco-cx/apps/assets/76620866/6b747615-2889-40a9-8349-46814f90dd50"
          width="120"
          height="90"
        />
      </a>
      <div class="w-full flex flex-wrap justify-center p-4 gap-4">
        <div
          class="w-full flex flex-col items-center gap-2"
          style={{
            background: "#272D4B",
            color: "white",
            borderRadius: "16px",
            padding: "24px",
            maxWidth: "450px",
          }}
        >
          <h1>Nuvemshop Settings</h1>
          <div class="w-full flex flex-col gap-4">
            <label class="flex flex-col">
              <strong>Public URL</strong>
              <p>
                {publicUrl ||
                  "Your Nuvemshop URL, example: https://yourstore.lojavirtualnuvem.com.br/"}
              </p>
            </label>
            <label class="flex flex-col gap-2">
              <strong>Store Id + Access Token</strong>
              {publicUrl
                ? (
                  <a
                    href={`${publicUrl}/admin/apps/6173/authorize`}
                    class="block border-2 p-1 rounded-sm"
                    style={{
                      background: "white",
                      color: "#272D4B",
                      width: "fit-content",
                      borderRadius: "4px",
                    }}
                    target="_blank"
                  >
                    Get your id and token
                  </a>
                )
                : <p>Fill your publicUrl first</p>}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
