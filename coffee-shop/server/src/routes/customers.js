import { Router } from "express";
import { randomUUID } from "crypto";
import { db } from "../db.js";
import { requireAuth, requireRole } from "../auth/middleware.js";

const router = Router();
router.use(requireAuth, requireRole("admin", "manager", "cashier", "staff"));

router.post("/", (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) return res.status(400).json({ error: "Thiếu thông tin khách hàng" });

  const existing = db.prepare("SELECT id FROM customers WHERE phone = ?").get(phone);
  if (existing) return res.status(409).json({ error: "Số điện thoại đã được đăng ký thành viên" });

  const id = randomUUID();
  db.prepare("INSERT INTO customers (id, name, phone, points) VALUES (?, ?, ?, 0)").run(id, name, phone);
  res.json({ ok: true, id });
});

export default router;
