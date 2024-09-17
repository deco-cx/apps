import {
  integer,
  sqliteTable,
  text,
} from "https://esm.sh/drizzle-orm@0.30.10/sqlite-core";
import { ArticleComment, Reaction } from "../types.ts";

export const reactions = sqliteTable("reactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  postSlug: text("postSlug").notNull(),
  person: text("person", { mode: "json" }),
  datePublished: (text("datePublished")).notNull(),
  dateModified: (text("dateModified")).notNull(),
  action: (text("action")).notNull(),
});

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  postSlug: text("postSlug").notNull(),
  person: text("person", { mode: "json" }),
  datePublished: (text("datePublished")).notNull(),
  dateModified: (text("dateModified")).notNull(),
  comment: (text("comment")).notNull(),
  removed: integer("removed", { mode: "boolean" }).notNull().default(false),
});

export interface ReactionSchema extends Reaction {
  id: string;
  postSlug: string;
}

export interface CommentsSchema extends ArticleComment {
  id: string;
  postSlug: string;
}
