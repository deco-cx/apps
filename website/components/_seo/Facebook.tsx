import Image from "../../components/Image.tsx";
import { Avatar, GlobeIcon, VerifiedIcon } from "./Icons.tsx";
import { PreviewItem, SeoProps } from "./Preview.tsx";
import { textShortner } from "./helpers/textShortner.tsx";

function FacebookBigOpenGraph(props: PreviewItem & SeoProps) {
  const {
    image,
    title,
    description,
    width,
    height,
    canonical = "https://www.example.com",
  } = props;
  const titleMaxLength = 120;
  const url = new URL(canonical);

  return (
    <div class="flex flex-col rounded-md border border-light-border bg-white">
      <div class="p-4 flex flex-col gap-4">
        <div class="flex gap-3">
          <div>
            <Avatar />
          </div>
          <div class="flex flex-col">
            <span class="flex gap-2 items-center">
              <span class="text-sm font-bold">Guilherme Rodrigues</span>
              <VerifiedIcon />
            </span>
            <span class="flex gap-1 items-center">
              <span class="text-xs text-[#1e1e1e99]">30m •</span>
              <GlobeIcon />
            </span>
          </div>
        </div>

        <p>
          Here is a post you might write with the link of your website:{" "}
          <span class="text-[#057EB5]">{canonical}</span>
        </p>
      </div>

      <div class="">
        <Image
          src={image}
          alt={title}
          class="w-full h-[210px] sm:h-[273px] w-[400px] sm:w-[552px] object-cover"
          decoding="async"
          loading="lazy"
          width={width}
          height={height}
        />
        <div class="px-4 py-3 flex flex-col gap-[3px] bg-facebook-bg ">
          <p class="text-xs uppercase font-normal text-common leading-[15px]">
            {url.hostname}
          </p>

          <p class="text-base font-bold text-secondary leading-[19px]  ">
            {textShortner(title, titleMaxLength)}
          </p>
          <p class="text-sm text-common leading-[19px] overflow-ellipsis 
        overflow-hidden max-w-full  whitespace-nowrap
        ">
            {title.length < 100 && description}
          </p>
        </div>
      </div>
      <div />
    </div>
  );
}

function _FacebookMediumOpenGraph(props: PreviewItem) {
  const { image, title, description, path, width, height } = props;
  const titleMaxLength = 90;
  const descriptionMaxLength = 110;

  return (
    <div class="flex w-full">
      <Image
        src={image}
        alt={title}
        class=" object-cover max-h-[215px] max-w-[139px]"
        decoding="async"
        loading="lazy"
        width={width}
        height={height}
      />
      <div class="px-4 justify-center flex flex-col gap-[3px] bg-facebook-bg ">
        <p class="text-xs uppercase font-normal text-common leading-[15px]">
          {path}
        </p>
        <p class="text-base  font-thin  text-secondary leading-[19px]">
          {textShortner(title, titleMaxLength)}
        </p>
        <p class="text-sm text-common leading-[19px] max-w-[360px] break-words ">
          {textShortner(description, descriptionMaxLength)}
        </p>
      </div>
    </div>
  );
}

function _FacebookSmallOpenGraph(props: PreviewItem) {
  const { image, title, description, path } = props;
  const titleMaxLength = 90;
  const descriptionMaxLength = 110;

  return (
    <div class="flex w-full max-w-[522px]">
      <Image
        src={image}
        alt={title}
        class=" object-scale-down"
        decoding="async"
        loading="lazy"
        width={106}
        height={106}
      />
      <div class="px-4 justify-center flex flex-col gap-[3px] bg-facebook-bg max-w-[522px]">
        <p class="text-xs uppercase font-normal text-common leading-[15px]">
          {path}
        </p>
        <p class="text-base  font-thin text-secondary leading-[19px]">
          {textShortner(title, titleMaxLength)}
        </p>
        <p class=" text-sm text-common leading-[19px] max-w-[380px] break-words
        ">
          {textShortner(description, descriptionMaxLength)}
        </p>
      </div>
    </div>
  );
}

function Facebook(props: PreviewItem & SeoProps) {
  return <FacebookBigOpenGraph {...props} />;
}

export default Facebook;
