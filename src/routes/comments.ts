import { Router } from "express";
import { db } from "@workspace/db";
import { commentsTable, usersTable, videosTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { ListCommentsParams, CreateCommentParams, CreateCommentBody } from "@workspace/api-zod";

const router = Router();

async function formatComment(comment: typeof commentsTable.$inferSelect) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, comment.userId)).limit(1);
  return {
    id: comment.id,
    videoId: comment.videoId,
    userId: comment.userId,
    user: user ? {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl ?? null,
      bio: user.bio ?? null,
      followerCount: user.followerCount,
      followingCount: user.followingCount,
      likeCount: user.likeCount,
      videoCount: user.videoCount,
      isFollowing: false,
    } : null,
    text: comment.text,
    likeCount: comment.likeCount,
    createdAt: comment.createdAt.toISOString(),
  };
}

router.get("/videos/:id/comments", async (req, res) => {
  const parsed = ListCommentsParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const comments = await db.select().from(commentsTable)
    .where(eq(commentsTable.videoId, parsed.data.id))
    .orderBy(desc(commentsTable.createdAt))
    .limit(50);
  const formatted = await Promise.all(comments.map(formatComment));
  res.json(formatted);
});

router.post("/videos/:id/comments", async (req, res) => {
  const paramParsed = CreateCommentParams.safeParse({ id: Number(req.params.id) });
  const bodyParsed = CreateCommentBody.safeParse(req.body);
  if (!paramParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const videoId = paramParsed.data.id;
  const { userId, text } = bodyParsed.data;

  const [video] = await db.select().from(videosTable).where(eq(videosTable.id, videoId)).limit(1);
  if (!video) {
    res.status(404).json({ error: "Video not found" });
    return;
  }

  const [comment] = await db.insert(commentsTable).values({ videoId, userId, text }).returning();
  await db.update(videosTable).set({ commentCount: sql`comment_count + 1` }).where(eq(videosTable.id, videoId));
  res.status(201).json(await formatComment(comment));
});

export default router;
