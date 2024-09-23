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
    app("posthog"),
    app("smarthint"),
    app("ra-trustvox"),
    app("anthropic"),
    app("resend"),
    app("emailjs"),
    app("konfidency"),
    app("mailchimp"),
    app("ai-assistants"),
    app("files"),
    app("openai"),
    app("brand-assistant"),
    app("implementation"),
    app("weather"),
    app("blog"),
    app("analytics"),
    app("sourei"),
    app("typesense"),
    app("algolia"),
    app("vtex"),
    app("vnda"),
    app("wake"),
    app("wap"),
    app("linx"),
    app("linx-impulse"),
    app("shopify"),
    app("nuvemshop"),
    app("website"),
    app("commerce"),
    app("workflows"),
    app("verified-reviews"),
    app("power-reviews"),
    app("crux"),
    app("decohub"),
    app("htmx"),
    app("sap"),
    ...compatibilityApps,
  ],
};

export default config;
