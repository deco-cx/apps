import { Head } from "$fresh/runtime.ts";
import { useRouterContext } from "deco/routes/[...catchall].tsx";

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

// For localhost debug only
const localAndExclusionScript =
  '!function(){"use strict";var l=window.location,o=window.document,p=o.currentScript,s=p.getAttribute("data-api")||new URL(p.src).origin+"/api/event";function c(t,e){t&&console.warn("Ignoring Event: "+t),e&&e.callback&&e.callback()}function t(t,e){try{if("true"===window.localStorage.plausible_ignore)return c("localStorage flag",e)}catch(t){}var a=p&&p.getAttribute("data-include"),i=p&&p.getAttribute("data-exclude");if("pageview"===t){a=!a||a.split(",").some(n),i=i&&i.split(",").some(n);if(!a||i)return c("exclusion rule",e)}function n(t){return l.pathname.match(new RegExp("^"+t.trim().replace(/\\*\\*/g,".*").replace(/([^\\.])\\*/g,"$1[^\\\\s/]*")+"/?$"))}var a={},r=(a.n=t,a.u=l.href,a.d=((w,d)=>{const h=w.location.hostname;return h.replace(/^www\./,"")})(window,document),a.r=o.referrer||null,e&&e.meta&&(a.m=JSON.stringify(e.meta)),e&&e.props&&(a.p=e.props),new XMLHttpRequest);r.open("POST",s,!0),r.setRequestHeader("Content-Type","text/plain"),r.send(JSON.stringify(a)),r.onreadystatechange=function(){4===r.readyState&&e&&e.callback&&e.callback()}}var e=window.plausible&&window.plausible.q||[];window.plausible=t;for(var a,i=0;i<e.length;i++)t.apply(this,e[i]);function n(){a!==l.pathname&&(a=l.pathname,t("pageview"))}var r,u=window.history;u.pushState&&(r=u.pushState,u.pushState=function(){r.apply(this,arguments),n()},window.addEventListener("popstate",n)),"prerender"===o.visibilityState?o.addEventListener("visibilitychange",function(){a||"visible"!==o.visibilityState||n()}):n()}();';

const exclusionScript =
  '!function(){"use strict";var l=window.location,s=window.document,u=s.currentScript,c=u.getAttribute("data-api")||new URL(u.src).origin+"/api/event";function p(t,e){t&&console.warn("Ignoring Event: "+t),e&&e.callback&&e.callback()}function t(t,e){if(/^localhost$|^127(\\.[0-9]+){0,2}\\.[0-9]+$|^\\[::1?\\]$/.test(l.hostname)||"file:"===l.protocol)return p("localhost",e);if(window._phantom||window.__nightmare||window.navigator.webdriver||window.Cypress)return p(null,e);try{if("true"===window.localStorage.plausible_ignore)return p("localStorage flag",e)}catch(t){}var i=u&&u.getAttribute("data-include"),n=u&&u.getAttribute("data-exclude");if("pageview"===t){i=!i||i.split(",").some(a),n=n&&n.split(",").some(a);if(!i||n)return p("exclusion rule",e)}function a(t){return l.pathname.match(new RegExp("^"+t.trim().replace(/\\*\\*/g,".*").replace(/([^\\.])\\*/g,"$1[^\\\\s/]*")+"/?$"))}var i={},n=(i.n=t,i.u=l.href,i.d=((w,d)=>{const h=w.location.hostname;return h.replace(/^www\./,"")})(window,document),i.r=s.referrer||null,e&&e.meta&&(i.m=JSON.stringify(e.meta)),e&&e.props&&(i.p=e.props),u.getAttributeNames().filter(function(t){return"event-"===t.substring(0,6)})),r=i.p||{},o=(n.forEach(function(t){var e=t.replace("event-",""),t=u.getAttribute(t);r[e]=r[e]||t}),i.p=r,new XMLHttpRequest);o.open("POST",c,!0),o.setRequestHeader("Content-Type","text/plain"),o.send(JSON.stringify(i)),o.onreadystatechange=function(){4===o.readyState&&e&&e.callback&&e.callback()}}var e=window.plausible&&window.plausible.q||[];window.plausible=t;for(var i,n=0;n<e.length;n++)t.apply(this,e[n]);function a(){i!==l.pathname&&(i=l.pathname,t("pageview"))}var r,o=window.history;o.pushState&&(r=o.pushState,o.pushState=function(){r.apply(this,arguments),a()},window.addEventListener("popstate",a)),"prerender"===s.visibilityState?s.addEventListener("visibilitychange",function(){i||"visible"!==s.visibilityState||a()}):a()}();';

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
