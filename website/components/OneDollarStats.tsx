import { Head } from "$fresh/runtime.ts";
import { useScriptAsDataURI } from "@deco/deco/hooks";

export interface Props {
  /**
   * @description collector address to use
   */
  collectorAddress?: string;
}

declare global {
  interface Window {
    stonks: {
      event: (
        name: string,
        params: Record<string, string | boolean>,
      ) => void;
      view: (
        params: Record<string, string | boolean>,
      ) => void;
    };
  }
}

const trackerOriginal =
  `"use strict";function g(t){let e={};return["utm_campaign","utm_source","utm_medium","utm_term","utm_content"].forEach(n=>{let o=t.get(n);o&&(e[n]=o)}),e}function p(t){if(!t)return;let e=t.split(";"),n={};for(let o of e){let r=o.split("=").map(s=>s.trim());r.length!==2||r[0]===""||r[1]===""||(n[r[0]]=r[1])}return Object.keys(n).length===0?void 0:n}window.stonks={event:y,view:S};var l=document.currentScript,h=l?.getAttribute("data-hash-routing")!==null,m={isLocalhost:/^localhost$|^127(\.[0-9]+){0,2}\.[0-9]+$|^\[::1?\]$/.test(location.hostname)||location.protocol==="file:",isHeadlessBrowser:!!(window._phantom||window.__nightmare||window.navigator.webdriver||window.Cypress)};async function w(t){let e=l?.getAttribute("data-url")||"https://collector.onedollarstats.com/events",n=new URL(location.href);n.search="","path"in t&&t.path&&(n.pathname=t.path);let o=n.href.replace(/\\/$/,""),r=t.referrer??void 0;if(!r){let i=new URL(location.href),c=document.referrer&&document.referrer!=="null"?document.referrer:void 0;if(c){let u=new URL(c);u.hostname!==i.hostname&&(r=u.href)}}let s={u:o,e:[{t:t.type,h,r,p:t.props}]};t.utm&&Object.keys(t.utm).length>0&&(s.qs=t.utm),!(navigator.sendBeacon!==void 0&&navigator.sendBeacon(e,JSON.stringify(s)))&&fetch(e,{body:JSON.stringify(s),headers:{"Content-Type":"application/json"},keepalive:!0,method:"POST"}).catch(i=>console.error("fetch() failed:"))}async function y(t,e,n){if(d())return;let o={};typeof e=="string"?(o.path=e,n&&(o.props=n)):typeof e=="object"&&(o.props=e);let r=o?.path||void 0;if(!r){let s=document.body?.getAttribute("data-s:path")||document.querySelector('meta[name="stonks-path"]')?.getAttribute("content");s&&(r=s)}w({type:t,props:o?.props,path:r})}function A(t){if(t.type==="auxclick"&&t.button!==1)return;let e=t.target,n=e.getAttribute("data-s:event");if(!n)return;let o=e.getAttribute("data-s:event-props"),r=o?p(o):void 0,s=e.getAttribute("data-s:event-path")||void 0;y(n,s,r)}async function S(t,e){let n={};typeof t=="string"?(n.path=t,e&&(n.props=e)):typeof t=="object"&&(n.props=t),b({path:n?.path,props:n?.props},!1)}async function b(t,e=!0){if(e&&d())return;let n=new URLSearchParams(location.search),o=g(n),r=t?.path||void 0;if(!r){let i=document.body?.getAttribute("data-s:path")||document.querySelector('meta[name="stonks-path"]')?.getAttribute("content");i&&(r=i)}let s=t.props||void 0;if(!s){let i=l?.getAttribute("data-props"),c=i?p(i)||{}:{},u=document.querySelectorAll("[data-s\\:view-props]");for(let v of Array.from(u)){let f=v.getAttribute("data-s:view-props");if(!f)continue;let P=p(f);Object.assign(c,P)}s=c}w({type:"PageView",props:Object.keys(s).length>0?s:void 0,path:r,utm:o})}async function a(){let t=document.querySelector('meta[name="stonks-collect"]')?.getAttribute("content"),e=document.body?.getAttribute("data-s:collect");if(t==="false"||e==="false"){a.lastPage=null;return}if(!(l?.getAttribute("data-autocollect")!=="false")&&t!=="true"&&e!=="true"){a.lastPage=null;return}if(!h&&a.lastPage===location.pathname){console.warn("Ignoring event PageView - pathname has not changed");return}if(d())return;a.lastPage=location.pathname;let o=l?.getAttribute("data-props"),r=o?p(o)||{}:{},s=document.querySelectorAll("[data-s\\:view-props]");for(let i of Array.from(s)){let c=i.getAttribute("data-s:view-props");if(!c)continue;let u=p(c);Object.assign(r,u)}b({props:Object.keys(r).length>0?r:void 0},!1)}(e=>e.lastPage=null)(a||={});function d(){return!!(m.isLocalhost&&l?.getAttribute("data-allow-localhost")!=="true"||m.isHeadlessBrowser)}if(window.history.pushState){let t=window.history.pushState;window.history.pushState=function(e,n,o){t.apply(this,[e,n,o]),window.requestAnimationFrame(()=>{a()})},window.addEventListener("popstate",()=>{window.requestAnimationFrame(()=>{a()})})}document.visibilityState!=="visible"?document.addEventListener("visibilitychange",()=>{!a.lastPage&&document.visibilityState==="visible"&&a()}):a();document.addEventListener("click",A);`;
const snippet = () => {
  // Flags and additional dimentions
  const props: Record<string, string> = {};
  const trackPageview = () => globalThis.window.stonks?.view?.(props);
  // Attach pushState and popState listeners
  const originalPushState = history.pushState;
  if (originalPushState) {
    history.pushState = function () {
      // @ts-ignore monkey patch
      originalPushState.apply(this, arguments);
      trackPageview();
    };
    addEventListener("popstate", trackPageview);
  }
  // 2000 bytes limit
  const truncate = (str: string) => `${str}`.slice(0, 990);

  globalThis.window.DECO.events.subscribe((event) => {
    if (!event || event.name !== "deco") {
      return;
    }
    if (event.params) {
      const { flags, page } = event.params;
      if (Array.isArray(flags)) {
        for (const flag of flags) {
          props[flag.name] = truncate(flag.value.toString());
        }
      }
      props["pageId"] = truncate(`${page.id}`);
    }
    trackPageview();
  })();

  globalThis.window.DECO.events.subscribe((event) => {
    if (!event) {
      return;
    }
    const { name, params } = event;
    if (!name || !params || name === "deco") {
      return;
    }
    const values = { ...props };
    for (const key in params) {
      // @ts-expect-error somehow typescript bugs
      const value = params[key];
      if (value !== null && value !== undefined) {
        values[key] = truncate(
          typeof value !== "object" ? value : JSON.stringify(value),
        );
      }
    }
    globalThis.window.stonks?.event?.(name, values);
  });
};

function Component({ collectorAddress }: Props) {
  const collector = collectorAddress ??
    "https://collector.deco.cx/events?tenant=decocx";
  const tracker = trackerOriginal.replace("COLLECTOR_ADDRESS", collector);

  return (
    <Head>
      <link rel="dns-prefetch" href={collector} />
      <link
        rel="preconnect"
        href={collector}
        crossOrigin="anonymous"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: tracker,
        }}
        id="tracker"
        data-autocollect="false"
        data-hash-routing="true"
        data-url={collector}
      />
      <script defer src={useScriptAsDataURI(snippet)} />
    </Head>
  );
}
export default Component;
