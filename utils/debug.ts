import { fetchToCurl } from "jsr:@viktor/fetch-to-curl";
import { ensureDir } from "https://deno.land/std@0.54.0/fs/ensure_dir.ts";

const IS_ENABLED = Deno.env.get("APPS_DEBUG") === "1";

function getCounter(): number {
  let counter = 1;
  for (const _ of Deno.readDirSync("./debug")) {
    counter++;
  }
  return counter;
}

export class Debug {
  static counter = getCounter();

  static enabled() {
    return IS_ENABLED;
  }

  static saveRequestCurl(
    input: URL | RequestInfo,
    init?: RequestInit | undefined,
  ) {
    const curl = fetchToCurl(input, init);

    ensureDir("./debug")
      .then(() => {
        Deno.writeFileSync(
          `./debug/request-${this.counter}.curl`,
          new TextEncoder().encode(curl),
          {
            create: true,
          },
        );
        this.counter++;
      });
  }
}
