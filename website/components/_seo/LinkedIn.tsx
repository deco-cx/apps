import Image from "../../components/Image.tsx";
import { SeoProps } from "./Preview.tsx";
import { Avatar, GlobeIcon } from "./Icons.tsx";

export default function LinkedIn(props: SeoProps) {
  const { image = "", title, canonical } = props;

  return (
    <div class="border rounded-lg border-light-border">
      <div class="p-4 flex flex-col">
        <div class="flex gap-3">
          <div>
            <Avatar size={48} />
          </div>
          <div class="flex flex-col gap-[2px]">
            <span class="text-sm font-bold">Guilherme Rodrigues</span>
            <span class="text-sm leading-[15px] text-[#1e1e1e99]">
              LinkedIn job title
            </span>
            <span class="text-xs leading-[10px] text-[#1e1e1e99] flex items-center">
              4d • <GlobeIcon />
            </span>
          </div>
        </div>
        <p>
          Here is a post you might write with the link of your website:{" "}
          <span class="text-[#057EB5]">{canonical}</span>
        </p>
      </div>
      <Image
        src={image}
        alt={title}
        class="w-full h-[210px] sm:h-[273px] w-[400px] sm:w-[552px] object-cover"
        decoding="async"
        loading="lazy"
        width={200}
        height={200}
      />
      <div class="flex flex-col gap-2 px-4 py-3 bg-linkedin-bg">
        <p class="text-sm text-bold text-secondary leading-[19px]">
          {title}
        </p>
        <p class="text-xs text-common">
          {canonical}
        </p>
      </div>
    </div>
  );
}
