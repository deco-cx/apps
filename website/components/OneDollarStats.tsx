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
    trackCustomEvent: (
      name: string,
      params: Record<string, string | boolean>,
    ) => void;
  }
}

const trackerOriginal =
  `"use strict";(()=>{var L;var V=-1,m=function(e){addEventListener("pageshow",function(t){t.persisted&&(V=t.timeStamp,e(t))},!0)},_=function(){var e=self.performance&&performance.getEntriesByType&&performance.getEntriesByType("navigation")[0];if(e&&e.responseStart>0&&e.responseStart<performance.now())return e},I=function(){var e=_();return e&&e.activationStart||0},p=function(e,t){var n=_(),r="navigate";return V>=0?r="back-forward-cache":n&&(document.prerendering||I()>0?r="prerender":document.wasDiscarded?r="restore":n.type&&(r=n.type.replace(/_/g,"-"))),{name:e,value:t===void 0?-1:t,rating:"good",delta:0,entries:[],id:"v4-".concat(Date.now(),"-").concat(Math.floor(8999999999999*Math.random())+1e12),navigationType:r}},g=function(e,t,n){try{if(PerformanceObserver.supportedEntryTypes.includes(e)){var r=new PerformanceObserver(function(i){Promise.resolve().then(function(){t(i.getEntries())})});return r.observe(Object.assign({type:e,buffered:!0},n||{})),r}}catch{}},v=function(e,t,n,r){var i,o;return function(u){t.value>=0&&(u||r)&&((o=t.value-(i||0))||i===void 0)&&(i=t.value,t.delta=o,t.rating=function(c,a){return c>a[1]?"poor":c>a[0]?"needs-improvement":"good"}(t.value,n),e(t))}},A=function(e){requestAnimationFrame(function(){return requestAnimationFrame(function(){return e()})})},b=function(e){document.addEventListener("visibilitychange",function(){document.visibilityState==="hidden"&&e()})},R=function(e){var t=!1;return function(){t||(e(),t=!0)}},h=-1,B=function(){return document.visibilityState!=="hidden"||document.prerendering?1/0:0},E=function(e){document.visibilityState==="hidden"&&h>-1&&(h=e.type==="visibilitychange"?e.timeStamp:0,ne())},M=function(){addEventListener("visibilitychange",E,!0),addEventListener("prerenderingchange",E,!0)},ne=function(){removeEventListener("visibilitychange",E,!0),removeEventListener("prerenderingchange",E,!0)},D=function(){return h<0&&(h=B(),M(),m(function(){setTimeout(function(){h=B(),M()},0)})),{get firstHiddenTime(){return h}}},k=function(e){document.prerendering?addEventListener("prerenderingchange",function(){return e()},!0):e()},N=[1800,3e3],ie=function(e,t){t=t||{},k(function(){var n,r=D(),i=p("FCP"),o=g("paint",function(u){u.forEach(function(c){c.name==="first-contentful-paint"&&(o.disconnect(),c.startTime<r.firstHiddenTime&&(i.value=Math.max(c.startTime-I(),0),i.entries.push(c),n(!0)))})});o&&(n=v(e,i,N,t.reportAllChanges),m(function(u){i=p("FCP"),n=v(e,i,N,t.reportAllChanges),A(function(){i.value=performance.now()-u.timeStamp,n(!0)})}))})},j=[.1,.25],U=function(e,t){t=t||{},ie(R(function(){var n,r=p("CLS",0),i=0,o=[],u=function(a){a.forEach(function(d){if(!d.hadRecentInput){var ee=o[0],te=o[o.length-1];i&&d.startTime-te.startTime<1e3&&d.startTime-ee.startTime<5e3?(i+=d.value,o.push(d)):(i=d.value,o=[d])}}),i>r.value&&(r.value=i,r.entries=o,n())},c=g("layout-shift",u);c&&(n=v(e,r,j,t.reportAllChanges),b(function(){u(c.takeRecords()),n(!0)}),m(function(){i=0,r=p("CLS",0),n=v(e,r,j,t.reportAllChanges),A(function(){return n()})}),setTimeout(n,0))}))},$=0,S=1/0,y=0,re=function(e){e.forEach(function(t){t.interactionId&&(S=Math.min(S,t.interactionId),y=Math.max(y,t.interactionId),$=y?(y-S)/7+1:0)})},J=function(){return L?$:performance.interactionCount||0},oe=function(){"interactionCount"in performance||L||(L=g("event",re,{type:"event",buffered:!0,durationThreshold:0}))},f=[],T=new Map,Q=0,ae=function(){var e=Math.min(f.length-1,Math.floor((J()-Q)/50));return f[e]},ue=[],ce=function(e){if(ue.forEach(function(i){return i(e)}),e.interactionId||e.entryType==="first-input"){var t=f[f.length-1],n=T.get(e.interactionId);if(n||f.length<10||e.duration>t.latency){if(n)e.duration>n.latency?(n.entries=[e],n.latency=e.duration):e.duration===n.latency&&e.startTime===n.entries[0].startTime&&n.entries.push(e);else{var r={id:e.interactionId,latency:e.duration,entries:[e]};T.set(r.id,r),f.push(r)}f.sort(function(i,o){return o.latency-i.latency}),f.length>10&&f.splice(10).forEach(function(i){return T.delete(i.id)})}}},z=function(e){var t=self.requestIdleCallback||self.setTimeout,n=-1;return e=R(e),document.visibilityState==="hidden"?e():(n=t(e),b(e)),n},x=[200,500],G=function(e,t){"PerformanceEventTiming"in self&&"interactionId"in PerformanceEventTiming.prototype&&(t=t||{},k(function(){var n;oe();var r,i=p("INP"),o=function(c){z(function(){c.forEach(ce);var a=ae();a&&a.latency!==i.value&&(i.value=a.latency,i.entries=a.entries,r())})},u=g("event",o,{durationThreshold:(n=t.durationThreshold)!==null&&n!==void 0?n:40});r=v(e,i,x,t.reportAllChanges),u&&(u.observe({type:"first-input",buffered:!0}),b(function(){o(u.takeRecords()),r(!0)}),m(function(){Q=J(),f.length=0,T.clear(),i=p("INP"),r=v(e,i,x,t.reportAllChanges)}))}))},H=[2500,4e3],P={},K=function(e,t){t=t||{},k(function(){var n,r=D(),i=p("LCP"),o=function(a){t.reportAllChanges||(a=a.slice(-1)),a.forEach(function(d){d.startTime<r.firstHiddenTime&&(i.value=Math.max(d.startTime-I(),0),i.entries=[d],n())})},u=g("largest-contentful-paint",o);if(u){n=v(e,i,H,t.reportAllChanges);var c=R(function(){P[i.id]||(o(u.takeRecords()),u.disconnect(),P[i.id]=!0,n(!0))});["keydown","click"].forEach(function(a){addEventListener(a,function(){return z(c)},!0)}),b(c),m(function(a){i=p("LCP"),n=v(e,i,H,t.reportAllChanges),A(function(){i.value=performance.now()-a.timeStamp,P[i.id]=!0,n(!0)})})}})};function se(e){return e.getAttribute("data-hash-routing")!==null}function W(){return!!(window._phantom||window.__nightmare||window.navigator.webdriver||window.Cypress)}function X(){return window.localStorage.getItem("unexpected_ignore")==="true"}function w(e,t){console.warn('Ignoring event '+ e + t)}function Y(e,t){if(navigator.sendBeacon!==void 0){if(navigator.sendBeacon(e,JSON.stringify(t)))return;console.warn("sendBeacon() didn't queue the request, falling back to fetch()")}fetch(e,{body:JSON.stringify(t),headers:{"Content-Type":"application/json"},keepalive:!0,method:"POST"}).catch(n=>console.error('fetch() failed: ' + n.message))}function s(e,t){var n;if(!((n=window.unexpected)===null||n===void 0)&&n.q||(window.unexpected={q:[]}),window.unexpected.q.push(e),t===0){s.timeout&&(clearTimeout(s.timeout.id),s.timeout=null),C();return}let r=()=>{C(),s.timeout=null};if(!s.timeout){s.timeout={id:setTimeout(r,t),delay:t};return}s.timeout.delay>=t&&(clearTimeout(s.timeout.id),s.timeout={id:setTimeout(r,t),delay:t})}(function(e){e.timeout=null})(s||(s={}));function C(){var e;if(!(!((e=window.unexpected)===null||e===void 0)&&e.q)||!window.unexpected.q.length)return;s.timeout!==null&&clearTimeout(s.timeout.id);let t=window.unexpected.q;window.unexpected.q=[];let n={u:t[0].u,v:t[0].v,e:[]};for(let i of t)switch(i.t){case"CwvReport":n.e.push({t:"CwvReport",cls:i.cls,inp:i.inp,lcp:i.lcp});break;case"PageView":n.e.push({t:"PageView",h:i.h,r:i.r});break}let r=Z();Y(r,n)}async function q(){let e=new URL(location.href);return e.search="",{u:e.href}}async function O(e){if(W())return w("CwvReport","Running in a headless browser");if(X())return w("CwvReport","Ignore flag is set");s(Object.assign(Object.assign({},await q()),{t:"CwvReport",cls:e.name==="CLS"?e.value:void 0,inp:e.name==="INP"?e.value:void 0,lcp:e.name==="LCP"?e.value:void 0}),5e3)}async function l(){if(W())return w("PageView","Running in a headless browser");if(X())return w("PageView","Ignore flag is set");if(!F&&l.lastPage===location.pathname)return w("PageView","Pathname has not changed");l.lastPage=location.pathname;let e=new URL(location.href),t=document.referrer?new URL(document.referrer):void 0;t&&(t.search=""),s(Object.assign(Object.assign({},await q()),{t:"PageView",h:F,r:t&&t.hostname!==e.hostname?t.href:void 0}),0)}(function(e){e.lastPage=null})(l||(l={}));var de=document.currentScript,F=se(de);U(O);G(O);K(O);if(window.history.pushState){let e=window.history.pushState;window.history.pushState=function(t,n,r){e.apply(this,[t,n,r]),l()},window.addEventListener("popstate",l)}document.visibilityState!=="visible"?document.addEventListener("visibilitychange",()=>{!l.lastPage&&document.visibilityState==="visible"&&l()}):l();document.addEventListener("visibilitychange",()=>{document.visibilityState});document.addEventListener("pagehide",C);async function fe(e,t){let n=Object.assign(Object.assign({},await q()),{e:[{t:e,p:t||void 0,h:F}]}),r=Z();Y(r,n)}function Z(){let e=document.querySelector("#tracker")||document.currentScript,t=e?.getAttribute("data-url");if(!t)throw new Error("No url provided to data-url attribute");return t}window.trackCustomEvent=fe;})();`;

const snippet = () => {
  // Flags and additional dimentions
  const props: Record<string, string> = {};
  const trackPageview = () =>
    globalThis.window.trackCustomEvent?.("pageview", props);
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
    globalThis.window.trackCustomEvent?.(name, values);
  });

  trackPageview();
};

function Component({ collectorAddress }: Props) {
  const collector = collectorAddress ?? "https://collector.deco.cx/events";
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
        data-url={collector}
      />
      <script defer src={useScriptAsDataURI(snippet)} />
    </Head>
  );
}
export default Component;
