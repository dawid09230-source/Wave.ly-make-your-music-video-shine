import { Router } from "express";
import { db } from "@workspace/db";
import { videosTable, usersTable, likesTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import {
  ListVideosQueryParams,
  CreateVideoBody,
  GetVideoParams,
  LikeVideoParams,
} from "@workspace/api-zod";

const router = Router();

async function getCurrentUserId(req: any): Promise<number> {
  return (req.session as any)?.userId ?? 1;
}

async function formatVideo(video: typeof videosTable.$inferSelect, currentUserId = 1) {
  const user = await db.select().from(usersTable).where(eq(usersTable.id, video.userId)).limit(1);
  const allLikes = await db.select().from(likesTable).where(eq(likesTable.videoId, video.id));
  const isLiked = allLikes.some(l => l.userId === currentUserId);
  const hashtags = video.hashtags ? video.hashtags.split(",").filter(Boolean) : [];

  return {
    id: video.id,
    userId: video.userId,
    user: user[0] ? {
      id: user[0].id,
      username: user[0].username,
      displayName: user[0].displayName,
      avatarUrl: user[0].avatarUrl ?? null,
      bio: user[0].bio ?? null,
      followerCount: user[0].followerCount,
      followingCount: user[0].followingCount,
      likeCount: user[0].likeCount,
      videoCount: user[0].videoCount,
      isFollowing: false,
    } : null,
    title: video.title,
    songName: video.songName,
    songArtist: video.songArtist,
    likeCount: video.likeCount,
    commentCount: video.commentCount,
    shareCount: video.shareCount,
    viewCount: video.viewCount,
    videoUrl: video.videoUrl,
    thumbnailUrl: video.thumbnailUrl,
    isLiked,
    hashtags,
    createdAt: video.createdAt.toISOString(),
  };
}

router.get("/videos", async (req, res) => {
  const parsed = ListVideosQueryParams.safeParse(req.query);
  const page = parsed.success ? (parsed.data.page ?? 1) : 1;
  const limit = parsed.success ? (parsed.data.limit ?? 20) : 20;
  const userId = parsed.success ? parsed.data.userId : undefined;
  const offset = (page - 1) * limit;
  const currentUserId = await getCurrentUserId(req);

  const videos = userId
    ? await db.select().from(videosTable).where(eq(videosTable.userId, userId as number)).orderBy(desc(videosTable.createdAt)).limit(limit).offset(offset)
    : await db.select().from(videosTable).orderBy(desc(videosTable.createdAt)).limit(limit).offset(offset);

  const formatted = await Promise.all(videos.map(v => formatVideo(v, currentUserId)));
  res.json(formatted);
});

router.post("/videos", async (req, res) => {
  const parsed = CreateVideoBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const data = parsed.data;
  const hashtags = Array.isArray(data.hashtags) ? data.hashtags.join(",") : "";
  const [video] = await db.insert(videosTable).values({
    userId: data.userId,
    title: data.title,
    songName: data.songName,
    songArtist: data.songArtist,
    videoUrl: data.videoUrl,
    thumbnailUrl: data.thumbnailUrl,
    hashtags,
  }).returning();
  await db.update(usersTable).set({ videoCount: sql`video_count + 1` }).where(eq(usersTable.id, data.userId));
  const currentUserId = await getCurrentUserId(req);
  res.status(201).json(await formatVideo(video, currentUserId));
});

router.get("/videos/trending", async (req, res) => {
  const currentUserId = await getCurrentUserId(req);
  const videos = await db.select().from(videosTable).orderBy(desc(videosTable.likeCount)).limit(30);
  const formatted = await Promise.all(videos.map(v => formatVideo(v, currentUserId)));
  res.json(formatted);
});

router.get("/videos/popular", async (req, res) => {
  const currentUserId = await getCurrentUserId(req);
  const videos = await db.select().from(videosTable).orderBy(desc(videosTable.viewCount), desc(videosTable.likeCount)).limit(20);
  const formatted = await Promise.all(videos.map(v => formatVideo(v, currentUserId)));
  res.json(formatted);
});

router.get("/videos/stats", async (_req, res) => {
  const [{ totalVideos }] = await db.select({ totalVideos: sql<number>`count(*)` }).from(videosTable);
  const [{ totalLikes }] = await db.select({ totalLikes: sql<number>`sum(like_count)` }).from(videosTable);
  const [{ totalUsers }] = await db.select({ totalUsers: sql<number>`count(*)` }).from(usersTable);
  const [{ totalViews }] = await db.select({ totalViews: sql<number>`sum(view_count)` }).from(videosTable);

  const allVideos = await db.select({ hashtags: videosTable.hashtags }).from(videosTable);
  const hashtagCounts: Record<string, number> = {};
  for (const v of allVideos) {
    for (const tag of v.hashtags.split(",").filter(Boolean)) {
      hashtagCounts[tag] = (hashtagCounts[tag] ?? 0) + 1;
    }
  }
  const trendingHashtags = Object.entries(hashtagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag]) => tag);

  res.json({
    totalVideos: Number(totalVideos),
    totalLikes: Number(totalLikes) || 0,
    totalUsers: Number(totalUsers),
    totalViews: Number(totalViews) || 0,
    trendingHashtags,
  });
});

router.get("/videos/:id", async (req, res) => {
  const parsed = GetVideoParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const [video] = await db.select().from(videosTable).where(eq(videosTable.id, parsed.data.id)).limit(1);
  if (!video) { res.status(404).json({ error: "Not found" }); return; }
  const currentUserId = await getCurrentUserId(req);
  res.json(await formatVideo(video, currentUserId));
});

router.post("/videos/:id/like", async (req, res) => {
  const parsed = LikeVideoParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const videoId = parsed.data.id;
  const currentUserId = await getCurrentUserId(req);

  const [video] = await db.select().from(videosTable).where(eq(videosTable.id, videoId)).limit(1);
  if (!video) { res.status(404).json({ error: "Not found" }); return; }

  const existing = await db.select().from(likesTable)
    .where(eq(likesTable.videoId, videoId));
  const alreadyLiked = existing.some(l => l.userId === currentUserId);

  if (alreadyLiked) {
    await db.delete(likesTable).where(sql`user_id = ${currentUserId} AND video_id = ${videoId}`);
    await db.update(videosTable).set({ likeCount: sql`like_count - 1` }).where(eq(videosTable.id, videoId));
    await db.update(usersTable).set({ likeCount: sql`like_count - 1` }).where(eq(usersTable.id, video.userId));
  } else {
    await db.insert(likesTable).values({ userId: currentUserId, videoId });
    await db.update(videosTable).set({ likeCount: sql`like_count + 1` }).where(eq(videosTable.id, videoId));
    await db.update(usersTable).set({ likeCount: sql`like_count + 1` }).where(eq(usersTable.id, video.userId));

    if (currentUserId !== video.userId) {
      try {
        await db.execute(sql`
          INSERT INTO notifications (user_id, from_user_id, type, message)
          SELECT ${video.userId}, ${currentUserId}, 'like', ${"liked your video"}
          WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications')
        `);
      } catch {}
    }
  }

  const [updated] = await db.select().from(videosTable).where(eq(videosTable.id, videoId)).limit(1);
  res.json(await formatVideo(updated, currentUserId));
});
// Musical.ly 5.8.7 HEATOS feed endpoints
router.post("/rest/command/sync", async (req, res) => {
  const currentUserId = await getCurrentUserId(req);
  const videos = await db.select()
    .from(videosTable)
    .orderBy(desc(videosTable.likeCount))
    .limit(20);
  const formatted = await Promise.all(videos.map(v => formatVideo(v, currentUserId)));
  const items = formatted.map(v => ({
    musicalId: v.id,
    musicalIdStr: String(v.id),
    caption: v.title ?? "",
    videoUri: v.videoUrl,
    thumbnailUri: v.thumbnailUrl,
    width: 720,
    height: 1280,
    startTime: 0,
    likedNum: v.likeCount,
    commentNum: v.commentCount,
    liked: v.isLiked,
    owned: v.userId === currentUserId,
    author: {
      userId: v.userId,
      bid: String(v.userId),
      handle: v.user?.username ?? "",
      name: v.user?.displayName ?? v.user?.username ?? "",
      nickName: v.user?.displayName ?? v.user?.username ?? "",
      icon: v.user?.avatarUrl ?? "",
      verified: false,
      isPrivateAccount: false,
    },
    track: {
      trackId: v.id,
      previewUri: "",
      song: { title: v.songName ?? "" },
      author: { name: v.songArtist ?? "" },
      album: { thumbnailUri: v.thumbnailUrl ?? "" },
    },
  }));
  res.json({
    success: true,
    statusCode: 200,
    commands: [{ type: "command_sync", bizType: "feed", cursor: "1" }],
    result: { content: items, total: items.length, HasMore: false },
    timestamp: Math.floor(Date.now() / 1000),
  });
});

router.get("/rest/command/cursor/:id", async (req, res) => {
  const currentUserId = await getCurrentUserId(req);
  const videos = await db.select()
    .from(videosTable)
    .orderBy(desc(videosTable.createdAt))
    .limit(20);
  const formatted = await Promise.all(videos.map(v => formatVideo(v, currentUserId)));
  const items = formatted.map(v => ({
    musicalId: v.id,
    musicalIdStr: String(v.id),
    caption: v.title ?? "",
    videoUri: v.videoUrl,
    thumbnailUri: v.thumbnailUrl,
    width: 720,
    height: 1280,
    startTime: 0,
    likedNum: v.likeCount,
    commentNum: v.commentCount,
    liked: v.isLiked,
    owned: v.userId === currentUserId,
    author: {
      userId: v.userId,
      bid: String(v.userId),
      handle: v.user?.username ?? "",
      name: v.user?.displayName ?? v.user?.username ?? "",
      nickName: v.user?.displayName ?? v.user?.username ?? "",
      icon: v.user?.avatarUrl ?? "",
      verified: false,
      isPrivateAccount: false,
    },
    track: {
      trackId: v.id,
      previewUri: "",
      song: { title: v.songName ?? "" },
      author: { name: v.songArtist ?? "" },
      album: { thumbnailUri: v.thumbnailUrl ?? "" },
    },
  }));
  res.json({
    success: true,
    statusCode: 200,
    result: { content: items, HasMore: false },
    timestamp: Math.floor(Date.now() / 1000),
  });
});

router.get("/rest/v2/musicals/top", async (req, res) => {
  const currentUserId = await getCurrentUserId(req);
  const videos = await db.select()
    .from(videosTable)
    .orderBy(desc(videosTable.likeCount))
    .limit(20);
  const formatted = await Promise.all(videos.map(v => formatVideo(v, currentUserId)));
  res.json({ success: true, statusCode: 200, result: { content: formatted } });
});

router.get("/rest/v2/musicals/recent", async (req, res) => {
  const currentUserId = await getCurrentUserId(req);
  const videos = await db.select()
    .from(videosTable)
    .orderBy(desc(videosTable.createdAt))
    .limit(20);
  const formatted = await Promise.all(videos.map(v => formatVideo(v, currentUserId)));
  res.json({ success: true, statusCode: 200, result: { content: formatted } });
});

export default router;
