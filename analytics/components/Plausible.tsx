import { Head } from "$fresh/runtime.ts";
import { useRouterContext } from "deco/routes/[...catchall].tsx";
import { exclusionScript } from "../../utils/plausible_scripts.ts";
import { dataURI, scriptAsDataURI } from "../../utils/dataURI.ts";

const sanitizeTagAttribute = (inputString: string): string => {
  const maxLength = 299; // plausible limit
  let sanitizedString: string = inputString.replace(" ", "-").replace(".", "-")
    .replace(
      /[^\w-]/g,
      "",
    ).replace(/^\d+/, "");
  sanitizedString = sanitizedString.slice(0, maxLength);
  return sanitizedString;
};

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

const plausibleScript = exclusionScript;

// This function should be self contained, because it is stringified!
const snippet = () => {
  window.DECO.events.subscribe((event) => {
    if (!event) return;

    const { name, params } = event;

    if (!name || !params) return;

    const values = {} as Record<string, string>;
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
  const routerCtx = useRouterContext();
  const flags: Record<string, string> | undefined = routerCtx?.flags.reduce(
    (acc, flag) => {
      acc[sanitizeTagAttribute(`event-${flag.name}`)] = flag.value.toString();
      return acc;
    },
    {} as Record<string, string>,
  );

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
        {...flags}
        src={dataURI("text/javascript", true, plausibleScript)}
      />
      <script defer src={scriptAsDataURI(snippet)} />
    </Head>
  );
}

export default Component;
