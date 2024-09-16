import {
  sqliteTable,
  text,
} from "https://esm.sh/drizzle-orm@0.30.10/sqlite-core";

export const reactions = sqliteTable("reactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  postSlug: text("postSlug").notNull(),
  person: text("person", { mode: "json" }),
  datePublished: (text("datePublished")).notNull(),
  dateModified: (text("dateModified")).notNull(),
  action: (text("action")).notNull(),
});
