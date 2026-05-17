import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, followsTable } from "@workspace/db";
import { eq, like, sql } from "drizzle-orm";
import { ListUsersQueryParams, GetUserParams, FollowUserParams } from "@workspace/api-zod";

const router = Router();

async function getCurrentUserId(req: any): Promise<number> {
  return (req.session as any)?.userId ?? 1;
}

async function formatUser(user: typeof usersTable.$inferSelect, currentUserId = 1) {
  const following = await db.select().from(followsTable)
    .where(eq(followsTable.followerId, currentUserId))
    .limit(100);
  const isFollowing = following.some(f => f.followingId === user.id);
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl ?? null,
    bio: user.bio ?? null,
    followerCount: user.followerCount,
    followingCount: user.followingCount,
    likeCount: user.likeCount,
    videoCount: user.videoCount,
    isFollowing,
  };
}

router.get("/users", async (req, res) => {
  const parsed = ListUsersQueryParams.safeParse(req.query);
  const search = parsed.success ? parsed.data.search : undefined;
  const users = search
    ? await db.select().from(usersTable).where(like(usersTable.username, `%${search}%`)).limit(20)
    : await db.select().from(usersTable).limit(50);
  const currentUserId = await getCurrentUserId(req);
  const formatted = await Promise.all(users.map(u => formatUser(u, currentUserId)));
  res.json(formatted);
});

router.get("/users/leaderboard", async (req, res) => {
  const users = await db.select().from(usersTable)
    .orderBy(sql`like_count DESC`)
    .limit(50);
  const currentUserId = await getCurrentUserId(req);
  const formatted = await Promise.all(users.map(u => formatUser(u, currentUserId)));
  res.json(formatted);
});

router.get("/users/:id", async (req, res) => {
  const parsed = GetUserParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, parsed.data.id)).limit(1);
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  const currentUserId = await getCurrentUserId(req);
  res.json(await formatUser(user, currentUserId));
});

router.patch("/users/:id", async (req, res) => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid id" }); return; }
  const currentUserId = await getCurrentUserId(req);
  if (currentUserId !== userId) { res.status(403).json({ error: "Forbidden" }); return; }

  const { displayName, bio, avatarUrl } = req.body;
  const updates: Record<string, any> = {};
  if (displayName !== undefined) updates.displayName = String(displayName).slice(0, 50);
  if (bio !== undefined) updates.bio = String(bio).slice(0, 200);
  if (avatarUrl !== undefined) updates.avatarUrl = String(avatarUrl).slice(0, 500);

  if (Object.keys(updates).length === 0) { res.status(400).json({ error: "No fields to update" }); return; }

  await db.update(usersTable).set(updates).where(eq(usersTable.id, userId));
  const [updated] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  res.json(await formatUser(updated, currentUserId));
});

router.post("/users/:id/follow", async (req, res) => {
  const parsed = FollowUserParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const targetId = parsed.data.id;
  const currentUserId = await getCurrentUserId(req);

  const [target] = await db.select().from(usersTable).where(eq(usersTable.id, targetId)).limit(1);
  if (!target) { res.status(404).json({ error: "Not found" }); return; }

  const existing = await db.select().from(followsTable)
    .where(eq(followsTable.followerId, currentUserId))
    .limit(100);
  const alreadyFollowing = existing.some(f => f.followingId === targetId);

  if (alreadyFollowing) {
    await db.delete(followsTable).where(
      sql`follower_id = ${currentUserId} AND following_id = ${targetId}`
    );
    await db.update(usersTable).set({ followerCount: sql`follower_count - 1` }).where(eq(usersTable.id, targetId));
    await db.update(usersTable).set({ followingCount: sql`following_count - 1` }).where(eq(usersTable.id, currentUserId));
  } else {
    await db.insert(followsTable).values({ followerId: currentUserId, followingId: targetId });
    await db.update(usersTable).set({ followerCount: sql`follower_count + 1` }).where(eq(usersTable.id, targetId));
    await db.update(usersTable).set({ followingCount: sql`following_count + 1` }).where(eq(usersTable.id, currentUserId));

    try {
      const [fromUser] = await db.select().from(usersTable).where(eq(usersTable.id, currentUserId)).limit(1);
      await db.execute(sql`
        INSERT INTO notifications (user_id, from_user_id, type, message)
        SELECT ${targetId}, ${currentUserId}, 'follow', ${"started following you"}
        WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications')
      `);
    } catch {}
  }

  const [updated] = await db.select().from(usersTable).where(eq(usersTable.id, targetId)).limit(1);
  res.json(await formatUser(updated, currentUserId));
});

export default router;
