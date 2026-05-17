import { Router } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

async function ensureTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      from_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(20) NOT NULL DEFAULT 'like',
      message TEXT NOT NULL,
      read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

ensureTable().catch(() => {});

router.get("/notifications", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    await ensureTable();
    const rows = await db.execute(sql`
      SELECT n.id, n.type, n.message, n.read, n.created_at,
             u.id as from_id, u.username as from_username, u.avatar_url as from_avatar
      FROM notifications n
      JOIN users u ON u.id = n.from_user_id
      WHERE n.user_id = ${userId}
      ORDER BY n.created_at DESC
      LIMIT 50
    `);
    const notifs = (rows.rows as any[]).map(r => ({
      id: r.id,
      type: r.type,
      message: r.message,
      read: r.read,
      createdAt: r.created_at,
      fromUser: { id: r.from_id, username: r.from_username, avatarUrl: r.from_avatar },
    }));
    res.json(notifs);
  } catch {
    res.json([]);
  }
});

router.post("/notifications/create", async (req, res) => {
  const { userId, fromUserId, type, message } = req.body;
  if (!userId || !fromUserId || userId === fromUserId) { res.status(204).end(); return; }
  try {
    await ensureTable();
    await db.execute(sql`
      INSERT INTO notifications (user_id, from_user_id, type, message)
      VALUES (${userId}, ${fromUserId}, ${type}, ${message})
    `);
    res.status(201).json({ ok: true });
  } catch {
    res.status(204).end();
  }
});

router.patch("/notifications/mark-read", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    await db.execute(sql`UPDATE notifications SET read = TRUE WHERE user_id = ${userId}`);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed" });
  }
});

export default router;
