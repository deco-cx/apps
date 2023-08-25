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
    app("vtex"),
    app("vnda"),
    app("shopify"),
    app("website"),
    app("commerce"),
    app("workflows"),
    ...compatibilityApps,
  ],
};

export default config;
