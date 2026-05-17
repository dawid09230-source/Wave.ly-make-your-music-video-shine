import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const videosTable = pgTable("videos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  title: text("title").notNull(),
  songName: text("song_name").notNull(),
  songArtist: text("song_artist").notNull(),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  likeCount: integer("like_count").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
  shareCount: integer("share_count").notNull().default(0),
  viewCount: integer("view_count").notNull().default(0),
  hashtags: text("hashtags").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const likesTable = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  videoId: integer("video_id").notNull().references(() => videosTable.id),
});

export const insertVideoSchema = createInsertSchema(videosTable).omit({ id: true, createdAt: true });
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videosTable.$inferSelect;
