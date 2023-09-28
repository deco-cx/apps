import { Head } from "$fresh/runtime.ts";
import type { AppContext } from "../mod.ts";
import Script from "partytown/Script.tsx";
import { context } from "deco/live.ts";

export interface Props {
  async?: boolean;
}

export interface SectionProps {
  async?: boolean;
  domain: string;
}

export const loader = (
  props: Omit<Props, "domain">,
  req: Request,
  ctx: AppContext,
): SectionProps | null => {
  const domain = new URL(req.url).hostname;
  console.log(domain, req, ctx);
  return { ...props, domain };
};

// For localhost debug only
const localAndExclusionScript =
  '!function(){"use strict";var l=window.location,o=window.document,p=o.currentScript,s=p.getAttribute("data-api")||new URL(p.src).origin+"/api/event";function c(t,e){t&&console.warn("Ignoring Event: "+t),e&&e.callback&&e.callback()}function t(t,e){try{if("true"===window.localStorage.plausible_ignore)return c("localStorage flag",e)}catch(t){}var a=p&&p.getAttribute("data-include"),i=p&&p.getAttribute("data-exclude");if("pageview"===t){a=!a||a.split(",").some(n),i=i&&i.split(",").some(n);if(!a||i)return c("exclusion rule",e)}function n(t){return l.pathname.match(new RegExp("^"+t.trim().replace(/\\*\\*/g,".*").replace(/([^\\.])\\*/g,"$1[^\\\\s/]*")+"/?$"))}var a={},r=(a.n=t,a.u=l.href,a.d=p.getAttribute("data-domain"),a.r=o.referrer||null,e&&e.meta&&(a.m=JSON.stringify(e.meta)),e&&e.props&&(a.p=e.props),new XMLHttpRequest);r.open("POST",s,!0),r.setRequestHeader("Content-Type","text/plain"),r.send(JSON.stringify(a)),r.onreadystatechange=function(){4===r.readyState&&e&&e.callback&&e.callback()}}var e=window.plausible&&window.plausible.q||[];window.plausible=t;for(var a,i=0;i<e.length;i++)t.apply(this,e[i]);function n(){a!==l.pathname&&(a=l.pathname,t("pageview"))}var r,u=window.history;u.pushState&&(r=u.pushState,u.pushState=function(){r.apply(this,arguments),n()},window.addEventListener("popstate",n)),"prerender"===o.visibilityState?o.addEventListener("visibilitychange",function(){a||"visible"!==o.visibilityState||n()}):n()}();';

const exclusionScript =
  '!function(){"use strict";var o=window.location,l=window.document,s=l.currentScript,p=s.getAttribute("data-api")||new URL(s.src).origin+"/api/event";function c(t,e){t&&console.warn("Ignoring Event: "+t),e&&e.callback&&e.callback()}function t(t,e){if(/^localhost$|^127(\\.[0-9]+){0,2}\\.[0-9]+$|^\\[::1?\\]$/.test(o.hostname)||"file:"===o.protocol)return c("localhost",e);if(window._phantom||window.__nightmare||window.navigator.webdriver||window.Cypress)return c(null,e);try{if("true"===window.localStorage.plausible_ignore)return c("localStorage flag",e)}catch(t){}var i=s&&s.getAttribute("data-include"),n=s&&s.getAttribute("data-exclude");if("pageview"===t){i=!i||i.split(",").some(a),n=n&&n.split(",").some(a);if(!i||n)return c("exclusion rule",e)}function a(t){return o.pathname.match(new RegExp("^"+t.trim().replace(/\\*\\*/g,".*").replace(/([^\\.])\\*/g,"$1[^\\\\s/]*")+"/?$"))}var i={},r=(i.n=t,i.u=o.href,i.d=s.getAttribute("data-domain"),i.r=l.referrer||null,e&&e.meta&&(i.m=JSON.stringify(e.meta)),e&&e.props&&(i.p=e.props),new XMLHttpRequest);r.open("POST",p,!0),r.setRequestHeader("Content-Type","text/plain"),r.send(JSON.stringify(i)),r.onreadystatechange=function(){4===r.readyState&&e&&e.callback&&e.callback()}}var e=window.plausible&&window.plausible.q||[];window.plausible=t;for(var i,n=0;n<e.length;n++)t.apply(this,e[n]);function a(){i!==o.pathname&&(i=o.pathname,t("pageview"))}var r,u=window.history;u.pushState&&(r=u.pushState,u.pushState=function(){r.apply(this,arguments),a()},window.addEventListener("popstate",a)),"prerender"===l.visibilityState?l.addEventListener("visibilitychange",function(){i||"visible"!==l.visibilityState||a()}):a()}();';

const plausibleScript = exclusionScript;

function Component({
  async,
  domain,
}: SectionProps) {
  if (!context.isDeploy) {
    return <></>;
  }
  return (
    <>
      <Head>
        <link rel="dns-prefetch" href="https://plausible.io/api/event" />
        <link
          rel="preconnect"
          href="https://plausible.io/api/event"
          crossOrigin="anonymous"
        />
        {async &&
          (
            <Script
              type="module"
              dangerouslySetInnerHTML={{
                __html: plausibleScript,
              }}
            />
          )}
        {!async && (
          <script
            defer
            data-domain={domain}
            data-exclude="/proxy"
            data-api="https://plausible.io/api/event"
            dangerouslySetInnerHTML={{
              __html: plausibleScript,
            }}
          />
        )}
        <script
          dangerouslySetInnerHTML={{
            __html:
              `window.deco = (window.deco || {"analytics": [(x, y, z) => console.log(x, y, z)]});`,
          }}
        />
      </Head>
    </>
  );
}

export default Component;
