import Analytics, { Props } from "../../components/Analytics.tsx";
import { isRenderedFromRequestProps } from "../../utils/renderFromRequest.ts";

// Tag ids and the GTM host decide which third-party code runs on the page, so
// never take them from request props (see isRenderedFromRequestProps). A
// partial render can't inject <head> tags anyway.
export const loader = (props: Props, req: Request): Props =>
  isRenderedFromRequestProps(req)
    ? {
      ...props,
      src: undefined,
      trackingIds: undefined,
      googleAnalyticsIds: undefined,
    }
    : props;

function Section(props: Props) {
  return <Analytics {...props} />;
}

export default Section;
