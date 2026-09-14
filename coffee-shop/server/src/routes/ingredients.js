import { Router } from "express";
import { db } from "../db.js";
import { requireAuth, requireRole } from "../auth/middleware.js";

const router = Router();
// Quản lý kho nguyên liệu: Admin, Quản lý, và Nhân viên kho (đúng UC35-39)
router.use(requireAuth, requireRole("admin", "manager", "warehouse"));

router.post("/:id/nhap-kho", (req, res) => {
  const { qty } = req.body;
  const ing = db.prepare("SELECT * FROM ingredients WHERE id = ?").get(req.params.id);
  if (!ing) return res.status(404).json({ error: "Không tìm thấy nguyên liệu" });
  if (!qty || Number(qty) <= 0) return res.status(400).json({ error: "Số lượng nhập không hợp lệ" });

  const newStock = +(ing.stock + Number(qty)).toFixed(2);
  db.prepare("UPDATE ingredients SET stock = ? WHERE id = ?").run(newStock, ing.id);
  res.json({ ok: true, stock: newStock });
});

// Xuất kho thủ công (hao hụt, huỷ hàng...) — UC37
router.post("/:id/xuat-kho", (req, res) => {
  const { qty } = req.body;
  const ing = db.prepare("SELECT * FROM ingredients WHERE id = ?").get(req.params.id);
  if (!ing) return res.status(404).json({ error: "Không tìm thấy nguyên liệu" });
  if (!qty || Number(qty) <= 0) return res.status(400).json({ error: "Số lượng xuất không hợp lệ" });

  const newStock = Math.max(0, +(ing.stock - Number(qty)).toFixed(2));
  db.prepare("UPDATE ingredients SET stock = ? WHERE id = ?").run(newStock, ing.id);
  res.json({ ok: true, stock: newStock });
});

export default router;
