import { ComponentChildren } from "preact";
import Image from "../../components/Image.tsx";
import { VerifiedIcon } from "./Icons.tsx";
import { Avatar } from "./Icons.tsx";
import { SeoProps } from "./Preview.tsx";
import { PreviewItem } from "./Preview.tsx";
import { textShortner } from "./helpers/textShortner.tsx";

function CardWrapper(props: SeoProps & { children: ComponentChildren }) {
  const { children, canonical } = props;
  return (
    <div class="rounded-md border border-light-border bg-white p-4">
      <div class="flex gap-3">
        <div>
          <Avatar />
        </div>

        <div class="flex flex-col gap-3">
          <div>
            <div class="flex flex-col">
              <span class="flex gap-2 items-center">
                <span class="text-sm font-bold">Guilherme Rodrigues</span>
                <VerifiedIcon />
                <span class="text-[#1e1e1e99]">@guilherme · 4h</span>
              </span>

              <p>
                Here is a post you might write with the link of your website:
                {" "}
                <span class="text-[#057EB5]">{canonical}</span>
              </p>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

function TwitterArticle(props: SeoProps) {
  const { image = "", title, description = "", canonical = "" } = props;
  const descriptionMaxLength = 150;

  return (
    <div class="border overflow-hidden rounded-[16px] border-light-border">
      <Image
        src={image}
        alt={title}
        class="w-full h-[210px] sm:h-[273px] w-[400px] sm:w-[552px] object-cover"
        decoding="async"
        loading="lazy"
        width={200}
        height={200}
      />
      <div class="text-[15px] flex flex-col justify-center gap-[2px] px-4 py-3 bg-white  ">
        <p class="font-normal text-common leading-[19px]">
          {canonical}
        </p>
        <p class="text-secondary leading-[19px] overflow-ellipsis 
        overflow-hidden max-w-full  whitespace-nowrap">
          {title}
        </p>
        <p class="text-common leading-[20px] ">
          {textShortner(description, descriptionMaxLength)}
        </p>
      </div>
    </div>
  );
}

function _TwitterWebsite(props: SeoProps) {
  const {
    image = "",
    title,
    description = "",
    canonical = "https://www.yoursite.com",
  } = props;
  const descriptionMaxLength = 100;
  return (
    <div class="flex border overflow-hidden rounded-[16px] border-light-border">
      <Image
        src={image}
        alt={title}
        class="object-cover min-w-[150px]"
        decoding="async"
        loading="lazy"
        width={150}
        height={150}
      />
      <div class="text-[15px] flex flex-col justify-center gap-[2px] px-4 py-3 bg-white  ">
        <p class="font-normal text-common leading-[19px]">
          {canonical}
        </p>
        <p class="font-thin text-secondary leading-[19px] overflow-ellipsis 
        overflow-hidden max-w-[300px]  whitespace-nowrap">
          {title}
        </p>
        <p class="text-common leading-[20px] max-w-[300px] break-words">
          {textShortner(description, descriptionMaxLength)}
        </p>
      </div>
    </div>
  );
}

function Twitter(props: PreviewItem) {
  return (
    <CardWrapper {...props}>
      <TwitterArticle {...props} />
    </CardWrapper>
  );
}

export default Twitter;
