export interface Props {
  text: string;
  href?: string;
}

export default function Cta({ text, href }: Props) {
  return (
    <div class="my-8 text-center">
      <a
        href={href ?? "#"}
        class="inline-block py-[0.75em] px-[2em] rounded-full bg-accent text-inverted font-semibold text-sm tracking-[0.02em] no-underline transition-opacity hover:opacity-85"
      >
        {text}
      </a>
    </div>
  );
}
