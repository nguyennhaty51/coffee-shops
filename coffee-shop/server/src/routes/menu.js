import { Router } from "express";
import { randomUUID } from "crypto";
import { db } from "../db.js";
import { requireAuth, requireRole } from "../auth/middleware.js";

const router = Router();
router.use(requireAuth, requireRole("admin", "manager"));

router.post("/", (req, res) => {
  const { name, price, catId, description } = req.body;
  if (!name || !price || !catId) return res.status(400).json({ error: "Thiếu thông tin món" });

  const id = randomUUID();
  db.prepare("INSERT INTO menu_items (id, name, category_id, price, status, description) VALUES (?, ?, ?, ?, 'available', ?)").run(
    id, name, catId, Math.round(Number(price)), description || ""
  );
  res.json({ ok: true, id });
});

router.patch("/:id/toggle", (req, res) => {
  const item = db.prepare("SELECT * FROM menu_items WHERE id = ?").get(req.params.id);
  if (!item) return res.status(404).json({ error: "Không tìm thấy món" });
  const newStatus = item.status === "available" ? "out" : "available";
  db.prepare("UPDATE menu_items SET status = ? WHERE id = ?").run(newStatus, item.id);
  res.json({ ok: true, status: newStatus });
});

router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM recipes WHERE menu_item_id = ?").run(req.params.id);
  db.prepare("DELETE FROM menu_items WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

export default router;
