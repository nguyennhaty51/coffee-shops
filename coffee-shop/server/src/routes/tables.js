import { Router } from "express";
import { randomUUID } from "crypto";
import QRCode from "qrcode";
import { db } from "../db.js";
import { requireAuth, requireRole } from "../auth/middleware.js";

const router = Router();
// Mở bàn / xem bàn: Admin, Quản lý, Phục vụ (người trực tiếp tiếp khách)
router.use(requireAuth, requireRole("admin", "manager", "staff"));

router.post("/:id/open", (req, res) => {
  const table = db.prepare("SELECT * FROM dining_tables WHERE id = ?").get(req.params.id);
  if (!table) return res.status(404).json({ error: "Không tìm thấy bàn" });

  if (table.status === "empty") {
    const orderId = randomUUID();
    db.prepare("INSERT INTO orders (id, table_id, status) VALUES (?, ?, 'open')").run(orderId, table.id);
    db.prepare("UPDATE dining_tables SET status = 'serving' WHERE id = ?").run(table.id);
    return res.json({ orderId });
  }
  const existing = db.prepare("SELECT id FROM orders WHERE table_id = ? AND status = 'open'").get(table.id);
  res.json({ orderId: existing?.id ?? null });
});

// Sinh mã QR đặt món cho bàn — chỉ Admin/Quản lý (việc thiết lập, không phải vận hành hằng ngày)
router.get("/:id/order-qr", requireRole("admin", "manager"), async (req, res) => {
  const table = db.prepare("SELECT * FROM dining_tables WHERE id = ?").get(req.params.id);
  if (!table) return res.status(404).json({ error: "Không tìm thấy bàn" });

  const publicUrl = process.env.PUBLIC_APP_URL || "http://localhost:5173";
  const url = `${publicUrl}/?table=${table.id}`;

  try {
    const qrDataUrl = await QRCode.toDataURL(url, { margin: 1, width: 260, color: { dark: "#292524" } });
    res.json({ url, qrDataUrl, tableName: table.name });
  } catch (e) {
    res.status(500).json({ error: "Không tạo được mã QR" });
  }
});

export default router;
