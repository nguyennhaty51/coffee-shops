import { Router } from "express";
import { randomUUID } from "crypto";
import QRCode from "qrcode";
import { db } from "../db.js";
import { requireAuth, requireRole } from "../auth/middleware.js";

const router = Router();
router.use(requireAuth);

// Tạo/sửa order gắn với việc gọi món tại bàn — vai trò Phục vụ (đúng UC22-25)
const ORDER_ROLES = ["admin", "manager", "staff"];
// Chế biến — vai trò Pha chế (UC26-28)
const KITCHEN_ROLES = ["admin", "manager", "barista"];
// Thanh toán, hoá đơn — vai trò Thu ngân (UC29-34)
const PAYMENT_ROLES = ["admin", "manager", "cashier"];

router.post("/:orderId/items", requireRole(...ORDER_ROLES), (req, res) => {
  const { orderId } = req.params;
  const { menuId } = req.body;
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
  if (!order) return res.status(404).json({ error: "Không tìm thấy order" });

  const existing = db
    .prepare("SELECT * FROM order_items WHERE order_id = ? AND menu_item_id = ? AND status = 'moi'")
    .get(orderId, menuId);

  if (existing) {
    db.prepare("UPDATE order_items SET qty = qty + 1 WHERE id = ?").run(existing.id);
  } else {
    db.prepare("INSERT INTO order_items (id, order_id, menu_item_id, qty, status) VALUES (?, ?, ?, 1, 'moi')").run(
      randomUUID(), orderId, menuId
    );
  }
  res.json({ ok: true });
});

router.patch("/:orderId/items/:itemId", requireRole(...ORDER_ROLES), (req, res) => {
  const { itemId } = req.params;
  const { delta } = req.body;
  const item = db.prepare("SELECT * FROM order_items WHERE id = ?").get(itemId);
  if (!item) return res.status(404).json({ error: "Không tìm thấy món trong order" });

  const newQty = item.qty + Number(delta);
  if (newQty <= 0) db.prepare("DELETE FROM order_items WHERE id = ?").run(itemId);
  else db.prepare("UPDATE order_items SET qty = ? WHERE id = ?").run(newQty, itemId);
  res.json({ ok: true });
});

router.post("/:orderId/send-kitchen", requireRole(...ORDER_ROLES), (req, res) => {
  const { orderId } = req.params;
  db.prepare("UPDATE order_items SET status = 'cho_pha_che' WHERE order_id = ? AND status = 'moi'").run(orderId);
  res.json({ ok: true });
});

router.post("/:orderId/items/:itemId/ready", requireRole(...KITCHEN_ROLES), (req, res) => {
  const { itemId } = req.params;
  const item = db.prepare("SELECT * FROM order_items WHERE id = ?").get(itemId);
  if (!item) return res.status(404).json({ error: "Không tìm thấy món" });

  const recipe = db.prepare("SELECT ingredient_id AS ingredientId, qty FROM recipes WHERE menu_item_id = ?").all(item.menu_item_id);
  let insufficient = false;
  const updateStock = db.prepare("UPDATE ingredients SET stock = ? WHERE id = ?");
  const getIng = db.prepare("SELECT * FROM ingredients WHERE id = ?");

  const tx = db.transaction(() => {
    recipe.forEach((r) => {
      const ing = getIng.get(r.ingredientId);
      if (!ing) return;
      const newStock = ing.stock - r.qty * item.qty;
      if (newStock < 0) insufficient = true;
      updateStock.run(Math.max(0, +newStock.toFixed(2)), ing.id);
    });
    db.prepare("UPDATE order_items SET status = 'san_sang' WHERE id = ?").run(itemId);
  });
  tx();

  res.json({ ok: true, insufficient });
});

// GET /api/orders/:orderId/payment-qr?promoId=...
router.get("/:orderId/payment-qr", requireRole(...PAYMENT_ROLES), async (req, res) => {
  const { orderId } = req.params;
  const { promoId } = req.query;

  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
  if (!order) return res.status(404).json({ error: "Không tìm thấy order" });

  const table = db.prepare("SELECT * FROM dining_tables WHERE id = ?").get(order.table_id);
  const items = db
    .prepare(`SELECT oi.qty, mi.price FROM order_items oi JOIN menu_items mi ON mi.id = oi.menu_item_id WHERE oi.order_id = ?`)
    .all(orderId);

  const subtotal = items.reduce((s, it) => s + it.qty * it.price, 0);
  const promo = promoId ? db.prepare("SELECT * FROM promos WHERE id = ?").get(promoId) : null;
  const discount = promo ? subtotal * (promo.percent / 100) : 0;
  const total = Math.max(0, Math.round(subtotal - discount));

  const shortCode = orderId.slice(0, 8).toUpperCase();
  const content = [
    "NGAN HANG: MB BANK",
    "SO TAI KHOAN: 0123456789",
    "CHU TAI KHOAN: QUAN CA PHE AN",
    `SO TIEN: ${total} VND`,
    `NOI DUNG: CF${shortCode} BAN ${table?.name ?? ""}`,
  ].join("\n");

  try {
    const qrDataUrl = await QRCode.toDataURL(content, { margin: 1, width: 260, color: { dark: "#292524" } });
    res.json({ qrDataUrl, amount: total, content });
  } catch (e) {
    res.status(500).json({ error: "Không tạo được mã QR" });
  }
});

router.post("/:orderId/checkout", requireRole(...PAYMENT_ROLES), (req, res) => {
  const { orderId } = req.params;
  const { promoId, customerPhone, method } = req.body;

  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
  if (!order) return res.status(404).json({ error: "Không tìm thấy order" });

  const table = db.prepare("SELECT * FROM dining_tables WHERE id = ?").get(order.table_id);
  const items = db
    .prepare(`SELECT oi.id, oi.menu_item_id AS menuId, oi.qty, mi.price FROM order_items oi JOIN menu_items mi ON mi.id = oi.menu_item_id WHERE oi.order_id = ?`)
    .all(orderId);

  const subtotal = items.reduce((s, it) => s + it.qty * it.price, 0);
  const promo = promoId ? db.prepare("SELECT * FROM promos WHERE id = ?").get(promoId) : null;
  const discount = promo ? subtotal * (promo.percent / 100) : 0;
  const total = Math.max(0, subtotal - discount);

  const customer = customerPhone ? db.prepare("SELECT * FROM customers WHERE phone = ?").get(customerPhone) : null;
  const invoiceId = randomUUID();
  let pointsEarned = 0;

  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO invoices (id, order_id, table_name, subtotal, discount, total, method, customer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(invoiceId, orderId, table?.name ?? "", Math.round(subtotal), Math.round(discount), Math.round(total), method, customer?.id ?? null);

    const insItem = db.prepare("INSERT INTO invoice_items (id, invoice_id, menu_item_id, qty) VALUES (?, ?, ?, ?)");
    items.forEach((it) => insItem.run(randomUUID(), invoiceId, it.menuId, it.qty));

    db.prepare("UPDATE orders SET status = 'paid' WHERE id = ?").run(orderId);
    db.prepare("UPDATE dining_tables SET status = 'empty' WHERE id = ?").run(order.table_id);

    if (customer) {
      pointsEarned = Math.floor(total / 10000);
      db.prepare("UPDATE customers SET points = points + ? WHERE id = ?").run(pointsEarned, customer.id);
    }
  });
  tx();

  res.json({ ok: true, invoiceId, total: Math.round(total), pointsEarned });
});

export default router;
