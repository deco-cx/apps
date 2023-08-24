const app = (name: string) => ({ dir: name, name });

const legacyApps = [{
  dir: "./legacy/$live",
  name: "$live",
}, {
  dir: "./legacy/std",
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
    ...legacyApps,
  ],
};

export default config;
