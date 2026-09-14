import { db } from "./db.js";

export function getFullState() {
  const categories = db.prepare("SELECT id, name FROM categories").all();

  const menu = db
    .prepare("SELECT id, name, category_id AS catId, price, status, image, description FROM menu_items")
    .all();

  const ingredients = db
    .prepare("SELECT id, name, unit, stock, min_stock AS min FROM ingredients")
    .all();

  const tables = db.prepare("SELECT id, name, area, status FROM dining_tables").all();

  const staff = db
    .prepare("SELECT id, name, role, role_key AS roleKey, phone, active FROM staff")
    .all()
    .map((s) => ({ ...s, active: !!s.active }));

  const customers = db.prepare("SELECT id, name, phone, points FROM customers").all();

  const promos = db
    .prepare("SELECT id, name, percent, min_total AS min FROM promos WHERE active = 1")
    .all();

  // Danh sách ĐẦY ĐỦ (kể cả khuyến mãi đang tắt) — chỉ dùng cho màn hình quản trị
  // khuyến mãi (Admin/Quản lý). Thu ngân vẫn dùng "promos" ở trên (chỉ active).
  const promosAll = db
    .prepare("SELECT id, name, percent, min_total AS min, active FROM promos ORDER BY rowid")
    .all()
    .map((p) => ({ ...p, active: !!p.active }));

  const openOrders = db
    .prepare("SELECT id, table_id AS tableId, status, created_at AS createdAt FROM orders WHERE status = 'open'")
    .all();

  const itemStmt = db.prepare(
    "SELECT id, menu_item_id AS menuId, qty, status, note FROM order_items WHERE order_id = ?"
  );
  const orders = openOrders.map((o) => ({ ...o, items: itemStmt.all(o.id) }));

  const invoices = db
    .prepare(
      "SELECT id, order_id AS orderId, table_name AS tableName, subtotal, discount, total, method, customer_id AS customerId, created_at AS createdAt FROM invoices"
    )
    .all();
  const invItemStmt = db.prepare("SELECT menu_item_id AS menuId, qty FROM invoice_items WHERE invoice_id = ?");
  invoices.forEach((inv) => (inv.items = invItemStmt.all(inv.id)));

  const todayRevenue = invoices.reduce((s, i) => s + i.total, 0);

  const revenueByCategoryMap = {};
  categories.forEach((c) => (revenueByCategoryMap[c.id] = 0));
  invoices.forEach((inv) =>
    inv.items.forEach((it) => {
      const m = menu.find((mm) => mm.id === it.menuId);
      if (m) revenueByCategoryMap[m.catId] = (revenueByCategoryMap[m.catId] || 0) + it.qty * m.price;
    })
  );
  const revenueByCategory = categories.map((c) => ({ name: c.name, revenue: revenueByCategoryMap[c.id] || 0 }));

  const qtyMap = {};
  invoices.forEach((inv) =>
    inv.items.forEach((it) => {
      qtyMap[it.menuId] = (qtyMap[it.menuId] || 0) + it.qty;
    })
  );
  const topSellers = Object.entries(qtyMap)
    .map(([menuId, qty]) => ({ menuId, qty, name: menu.find((m) => m.id === menuId)?.name || "?" }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const lowStock = ingredients.filter((i) => i.stock <= i.min);

  return {
    categories, menu, ingredients, tables, staff, customers, promos, promosAll, orders, invoices,
    dashboard: { todayRevenue, revenueByCategory, topSellers, lowStock },
  };
}
