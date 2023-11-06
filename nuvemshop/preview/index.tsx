import { state } from "../../nuvemshop/mod.ts";

export default function Preview() {
  const publicUrl = state?.publicUrl;

  return (
    <div class="flex flex-col items-center justify-center">
      <a href="https://www.nuvemshop.com.br/">
        <img
          alt="Nuvemshop"
          src="https://github.com/deco-cx/apps/assets/76620866/6b747615-2889-40a9-8349-46814f90dd50"
          width="120"
          height="90"
        />
      </a>
      <div class="w-full flex justify-between min-h-[800px] p-4 gap-4">
        <div
          class="w-full flex flex-col items-center gap-2"
          style={{
            background: "#272D4B",
            color: "white",
            borderRadius: "16px",
            padding: "16px",
          }}
        >
          <div class="flex flex-col gap-4">
            <label>
              <strong class="mb-2">Public url</strong>
              <p>
                Your Nuvemshop url, example:
                https://yourstore.lojavirtualnuvem.com.br/
              </p>
            </label>
            <label>
              <strong class="mb-2">Store id + Access Token</strong>
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
        <div class="w-full flex flex-col items-center gap-2">
          <h2>Your public store</h2>
          <iframe src={publicUrl} class="h-[600px]"></iframe>
        </div>
      </div>
    </div>
  );
}
