import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { videosTable } from "./videos";

export const commentsTable = pgTable("comments", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull().references(() => videosTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  text: text("text").notNull(),
  likeCount: integer("like_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCommentSchema = createInsertSchema(commentsTable).omit({ id: true, createdAt: true });
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof commentsTable.$inferSelect;
