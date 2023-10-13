import loader from "../product/extensions/detailsPage.ts";

/** @deprecated use product/detailsPage instead */
const deprecated = (...args: Parameters<typeof loader>) => loader(...args);

export default deprecated;
