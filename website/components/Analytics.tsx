import { Head } from "$fresh/runtime.ts";
import { context } from "deco/live.ts";
import { useScriptAsDataURI } from "../../utils/useScript.ts";

interface Hosted {
  trackingId: string;
}

interface OnPremises {
  src: string;
}

type TagManagerProps = Hosted | OnPremises;

const isOnPremises = (props: TagManagerProps): props is OnPremises =>
  // deno-lint-ignore no-explicit-any
  Boolean((props as any).src);

export function GoogleTagManager(props: TagManagerProps) {
  const id = isOnPremises(props) ? props.src : props.trackingId;
  const src = isOnPremises(props)
    ? props.src
    : `https://www.googletagmanager.com/gtm.js?id=${props.trackingId}`;

  return (
    <>
      <Head>
        <script
          id={`gtm-script-${id}`}
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s);j.async=true;j.src=i;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer', '${src}');`,
          }}
        />
      </Head>

      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-KVXHNCM"
          height="0"
          width="0"
          style="display:none;visibility:hidden"
        >
        </iframe>
      </noscript>
    </>
  );
}

export function GTAG({ trackingId }: Hosted) {
  return (
    <Head>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag("js", new Date());
gtag("config", '${trackingId}');`,
        }}
      />
    </Head>
  );
}

/**
 * This function handles all ecommerce analytics events.
 * Add another ecommerce analytics modules here.
 */
const snippet = () => {
  globalThis.window.DECO.events.subscribe((event) => {
    globalThis.window.dataLayer = globalThis.window.dataLayer || [];
    if (
      !event ||
      !globalThis.window.dataLayer ||
      typeof globalThis.window.dataLayer.push !== "function"
    ) {
      return;
    }

    if (event.name === "deco") {
      globalThis.window.dataLayer.push({
        event: event.name,
        deco: event.params,
      });
      return;
    }

    globalThis.window.dataLayer.push({ ecommerce: null });
    globalThis.window.dataLayer.push({
      event: event.name,
      ecommerce: event.params,
    });
  });
};

export interface Props {
  /**
   * @description google tag manager container id. For more info: https://developers.google.com/tag-platform/tag-manager/web#standard_web_page_installation .
   */
  trackingIds?: string[];

  /**
   * @title GA Measurement Ids
   * @label measurement id
   * @description the google analytics property measurement id. For more info: https://support.google.com/analytics/answer/9539598
   */
  googleAnalyticsIds?: string[];

  /**
   * @description custom url for serving google tag manager. Set either this url or the tracking id
   */
  src?: string;

  /**
   * @description Disable forwarding events into dataLayer
   */
  disableAutomaticEventPush?: boolean;
}

export default function Analytics({
  trackingIds,
  src,
  googleAnalyticsIds,
  disableAutomaticEventPush,
}: Props) {
  const isDeploy = !!context.isDeploy;

  return (
    <>
      {/* Add Tag Manager script during production only. To test it locally remove the condition */}
      {isDeploy && (
        <>
          {trackingIds?.map((trackingId) => (
            <GoogleTagManager trackingId={trackingId.trim()} />
          ))}
          {googleAnalyticsIds?.map((trackingId) => (
            <GTAG trackingId={trackingId.trim()} />
          ))}
          {src && <GoogleTagManager src={src} />}
        </>
      )}

      {disableAutomaticEventPush !== true && (
        <script defer id="analytics-script" src={useScriptAsDataURI(snippet)} />
      )}
    </>
  );
}
