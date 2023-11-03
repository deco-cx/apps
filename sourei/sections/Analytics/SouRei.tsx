import { Head } from "$fresh/runtime.ts";
import { scriptAsDataURI } from "../../../utils/dataURI.ts";

interface Props {
  src: string;
}

const snippet = () => {
  window.dataLayer = window.dataLayer || [];

  // It is safe to .push in datalayer in here because partytown have already
  // run and made dataLayer.push available in window
  window.dataLayer.push({
    "gtm.start": new Date().getTime(),
    event: "gtm.js",
  });

  window.DECO.events.subscribe((event) => {
    if (!event) return;

    if (event.name === "deco-flags") {
      window.dataLayer.push(event);
      return;
    }

    // deno-lint-ignore no-explicit-any
    const ecommerce: any = { ...event.params };

    if (ecommerce && Array.isArray(ecommerce.items)) {
      ecommerce.items = ecommerce.items.map((
        // deno-lint-ignore no-explicit-any
        { item_id, item_group_id, item_url, ...rest }: any,
      ) =>
        item_group_id
          ? ({ item_id: `${item_id}_${item_group_id}`, ...rest })
          : ({ item_id, ...rest })
      );
    }

    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({ event: event.name, ecommerce });
  });
};

function Analytics({ src }: Props) {
  return (
    <>
      <Head>
        <script src={src} defer />
        <script src={scriptAsDataURI(snippet)} defer />
      </Head>
      <noscript>
        <iframe
          src={src}
          height="0"
          width="0"
          style="display:none;visibility:hidden"
        />
      </noscript>
    </>
  );
}

export default Analytics;
