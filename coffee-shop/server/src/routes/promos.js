import { Router } from "express";
import { randomUUID } from "crypto";
import { db } from "../db.js";
import { requireAuth, requireRole } from "../auth/middleware.js";

const router = Router();
// Quản lý khuyến mãi (UC mới, theo yêu cầu bổ sung của nhóm) — chỉ Admin và Quản lý
router.use(requireAuth, requireRole("admin", "manager"));

// GET /api/promos — trả về TẤT CẢ khuyến mãi (kể cả đang tắt) để hiển thị màn hình quản trị.
// (Màn hình Thu ngân dùng /api/state -> promos, chỉ lấy các khuyến mãi active=1)
router.get("/", (req, res) => {
  const promos = db
    .prepare("SELECT id, name, percent, min_total AS min, active FROM promos ORDER BY rowid")
    .all()
    .map((p) => ({ ...p, active: !!p.active }));
  res.json({ promos });
});

// POST /api/promos — thêm khuyến mãi mới
router.post("/", (req, res) => {
  const { name, percent, min, active } = req.body;
  if (!name || String(name).trim() === "") return res.status(400).json({ error: "Vui lòng nhập tên khuyến mãi" });

  const pct = Number(percent);
  if (Number.isNaN(pct) || pct < 0 || pct > 100) {
    return res.status(400).json({ error: "Phần trăm giảm giá phải là số từ 0 đến 100" });
  }
  const minTotal = Math.max(0, Math.round(Number(min) || 0));

  const id = randomUUID();
  db.prepare("INSERT INTO promos (id, name, percent, min_total, active) VALUES (?, ?, ?, ?, ?)").run(
    id, String(name).trim(), pct, minTotal, active === false ? 0 : 1
  );
  res.json({ ok: true, id });
});

// PATCH /api/promos/:id — chỉnh sửa khuyến mãi
router.patch("/:id", (req, res) => {
  const promo = db.prepare("SELECT * FROM promos WHERE id = ?").get(req.params.id);
  if (!promo) return res.status(404).json({ error: "Không tìm thấy khuyến mãi" });

  const name = req.body.name !== undefined ? String(req.body.name).trim() : promo.name;
  if (!name) return res.status(400).json({ error: "Vui lòng nhập tên khuyến mãi" });

  let pct = promo.percent;
  if (req.body.percent !== undefined) {
    pct = Number(req.body.percent);
    if (Number.isNaN(pct) || pct < 0 || pct > 100) {
      return res.status(400).json({ error: "Phần trăm giảm giá phải là số từ 0 đến 100" });
    }
  }

  const minTotal = req.body.min !== undefined ? Math.max(0, Math.round(Number(req.body.min) || 0)) : promo.min_total;
  const active = req.body.active !== undefined ? (req.body.active ? 1 : 0) : promo.active;

  db.prepare("UPDATE promos SET name = ?, percent = ?, min_total = ?, active = ? WHERE id = ?").run(
    name, pct, minTotal, active, promo.id
  );
  res.json({ ok: true });
});

// PATCH /api/promos/:id/toggle — bật/tắt nhanh (ẩn/hiện với Thu ngân mà không cần xoá)
router.patch("/:id/toggle", (req, res) => {
  const promo = db.prepare("SELECT * FROM promos WHERE id = ?").get(req.params.id);
  if (!promo) return res.status(404).json({ error: "Không tìm thấy khuyến mãi" });
  db.prepare("UPDATE promos SET active = ? WHERE id = ?").run(promo.active ? 0 : 1, promo.id);
  res.json({ ok: true });
});

// DELETE /api/promos/:id — xoá hẳn (trừ khuyến mãi mặc định "Không áp dụng")
router.delete("/:id", (req, res) => {
  if (req.params.id === "p0") {
    return res.status(400).json({ error: "Không thể xoá lựa chọn mặc định \"Không áp dụng\"" });
  }
  db.prepare("DELETE FROM promos WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

export default router;
