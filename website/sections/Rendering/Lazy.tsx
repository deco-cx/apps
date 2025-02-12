import { asResolved, context, isDeferred, RequestContext } from "@deco/deco";
import {
  type Section,
  type SectionContext,
  SectionCtx,
} from "@deco/deco/blocks";
import { useContext } from "preact/hooks";
import { shouldForceRender } from "../../../utils/deferred.ts";
import type { AppContext } from "../../mod.ts";
const useSectionContext = () =>
  useContext<SectionContext | undefined>(SectionCtx);
interface Props {
  /** @label hidden */
  section: Section;
  /**
   * @description htmx/Deferred.tsx prop
   * @hide true
   */
  loading?: "eager" | "lazy";
}
const defaultFallbackFor = (section: string) => () => (
  <div
    style={{
      height: "50vh",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
    }}
  >
    {!context.isDeploy && (
      <>
        <div>
          Async Rendering not implemented for section{" "}
          <span style={{ fontSize: "1rem", fontWeight: 600 }}>{section}</span>
        </div>
        <div style={{ fontSize: "0.75rem" }}>
          If you are a developer, export a{" "}
          <span style={{ fontWeight: 600 }}>LoadingFallback</span>{" "}
          component in this section. To learn more, check out our{" "}
          <a
            style={{ fontWeight: 600, textDecoration: "underline" }}
            href="https://deco.cx/en/blog/async-rendering#:~:text=Customizing%20Loading%20States%20Made%20Easy%3A"
          >
            guide
          </a>
        </div>
        <div style={{ fontSize: "0.75rem" }}>
          If you are NOT a developer, you can tweak Async Rendering. To learn
          more, check out our{" "}
          <a
            style={{ fontWeight: 600, textDecoration: "underline" }}
            href="https://deco.cx/en/blog/async-render-default#:~:text=Q%3A%20Can%20I%20disable%20the%20async%20render%3F"
          >
            blog post
          </a>
        </div>
      </>
    )}
  </div>
);
export const loader = async (props: Props, req: Request, ctx: AppContext) => {
  const { section, loading } = props;
  const url = new URL(req.url);
  const shouldRender = loading === "eager" || shouldForceRender({
    ctx,
    searchParams: url.searchParams,
  });
  if (shouldRender) {
    return {
      loading: "eager",
      section: isDeferred<Section>(section) ? await section() : section,
    };
  }
  const abortController = new AbortController();
  abortController.abort();
  const resolveSection = isDeferred<Section>(section)
    ? RequestContext.bind({ signal: abortController.signal }, section)
    : () => section;
  const resolvedSection = await resolveSection({}, {
    propagateOptions: true,
    hooks: {
      onPropsResolveStart: (resolve, _props, resolver) => {
        let next = resolve;
        if (resolver?.type === "matchers") { // matchers should not have a timeout.
          next = RequestContext.bind({ signal: req.signal }, resolve);
        }
        return next();
      },
    },
  });
  return {
    loading: shouldRender ? "eager" : "lazy",
    section: {
      Component: resolvedSection.LoadingFallback ??
        defaultFallbackFor(resolvedSection.metadata?.component ?? "unknown"),
      metadata: resolvedSection.metadata,
      props: {},
    },
  };
};
type SectionProps = Awaited<ReturnType<typeof loader>>;
function Lazy({ section, loading }: SectionProps) {
  const ctx = useSectionContext();
  if (!ctx) {
    throw new Error("Missing SectionContext");
  }
  if (loading === "lazy") {
    return (
      <ctx.FallbackWrapper props={{ loading: "eager" }}>
        <section.Component {...section.props} />
      </ctx.FallbackWrapper>
    );
  }
  return <section.Component {...section.props} />;
}
export const onBeforeResolveProps = (props: Props) => ({
  ...props,
  section: asResolved(props.section, true),
});
export default Lazy;
