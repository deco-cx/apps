import { SeoProps } from "./Preview.tsx";
import { textShortner } from "./helpers/textShortner.tsx";

const MAX_DESCRIPTION_LENGTH = 130;

function Google(
  {
    title,
    description,
    image,
    canonical = "https://www.example.com",
    favicon,
  }: SeoProps,
) {
  const url = new URL(canonical);
  return (
    <div class="flex justify-between bg-white border border-light-border rounded-lg p-6">
      <div class="flex flex-col gap-1">
        <div class="flex gap-3">
          <div class="p-2 shrink-0 border-transparent border">
            <img
              src={favicon}
              width={18}
              height={18}
              class="border-0 border-transparent"
            />
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-normal leading-[18px]">
              {url.hostname.replace(/^www./, "")}
            </span>
            <span class="text-xs font-normal leading-[18px]">
              {url.protocol}//{url.hostname}{" "}
              <span class="text-common ml-2 font-semibold">&#8942;</span>
            </span>
          </div>
        </div>

        <p class="text-xl font-thin text-third leading-5  overflow-ellipsis overflow-hidden max-w-sm whitespace-nowrap break-words">
          {title}
        </p>
        <p class="text-xs font-normal text-common leading-5 max-w-sm break-words">
          {description && textShortner(description, MAX_DESCRIPTION_LENGTH)}
        </p>
      </div>

      <div>
        <img
          src={image}
          width={92}
          height={92}
          class="object-contain rounded-lg"
        />
      </div>
    </div>
  );
}

export default Google;
