import type { App, AppContext as AC } from "$live/mod.ts";
import { SourceMap } from "deco/blocks/app.ts";
import { SectionModule } from "deco/blocks/section.ts";
import { JSONSchema7 } from "deco/deps.ts";
import { BlockModuleRef } from "deco/engine/block.ts";
import Handlebars from "https://esm.sh/v131/handlebars@4.7.8";
import { HTMLRenderer } from "./deps.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

const h = Handlebars as unknown as typeof Handlebars["export="];
export interface HandlebarSection {
  name: string;
  /**
   * @format html
   */
  content: string;
}

const getHBVars = (content: string) => {
  const ast = h.parse(content);
  const keys: Record<string, boolean> = {};

  for (const i in ast.body) {
    if (ast.body[i].type === "MustacheStatement") {
      keys[
        (ast.body[i] as unknown as { path: { original: string } }).path.original
      ] = true;
    }
  }
  return Object.keys(keys);
};
export interface State {
  sections: HandlebarSection[];
}
/**
 * @title Build your own Sections
 */
export default function App(
  state: State,
): App<Manifest, State> {
  const [sections, sourceMap] = (state.sections ?? []).reduce(
    ([currentSections, currentSourceMap], sec) => {
      const sectionName = `handlebars/sections/${sec.name}.tsx`;
      const compiled = h.compile(sec.content);
      const properties: Record<string, JSONSchema7> = {};
      const vars = getHBVars(sec.content);
      for (const key of vars) {
        properties[key] = {
          type: "string",
        };
      }
      return [{
        ...currentSections,
        [sectionName]: {
          default: (props) => {
            return HTMLRenderer({ html: compiled(props) });
          },
        } as SectionModule,
      }, {
        ...currentSourceMap,
        [sectionName]: () => {
          return Promise.resolve({
            functionRef: sectionName,
            inputSchema: {
              file: import.meta.url,
              name: crypto.randomUUID(),
              type: "inline",
              value: {
                type: "object",
                properties,
              },
            },
          } as BlockModuleRef);
        },
      }];
    },
    [{}, {}] as [Record<string, SectionModule>, SourceMap],
  );
  return { manifest: { ...manifest, sections } as Manifest, state, sourceMap };
}

export type AppContext = AC<ReturnType<typeof App>>;
