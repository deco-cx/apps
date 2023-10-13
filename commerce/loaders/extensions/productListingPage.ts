import loader from "../product/extensions/listingPage.ts";

/** @deprecated use product/listingPage instead */
const deprecated = (...args: Parameters<typeof loader>) => loader(...args);

export default deprecated;
