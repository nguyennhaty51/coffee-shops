import { Router } from "express";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { db } from "../db.js";
import { requireAuth, requireRole } from "../auth/middleware.js";

const router = Router();
router.use(requireAuth);

const ROLE_KEY_BY_LABEL = {
  "Quản trị viên": "admin",
  "Quản lý": "manager",
  "Nhân viên phục vụ": "staff",
  "Nhân viên thu ngân": "cashier",
  "Nhân viên pha chế": "barista",
  "Nhân viên kho": "warehouse",
};

function slugifyUsername(name) {
  const noAccent = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return noAccent || "nv";
}

// Thêm nhân viên (UC10) — Admin và Quản lý đều được phép
router.post("/", requireRole("admin", "manager"), (req, res) => {
  const { name, role, phone } = req.body;
  if (!name || !role) return res.status(400).json({ error: "Thiếu thông tin nhân viên" });

  const id = randomUUID();
  const roleKey = ROLE_KEY_BY_LABEL[role] || "staff";

  let username = slugifyUsername(name);
  let suffix = 0;
  while (db.prepare("SELECT id FROM staff WHERE username = ?").get(suffix ? `${username}${suffix}` : username)) {
    suffix += 1;
  }
  if (suffix) username = `${username}${suffix}`;

  const defaultPassword = "123456";
  const passwordHash = bcrypt.hashSync(defaultPassword, 10);

  db.prepare(
    "INSERT INTO staff (id, name, role, role_key, username, password_hash, phone, active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)"
  ).run(id, name, role, roleKey, username, passwordHash, phone ?? "");

  res.json({ ok: true, id, username, defaultPassword });
});

// Khoá/Mở khoá tài khoản (UC08) — chỉ Admin (Quản trị viên) theo đúng phân quyền trong báo cáo
router.patch("/:id/toggle", requireRole("admin"), (req, res) => {
  const s = db.prepare("SELECT * FROM staff WHERE id = ?").get(req.params.id);
  if (!s) return res.status(404).json({ error: "Không tìm thấy nhân viên" });
  db.prepare("UPDATE staff SET active = ? WHERE id = ?").run(s.active ? 0 : 1, s.id);
  res.json({ ok: true });
});

export default router;
