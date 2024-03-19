import { scriptAsDataURI } from "../../../utils/dataURI.ts";

const snippet = () => {
  const url = new URL(window.location.href);
  const isSearch = url.searchParams.get("q");
  const apiUrl = "https://sp.vtex.com/event-api/v1/torratorra/event";

  globalThis.window.DECO.events.subscribe((event) => {
    if (event?.name == "select_item") {
      fetch(apiUrl);
    }
  });
};

export default function VtexAnalytics() {
  return <script type="text/javascript" defer src={scriptAsDataURI(snippet)} />;
}
