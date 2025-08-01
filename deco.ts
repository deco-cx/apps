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
    app("discord-user"),
    app("discord-bot"),
    app("pncp"),
    app("google-calendar"),
    app("apify"),
    app("google-docs"),
    app("google-drive"),
    app("google-youtube"),
    app("barte"),
    app("hubspot"),
    app("pinecone-assistant"),
    app("shopify-mcp"),
    app("superfrete"),
    app("google-gmail"),
    app("github"),
    app("turso-db"),
    app("discohook"),
    app("tiny"),
    app("js-bundler"),
    app("jira"),
    app("deno-deploy"),
    app("exa"),
    app("figma"),
    app("unsplash"),
    app("reflect"),
    app("grain"),
    app("slack"),
    app("serper"),
    app("sienge"),
    app("vertex"),
    app("google-sheets"),
    app("posthog"),
    app("decopilot-app"),
    app("smarthint"),
    app("ra-trustvox"),
    app("anthropic"),
    app("resend"),
    app("emailjs"),
    app("aws"),
    app("konfidency"),
    app("mailchimp"),
    app("ai-assistants"),
    app("airtable"),
    app("files"),
    app("openai"),
    app("perplexity"),
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
    app("stability"),
    app("elevenlabs"),
    app("vidu"),
    app("nuvemshop"),
    app("streamshop"),
    app("brasilapi"),
    app("readwise"),
    app("rd-station-marketing"),
    app("website"),
    app("commerce"),
    app("workflows"),
    app("verified-reviews"),
    app("power-reviews"),
    app("crux"),
    app("decohub"),
    app("htmx"),
    app("querido-diario"),
    app("sap"),
    app("tiptap-cloud"),
    app("browser-use"),
    app("clearsale"),
    app("spotify"),
    ...compatibilityApps,
  ],
};

export default config;
