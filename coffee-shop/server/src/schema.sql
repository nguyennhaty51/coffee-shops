-- ================================================================
-- CƠ SỞ DỮ LIỆU HỆ THỐNG QUẢN LÝ QUÁN CÀ PHÊ (SQLite)
-- Thiết kế ở mức vừa đủ cho đồ án môn học — không đi sâu tối ưu hoá.
-- Vai trò (role_key) khớp với 7 tác nhân trong báo cáo PTTKHT:
-- admin (Quản trị viên) | manager (Quản lý) | staff (Phục vụ) |
-- cashier (Thu ngân) | barista (Pha chế) | warehouse (Nhân viên kho)
-- Khách hàng (Customer) không có tài khoản — dùng trang QR công khai.
-- ================================================================

CREATE TABLE IF NOT EXISTS categories (
  id   TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS menu_items (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id),
  price       INTEGER NOT NULL,
  status      TEXT NOT NULL DEFAULT 'available',  -- 'available' | 'out'
  image       TEXT,                                -- tên file ảnh trong /public/images/menu
  description TEXT                                  -- mô tả ngắn hiển thị ở trang đặt món QR
);

CREATE TABLE IF NOT EXISTS ingredients (
  id        TEXT PRIMARY KEY,
  name      TEXT NOT NULL,
  unit      TEXT NOT NULL,
  stock     REAL NOT NULL DEFAULT 0,
  min_stock REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS recipes (
  menu_item_id  TEXT NOT NULL REFERENCES menu_items(id),
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id),
  qty           REAL NOT NULL,
  PRIMARY KEY (menu_item_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS dining_tables (
  id     TEXT PRIMARY KEY,
  name   TEXT NOT NULL,
  area   TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'empty'             -- 'empty' | 'serving' | 'reserved'
);

CREATE TABLE IF NOT EXISTS staff (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL,          -- nhãn hiển thị (VD: "Thu ngân")
  role_key      TEXT NOT NULL,          -- admin | manager | staff | cashier | barista | warehouse
  username      TEXT UNIQUE,
  password_hash TEXT,
  phone         TEXT,
  active        INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS customers (
  id     TEXT PRIMARY KEY,
  name   TEXT NOT NULL,
  phone  TEXT UNIQUE,
  points INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS promos (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  percent    REAL NOT NULL DEFAULT 0,
  min_total  INTEGER NOT NULL DEFAULT 0,
  active     INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
  id         TEXT PRIMARY KEY,
  table_id   TEXT NOT NULL REFERENCES dining_tables(id),
  status     TEXT NOT NULL DEFAULT 'open',         -- 'open' | 'paid'
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id            TEXT PRIMARY KEY,
  order_id      TEXT NOT NULL REFERENCES orders(id),
  menu_item_id  TEXT NOT NULL REFERENCES menu_items(id),
  qty           INTEGER NOT NULL DEFAULT 1,
  note          TEXT,
  status        TEXT NOT NULL DEFAULT 'moi'        -- 'moi' | 'cho_pha_che' | 'san_sang'
);

CREATE TABLE IF NOT EXISTS invoices (
  id           TEXT PRIMARY KEY,
  order_id     TEXT NOT NULL REFERENCES orders(id),
  table_name   TEXT,
  subtotal     INTEGER NOT NULL,
  discount     INTEGER NOT NULL DEFAULT 0,
  total        INTEGER NOT NULL,
  method       TEXT,
  customer_id  TEXT REFERENCES customers(id),
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id            TEXT PRIMARY KEY,
  invoice_id    TEXT NOT NULL REFERENCES invoices(id),
  menu_item_id  TEXT NOT NULL REFERENCES menu_items(id),
  qty           INTEGER NOT NULL
);
