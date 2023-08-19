const app = (name: string) => ({ dir: name, name });

const config = {
  apps: [
    app("vtex"),
    app("vnda"),
    app("shopify"),
    app("website"),
    app("workflows"),
  ],
};

export default config;
