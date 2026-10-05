import { assertEquals } from "@std/assert";
import { sanitizeHref, sanitizeHtml } from "../utils/sanitizeHtml.ts";
import { hardSanitize } from "../utils/hardSanitize.ts";

/**
 * Both sanitizers are pragmatic denylists over CMS-authored HTML, so the
 * interesting cases are the ones an attacker reaches for: a scheme hidden
 * behind entities, control characters or missing quotes. They share one
 * URL-scheme pass, so every vector below is asserted against both.
 */
const sanitizers: [string, (raw: string) => string][] = [
  ["sanitizeHtml", sanitizeHtml],
  ["hardSanitize", hardSanitize],
];

const neutralized = [
  ["unquoted", `<a href=javascript:alert(1)>x</a>`, `<a href="#">x</a>`],
  ["double-quoted", `<a href="javascript:alert(1)">x</a>`, `<a href="#">x</a>`],
  ["single-quoted", `<a href='javascript:alert(1)'>x</a>`, `<a href='#'>x</a>`],
  ["uppercase", `<a href="JaVaScRiPt:alert(1)">x</a>`, `<a href="#">x</a>`],
  [
    "tab inside scheme",
    `<a href="java\tscript:alert(1)">x</a>`,
    `<a href="#">x</a>`,
  ],
  [
    "hex entity",
    `<a href="&#x6a;avascript:alert(1)">x</a>`,
    `<a href="#">x</a>`,
  ],
  [
    "decimal entity",
    `<a href="&#106;avascript:alert(1)">x</a>`,
    `<a href="#">x</a>`,
  ],
  [
    "&colon; entity",
    `<a href="javascript&colon;alert(1)">x</a>`,
    `<a href="#">x</a>`,
  ],
  ["data: uri", `<img src="data:text/html;base64,PHN2Zz4=">`, `<img src="#">`],
  ["vbscript:", `<a href="vbscript:msgbox(1)">x</a>`, `<a href="#">x</a>`],
  [
    "formaction",
    `<button formaction=javascript:alert(1)>x</button>`,
    `<button formaction="#">x</button>`,
  ],
  [
    "xlink:href",
    `<use xlink:href="javascript:alert(1)" />`,
    `<use xlink:href="#" />`,
  ],
];

for (const [name, sanitize] of sanitizers) {
  for (const [vector, input, expected] of neutralized) {
    Deno.test(`${name} neutralizes ${vector}`, () => {
      assertEquals(sanitize(input), expected);
    });
  }

  Deno.test(`${name} strips inline event handlers`, () => {
    assertEquals(sanitize(`<img src=x onerror=alert(1)>`), `<img src=x>`);
    assertEquals(
      sanitize(`<div onclick="alert(1)">x</div>`),
      `<div>x</div>`,
    );
  });

  Deno.test(`${name} drops script and style blocks`, () => {
    assertEquals(sanitize(`a<script>alert(1)</script>b`), "ab");
    assertEquals(sanitize(`a<style>*{display:none}</style>b`), "ab");
  });

  Deno.test(`${name} keeps safe markup intact`, () => {
    const safe = [
      `<a href="https://deco.cx">deco</a>`,
      `<a href="/blog">relative</a>`,
      `<a href="mailto:hi@deco.cx">mail</a>`,
      `<p>text with <strong>bold</strong> and <em>italic</em></p>`,
      // `data-*` is not a url-bearing attribute, and `javascriptX:` is not a scheme.
      `<a data-href="javascript:history.back()" data-src="x">x</a>`,
      `<a href="javascriptX:not-a-scheme">x</a>`,
    ];
    for (const html of safe) assertEquals(sanitize(html), html);
  });

  Deno.test(`${name} leaves escaped code samples alone`, () => {
    // Prose that merely mentions the vector must survive: rewriting it here ate
    // the escaped closing bracket, since `&gt;` holds no literal ">".
    const sample =
      `<code>&lt;a href=javascript:alert(1)&gt;link&lt;/a&gt;</code>`;
    assertEquals(sanitize(sample), sample);
    assertEquals(
      sanitize(`<p>write href=javascript:alert(1) to break it</p>`),
      `<p>write href=javascript:alert(1) to break it</p>`,
    );
  });

  Deno.test(`${name} returns "" for empty and non-string input`, () => {
    assertEquals(sanitize(undefined as unknown as string), "");
    assertEquals(sanitize(null as unknown as string), "");
    assertEquals(sanitize(42 as unknown as string), "");
    assertEquals(sanitize({} as unknown as string), "");
  });
}

Deno.test("hardSanitize removes dangerous elements with their content", () => {
  assertEquals(hardSanitize(`a<iframe src="//evil">x</iframe>b`), "ab");
  assertEquals(hardSanitize(`a<svg><circle /></svg>b`), "ab");
  // A stray tag with no matching close still goes, content and all.
  assertEquals(hardSanitize(`a<embed src="//evil">b`), "ab");
  assertEquals(hardSanitize(`<div srcdoc="<script>">x</div>`), `<div>x</div>`);
});

Deno.test("sanitizeHref allows only navigable schemes", () => {
  assertEquals(sanitizeHref("https://deco.cx"), "https://deco.cx");
  assertEquals(sanitizeHref("/blog"), "/blog");
  assertEquals(sanitizeHref("#anchor"), "#anchor");
  assertEquals(sanitizeHref("mailto:hi@deco.cx"), "mailto:hi@deco.cx");
  assertEquals(sanitizeHref("tel:+5511999999999"), "tel:+5511999999999");
  assertEquals(sanitizeHref("javascript:alert(1)"), "#");
  assertEquals(sanitizeHref("data:text/html,<script>"), "#");
  assertEquals(sanitizeHref(undefined), "#");
  assertEquals(sanitizeHref(42 as unknown as string), "#");
});
