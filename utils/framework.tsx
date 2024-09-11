import { green } from "std/fmt/colors.ts";
import { PreactComponent, useFramework } from "@deco/deco";
export const errorIfFrameworkMismatch = (
  flavor: string,
  page: PreactComponent,
): PreactComponent => {
  return {
    ...page,
    Component: (props: typeof page["props"]) => {
      const framework = useFramework();
      if (flavor === "htmx" && flavor !== framework.name) {
        throw new Error(
          `hello 👋 we've found a framework mismatch. looks like your website is configured with a deprecated htmx configuration, please go to your fresh.config.ts and set htmx: true
// fresh.config.ts
export default defineConfig({
  plugins: plugins({
    manifest,
${green("+   htmx: true")},
    tailwind,
  }),
});
                    `,
        );
      }
      return <page.Component {...props} />;
    },
  };
};
