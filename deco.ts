const app = (name: string) => ({ dir: name, name });

const compatibilityApps = [{
  dir: "./compat/$live",
  name: "$live",
}, {
  dir: "./compat/std",
  name: "deco-sites/std",
}];

const config = {
  apps: [
    app("implementation"),
    app("weather"),
    {
      dir: "admin",
      name: "deco-sites/admin",
    },
    app("analytics"),
    app("sourei"),
    app("typesense"),
    app("algolia"),
    app("handlebars"),
    app("section-lab"),
    app("vtex"),
    app("vnda"),
    app("wake"),
    app("linx"),
    app("shopify"),
    app("nuvemshop"),
    app("website"),
    app("commerce"),
    app("workflows"),
    app("verified-reviews"),
    app("power-reviews"),
    app("decohub"),
    ...compatibilityApps,
  ],
};

export default config;
