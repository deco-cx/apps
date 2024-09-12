import { Head } from "$fresh/runtime.ts";
import { AppContext } from "../mod.ts";
import { useScriptAsDataURI } from "@deco/deco/hooks";
export interface Props {
  /**
   * @description posthog identifier (override app apiKey).
   */
  apiKey: string;
  /**
   * @description posthog api host (override app host). Default to: https://us.i.posthog.com.
   */
  host?: string;
  /**
   * @description create profiles for anonymous users as well.
   */
  anonUsers?: boolean;
}
declare global {
  interface Window {
    posthog: {
      capture: (name: string, values: Record<string, string | boolean>) => void;
    };
  }
}
// This function should be self contained, because it is stringified!
const snippet = () => {
  // Flags and additional dimentions
  const props: Record<string, string> = {};
  const trackPageview = () =>
    globalThis.window.posthog?.capture("pageview", props);
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
  // setup plausible script and unsubscribe
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
    globalThis.window.posthog?.capture(name, values);
  });
};
export const loader = (props: Props, _req: Request, ctx: AppContext) => {
  return ({ apiKey: props.apiKey ?? ctx.apiKey, host: props.host ?? ctx.host });
};
function Component({ apiKey, host, anonUsers }: Props) {
  host ??= "https://us.i.posthog.com";
  return (
    <Head>
      <link rel="dns-prefetch" href={host} />
      <link rel="preconnect" href={host} crossOrigin="anonymous" />
      <script
        dangerouslySetInnerHTML={{
          __html:
            `!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
          posthog.init('${apiKey}',{api_host:'${host}', person_profiles: '${
              anonUsers ? "always" : "identified_only"
            }'})`,
        }}
      >
      </script>
      <script defer src={useScriptAsDataURI(snippet)} />
    </Head>
  );
}
export default Component;
