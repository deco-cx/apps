import { Head } from "$fresh/runtime.ts";
import { scriptAsDataURI } from "../../utils/dataURI.ts";

export interface Props {
  /**
   * @description paths to be excluded.
   */
  exclude?: string;
}

declare global {
  interface Window {
    plausible: (
      name: string,
      params: { props: Record<string, string | boolean> },
    ) => void;
  }
}

// This function should be self contained, because it is stringified!
const snippet = () => {
  // Flags and additional dimentions
  const props: Record<string, string> = {};

  // setup plausible script and unsubscribe
  window.DECO.events.subscribe((event) => {
    if (!event || event.name !== "deco-flags") return;

    if (Array.isArray(event.params)) {
      for (const flag of event.params) {
        props[flag.name] = flag.value.toString();
      }
    }

    window.plausible("pageview", { props });
  })();

  window.DECO.events.subscribe((event) => {
    if (!event) return;

    const { name, params } = event;

    if (!name || !params || name === "deco-flags") return;

    const values = { ...props };
    for (const key in params) {
      // @ts-expect-error somehow typescript bugs
      const value = params[key];

      if (value !== null && value !== undefined) {
        values[key] = (typeof value !== "object")
          ? value
          : JSON.stringify(value).slice(0, 990); // 2000 bytes limit
      }
    }

    window.plausible(name, { props: values });
  });
};

function Component({ exclude }: Props) {
  return (
    <Head>
      <link rel="dns-prefetch" href="https://plausible.io/api/event" />
      <link
        rel="preconnect"
        href="https://plausible.io/api/event"
        crossOrigin="anonymous"
      />
      <script
        defer
        data-exclude={`${"/proxy" + (exclude ? "," + exclude : "")}`}
        data-api="https://plausible.io/api/event"
        src="https://plausible.io/js/script.manual.js"
      />
      <script defer src={scriptAsDataURI(snippet)} />
    </Head>
  );
}

export default Component;
