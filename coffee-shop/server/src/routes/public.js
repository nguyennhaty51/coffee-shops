import { Router } from "express";
import { randomUUID } from "crypto";
import { db } from "../db.js";
import { suggestFromAI } from "../ai/suggest.js";

const router = Router();

router.get("/menu", (req, res) => {
  const categories = db.prepare("SELECT id, name FROM categories").all();
  const menu = db
    .prepare("SELECT id, name, category_id AS catId, price, status, image, description FROM menu_items")
    .all();
  res.json({ categories, menu });
});

router.get("/tables/:id", (req, res) => {
  const table = db.prepare("SELECT id, name, area, status FROM dining_tables WHERE id = ?").get(req.params.id);
  if (!table) return res.status(404).json({ error: "Không tìm thấy bàn (mã QR có thể không đúng)" });
  res.json(table);
});

router.post("/tables/:id/order", (req, res) => {
  const table = db.prepare("SELECT * FROM dining_tables WHERE id = ?").get(req.params.id);
  if (!table) return res.status(404).json({ error: "Không tìm thấy bàn" });

  const items = Array.isArray(req.body.items) ? req.body.items : [];
  if (items.length === 0) return res.status(400).json({ error: "Giỏ hàng đang trống" });

  const tx = db.transaction(() => {
    let order = db.prepare("SELECT * FROM orders WHERE table_id = ? AND status = 'open'").get(table.id);
    if (!order) {
      const orderId = randomUUID();
      db.prepare("INSERT INTO orders (id, table_id, status) VALUES (?, ?, 'open')").run(orderId, table.id);
      db.prepare("UPDATE dining_tables SET status = 'serving' WHERE id = ?").run(table.id);
      order = { id: orderId };
    }

    items.forEach(({ menuId, qty }) => {
      const quantity = Math.max(1, Number(qty) || 1);
      const existing = db
        .prepare("SELECT * FROM order_items WHERE order_id = ? AND menu_item_id = ? AND status = 'moi'")
        .get(order.id, menuId);
      if (existing) {
        db.prepare("UPDATE order_items SET qty = qty + ? WHERE id = ?").run(quantity, existing.id);
      } else {
        db.prepare("INSERT INTO order_items (id, order_id, menu_item_id, qty, status) VALUES (?, ?, ?, ?, 'moi')").run(
          randomUUID(), order.id, menuId, quantity
        );
      }
    });

    return order.id;
  });

  const orderId = tx();
  res.json({ ok: true, orderId });
});

router.post("/loyalty-lookup", (req, res) => {
  const { phone } = req.body;
  const customer = db.prepare("SELECT name, points FROM customers WHERE phone = ?").get(phone);
  if (!customer) return res.status(404).json({ error: "Không tìm thấy tài khoản thành viên với SĐT này" });
  res.json(customer);
});

router.post("/ai-suggest", async (req, res) => {
  const { message, imageBase64, mimeType } = req.body;
  if (!message && !imageBase64) return res.status(400).json({ error: "Thiếu nội dung để tư vấn" });

  const menu = db.prepare("SELECT name, price, description FROM menu_items WHERE status = 'available'").all();

  try {
    const result = await suggestFromAI({ message, imageBase64, mimeType, menu });
    res.json(result);
  } catch (e) {
    console.error("AI suggest error:", e.message);
    res.status(500).json({ error: "Trợ lý AI đang gặp sự cố, thử lại sau nhé." });
  }
});

export default router;
