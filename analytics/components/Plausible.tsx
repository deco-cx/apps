import { Head } from "$fresh/runtime.ts";
import { useRouterContext } from "deco/routes/[...catchall].tsx";
import { exclusionScript } from "../../utils/plausible_scripts.ts";

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
const sendEvent = (
  _action: string,
  _type: string,
  event: { name?: string; params?: Record<string, string> },
) => {
  const origEvent = event && event.name;
  const ecommerce = event && event.params;

  if (origEvent && ecommerce) {
    const values = {} as Record<string, string>;
    for (const key in ecommerce) {
      if (ecommerce[key] !== null && ecommerce[key] !== undefined) {
        values[key] = (typeof ecommerce[key] !== "object")
          ? ecommerce[key]
          : JSON.stringify(ecommerce[key]).slice(0, 990); // 2000 bytes limit
      }
    }
    window.plausible(origEvent, {
      props: values,
    });
  }
};

function Component({
  exclude,
}: Props) {
  const routerCtx = useRouterContext();
  const flags: Record<string, string> | undefined = routerCtx?.flags.reduce(
    (acc, flag) => {
      acc[sanitizeTagAttribute(`event-${flag.name}`)] = flag.value.toString();
      return acc;
    },
    {} as Record<string, string>,
  );

  return (
    <>
      <Head>
        <link rel="dns-prefetch" href="https://plausible.io/api/event" />
        <link
          rel="preconnect"
          href="https://plausible.io/api/event"
          crossOrigin="anonymous"
        />
        <script
          data-exclude={`${"/proxy" + (exclude ? "," + exclude : "")}`}
          data-api="https://plausible.io/api/event"
          {...flags}
          dangerouslySetInnerHTML={{
            __html: plausibleScript,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.DECO_ANALYTICS = (window.DECO_ANALYTICS || {});
            window.DECO_ANALYTICS.plausible = window.DECO_ANALYTICS.plausible || (${sendEvent.toString()});`,
          }}
        />
      </Head>
    </>
  );
}

export default Component;
