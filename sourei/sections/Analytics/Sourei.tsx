// deno-lint-ignore-file no-explicit-any
import { Head } from "$fresh/runtime.ts";
import { scriptAsDataURI } from "../../../utils/dataURI.ts";

interface Props {
  /**
   * @title Hostname
   * @description e.g: https://ss.sourei.com
   * @default https://www.googletagmanager.com
   */
  hostname: string;
  /**
   * @title GTM ID
   * @description e.g: GTM-XXXXXXXX
   */
  gtmId: string;
}

const snippet = () => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    "gtm.start": new Date().getTime(),
    event: "gtm.js",
  });

  const fixId = ({ item_id, item_group_id, item_url, ...rest }: any) =>
    item_group_id
      ? ({ item_id: `${item_group_id}_${item_id}`, ...rest })
      : ({ item_id, ...rest });

  const fixPrice = (
    { price, discount = 0, quantity = 1, ...rest }: any,
  ) => ({
    ...rest,
    discount,
    quantity,
    price: price + discount,
  });

  window.DECO.events.subscribe((event) => {
    if (!event) return;

    if (event.name === "deco-flags") {
      window.dataLayer.push(event);
      return;
    }

    const ecommerce: any = { ...event.params };

    if (ecommerce && Array.isArray(ecommerce.items)) {
      ecommerce.items = ecommerce.items
        .map(fixId)
        .map(fixPrice);
    }

    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({ event: event.name, ecommerce });
  });
};

function Section({
  gtmId,
  hostname = "https://www.googletagmanager.com",
}: Props) {
  const src = new URL(`/gtm.js?id=${gtmId}`, hostname);
  const iframeSrc = new URL(`/ns.html?id=${gtmId}`, hostname);

  return (
    <>
      {/* Head */}
      <Head>
        <script src={src.href} defer />
        <script src={scriptAsDataURI(snippet)} defer />
      </Head>

      {/* Body */}
      <noscript>
        <iframe
          src={iframeSrc.href}
          height="0"
          width="0"
          style="display:none;visibility:hidden"
        />
      </noscript>
    </>
  );
}

export default Section;
