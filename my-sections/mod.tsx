import { SourceMap } from "deco/blocks/app.ts";
import { Section, SectionModule } from "deco/blocks/section.ts";
import { Resolvable } from "deco/engine/core/resolver.ts";
import type { AppContext as AC, App, FnContext } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

/**
 * @title {{{name}}}.tsx
 */
export interface MySection {
  name: string;
  propsJsonSchema?: string | undefined;
  serializedComponent: string;
}

export interface State {
  sections: MySection[];
}

/**
 * @title my-sections
 */
export default function App(state: State): App<Manifest, State> {
  const [sections, sourceMap] = (state.sections ?? []).reduce(
    ([currentSections, currentSourceMap], sec) => {
      const sectionName = `my-sections/sections/${sec.name}.tsx`;

      return [
        {
          ...currentSections,
          [sectionName]: {
            default: ({ Component, props }) => {
              return (
                  <Component {...props}></Component>
              );
            },
            loader: async (props, _req, ctx: FnContext) => {
              const section = await ctx.get<Section>(JSON.parse(sec.serializedComponent));
              return section;
            },
          } as SectionModule<Resolvable, Section>,
        },
        {
          ...currentSourceMap,
          [sectionName]: () => {
            return Promise.resolve({
              functionRef: sectionName,
              inputSchema: {
                file: import.meta.url,
                name: crypto.randomUUID(),
                type: "inline",
                value: sec.propsJsonSchema ? JSON.parse(sec.propsJsonSchema): undefined,
              },
            } as BlockModuleRef);
          },
        },
      ];
    },
    [{}, {}] as [Record<string, SectionModule>, SourceMap]
  );
  return { manifest: { ...manifest, sections } as Manifest, state, sourceMap };
}

export type AppContext = AC<Awaited<ReturnType<typeof App>>>;
