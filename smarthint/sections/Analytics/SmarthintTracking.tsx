import { AppContext } from "../../mod.ts";
import { Props as ClickProps } from "../../actions/click.ts";
import { PageType } from "../../utils/typings.ts";
import { ANONYMOUS_COOKIE, SESSION_COOKIE } from "../../utils/getSession.ts";
import { sortPagesPattern } from "../../utils/sortPagesPattern.ts";
import { useScriptAsDataURI } from "@deco/deco/hooks";
declare global {
  interface Window {
    smarthint: {
      click: (props: ClickProps) => void;
    };
  }
}
const listener = (
  { shcode, pagesPathPattern, publicUrl, SESSION_COOKIE, ANONYMOUS_COOKIE }:
    ReturnType<typeof loader>,
) => {
  const prodURL = new URL(publicUrl);
  const url = new URL(window.location.href);
  url.host = prodURL.host;
  url.port = "";
  const pageType =
    pagesPathPattern.find(({ page }) =>
      new URLPattern({ pathname: page }).test(url.href)
    )?.pageType ?? "others";
  const click = (
    {
      productGroupID,
      position,
      clickFeature,
      term,
      positionRecommendation,
      productPrice,
      shippingPrice,
      shippingTime,
      clickProduct,
    }: ClickProps,
  ) => {
    const clickUrl = new URL("https://recs.smarthint.co/track/click");
    const date = new Date().toLocaleString().replace(",", "");
    const pageUrl = new URL(url);
    const origin = pageUrl.origin;
    const pathTerm = pageUrl.searchParams.get("busca") ||
      pageUrl.searchParams.get("q");
    const session = getCookie(SESSION_COOKIE) ?? "";
    const anonymousConsumer = getCookie(ANONYMOUS_COOKIE) ?? "";
    clickUrl.searchParams.set("clickFeature", clickFeature);
    clickUrl.searchParams.set("shcode", shcode);
    clickUrl.searchParams.set("clickProduct", clickProduct);
    clickUrl.searchParams.set("productId", productGroupID);
    clickUrl.searchParams.set("locationRecs", positionRecommendation);
    clickUrl.searchParams.set("position", String(position));
    clickUrl.searchParams.set("origin", origin);
    clickUrl.searchParams.set("date", date);
    clickUrl.searchParams.set("pagetype", pageType);
    clickUrl.searchParams.set("productPrice", String(productPrice));
    clickUrl.searchParams.set("anonymousConsumer", anonymousConsumer);
    clickUrl.searchParams.set("session", session);
    if (term || pathTerm) {
      clickUrl.searchParams.set("term", term ?? pathTerm);
    }
    if (shippingPrice) {
      clickUrl.searchParams.set("shippingPrice", String(shippingPrice));
    }
    if (shippingTime) {
      clickUrl.searchParams.set("shippingTime", String(shippingTime));
    }
    if (shippingTime) {
      clickUrl.searchParams.set("shippingTime", String(shippingTime));
    }
    fetch(clickUrl);
  };
  const setup = () => {
    globalThis.window.smarthint = { click };
  };
  function getCookie(name: string): string | null {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + "=")) {
        return cookie.substring(name.length + 1);
      }
    }
    return null;
  }
  function setCookie(name: string, value: string, seconds: number): void {
    let expires = "";
    if (seconds) {
      const date = new Date();
      date.setTime(date.getTime() + seconds);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = `${name}=${value || ""}${expires}; path=/`;
  }
  function resetCookieExpiration(
    name: string,
    value: string,
    seconds: number,
  ): void {
    const date = new Date();
    const dateExpiration = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999,
    );
    const dateLimit = dateExpiration.getTime() - date.getTime();
    const cookieLimit = dateLimit < seconds ? dateLimit : seconds;
    setCookie(name, value, cookieLimit);
  }
  function setupCookieResetOnInteraction(
    cookieName: string,
    cookieValue: string,
    expirationSeconds: number,
  ): void {
    const resetCookie = () => {
      resetCookieExpiration(cookieName, cookieValue, expirationSeconds);
    };
    document.addEventListener("click", resetCookie);
    document.addEventListener("keydown", resetCookie);
    document.addEventListener("mousemove", resetCookie);
    document.addEventListener("scroll", resetCookie);
    document.addEventListener("touchstart", resetCookie);
  }
  function createUserToken() {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }
    return (Math.random() * 1e9).toFixed();
  }
  function setupSession() {
    const sessionValue = getCookie(SESSION_COOKIE) ?? createUserToken();
    setupCookieResetOnInteraction(SESSION_COOKIE, sessionValue, 30 * 60 * 1000);
  }
  function setupAnonymous() {
    const anonymousValue = getCookie(ANONYMOUS_COOKIE) ?? createUserToken();
    setupCookieResetOnInteraction(
      ANONYMOUS_COOKIE,
      anonymousValue,
      30 * 60 * 1000,
    );
  }
  const pageView = () => {
    globalThis.window.addEventListener("load", () => {
      const pageUrl = new URL(url);
      const origin = pageUrl.origin;
      const date = new Date().toLocaleString().replace(",", "");
      const pageViewUrl = new URL("https://recs.smarthint.co/track/pageView");
      const session = getCookie(SESSION_COOKIE) ?? "";
      const anonymousConsumer = getCookie(ANONYMOUS_COOKIE) ?? "";
      pageViewUrl.searchParams.set("shcode", shcode);
      pageViewUrl.searchParams.set("url", pageUrl.href);
      pageViewUrl.searchParams.set("origin", origin);
      pageViewUrl.searchParams.set("pageType", pageType);
      pageViewUrl.searchParams.set("elapsedTime", "0");
      pageViewUrl.searchParams.set("date", date);
      pageViewUrl.searchParams.set("session", session);
      pageViewUrl.searchParams.set("anonymousConsumer", anonymousConsumer);
      fetch(pageViewUrl);
    });
  };
  setup();
  setupSession();
  setupAnonymous();
  pageView();
};
/**
 * @title SmartHint Tracking
 */
function Analytics(props: ReturnType<typeof loader>) {
  return <script defer src={useScriptAsDataURI(listener, props)} />;
}
/**
 * @title {{{page}}}
 */
export interface Page {
  /**
   * @format dynamic-options
   * @options website/loaders/options/routes.ts
   */
  page: string;
  pageType: PageType;
}
export interface Props {
  pages: Page[];
}
export const loader = (props: Props, _req: Request, ctx: AppContext) => {
  const { shcode, publicUrl } = ctx;
  const pagesSorted = sortPagesPattern(props.pages);
  return {
    shcode,
    publicUrl,
    pagesPathPattern: pagesSorted,
    SESSION_COOKIE,
    ANONYMOUS_COOKIE,
  };
};
export default Analytics;
