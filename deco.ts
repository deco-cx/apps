const app = (name: string) => ({ dir: `./${name.replace("apps/", "")}`, name });

const config = {
  apps: [
    app("apps/vtex"),
    app("apps/vnda"),
    app("apps/shopify"),
    app("apps/website"),
    app("apps/workflows"),
  ],
};

export default config;
