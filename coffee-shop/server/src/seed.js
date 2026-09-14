import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export const CATEGORIES = [
  { id: "c1", name: "Cà phê" },
  { id: "c2", name: "Trà" },
  { id: "c3", name: "Nước ép" },
  { id: "c4", name: "Bánh ngọt" },
];

export const MENU_ITEMS = [
  { id: "m1", name: "Cà phê sữa đá", categoryId: "c1", price: 29000, status: "available", image: "m1_cafe_sua_da.png",
    description: "Cà phê pha phin truyền thống kết hợp cùng sữa đặc đậm đà." },
  { id: "m2", name: "Bạc xỉu", categoryId: "c1", price: 32000, status: "available", image: "m2_bac_xiu.png",
    description: "Sữa tươi thơm béo hoà quyện cùng chút cà phê phin nguyên chất." },
  { id: "m3", name: "Espresso", categoryId: "c1", price: 35000, status: "available", image: "m3_espresso.png",
    description: "Cà phê nguyên chất pha máy áp suất cao, đậm vị, thơm nồng." },
  { id: "m4", name: "Cà phê đen đá", categoryId: "c1", price: 25000, status: "available", image: "m4_cafe_den_da.png",
    description: "Đậm đà, truyền thống, giúp tỉnh táo mạnh — dành cho tín đồ cà phê đen." },
  { id: "m5", name: "Trà đào cam sả", categoryId: "c2", price: 39000, status: "available", image: "m5_tra_dao.png",
    description: "Thanh mát với đào miếng ngọt lịm, hương cam và sả nồng nàn." },
  { id: "m6", name: "Trà sen vàng", categoryId: "c2", price: 35000, status: "available", image: "m6_tra_sen_vang.png",
    description: "Hương sen dịu nhẹ, vị trà thanh thoát, hợp gu ít ngọt." },
  { id: "m7", name: "Trà vải", categoryId: "c2", price: 35000, status: "available", image: "m7_tra_vai.png",
    description: "Vải tươi ngọt mát hoà cùng trà thơm, giải khát cực đã." },
  { id: "m8", name: "Nước cam ép", categoryId: "c3", price: 35000, status: "available", image: "m8_nuoc_cam.png",
    description: "Cam vắt nguyên chất 100%, không đường, giàu vitamin C." },
  { id: "m9", name: "Nước ép dưa hấu", categoryId: "c3", price: 32000, status: "available", image: "m9_nuoc_ep_dua_hau.png",
    description: "Dưa hấu ép tươi mát lạnh, ngọt thanh tự nhiên." },
  { id: "m10", name: "Bánh tiramisu", categoryId: "c4", price: 45000, status: "available", image: "m10_tiramisu.png",
    description: "Bánh mềm mịn, hoà quyện hương cà phê phin và phô mai mascarpone." },
  { id: "m11", name: "Bánh croissant", categoryId: "c4", price: 28000, status: "available", image: "m11_croissant.png",
    description: "Bánh sừng bò bơ Pháp, lớp vỏ giòn xốp nhiều tầng." },
  { id: "m12", name: "Bánh phô mai", categoryId: "c4", price: 38000, status: "out", image: "m12_banh_pho_mai.png",
    description: "Phô mai béo mịn trên lớp đế bánh giòn tan." },
];

export const INGREDIENTS = [
  { id: "i1", name: "Cà phê hạt", unit: "kg", stock: 5, min: 2 },
  { id: "i2", name: "Sữa đặc", unit: "lon", stock: 12, min: 5 },
  { id: "i3", name: "Đá viên", unit: "kg", stock: 30, min: 10 },
  { id: "i4", name: "Trà đào túi lọc", unit: "gói", stock: 3, min: 5 },
  { id: "i5", name: "Cam tươi", unit: "kg", stock: 8, min: 3 },
  { id: "i6", name: "Dưa hấu", unit: "kg", stock: 6, min: 3 },
  { id: "i7", name: "Bột tiramisu", unit: "hộp", stock: 1, min: 3 },
  { id: "i8", name: "Bột mì croissant", unit: "kg", stock: 10, min: 4 },
  { id: "i9", name: "Phô mai", unit: "kg", stock: 3, min: 2 },
];

export const RECIPES = [
  { menuItemId: "m1", ingredientId: "i1", qty: 0.03 },
  { menuItemId: "m1", ingredientId: "i2", qty: 0.3 },
  { menuItemId: "m1", ingredientId: "i3", qty: 0.2 },
  { menuItemId: "m2", ingredientId: "i1", qty: 0.03 },
  { menuItemId: "m2", ingredientId: "i2", qty: 0.5 },
  { menuItemId: "m2", ingredientId: "i3", qty: 0.2 },
  { menuItemId: "m3", ingredientId: "i1", qty: 0.02 },
  { menuItemId: "m4", ingredientId: "i1", qty: 0.03 },
  { menuItemId: "m4", ingredientId: "i3", qty: 0.2 },
  { menuItemId: "m5", ingredientId: "i4", qty: 1 },
  { menuItemId: "m5", ingredientId: "i3", qty: 0.2 },
  { menuItemId: "m6", ingredientId: "i4", qty: 1 },
  { menuItemId: "m7", ingredientId: "i3", qty: 0.2 },
  { menuItemId: "m8", ingredientId: "i5", qty: 0.4 },
  { menuItemId: "m9", ingredientId: "i6", qty: 0.5 },
  { menuItemId: "m10", ingredientId: "i7", qty: 0.25 },
  { menuItemId: "m11", ingredientId: "i8", qty: 0.1 },
];

export const TABLES = [
  { id: "t1", name: "B01", area: "Tầng 1", status: "empty" },
  { id: "t2", name: "B02", area: "Tầng 1", status: "empty" },
  { id: "t3", name: "B03", area: "Tầng 1", status: "empty" },
  { id: "t4", name: "B04", area: "Tầng 1", status: "empty" },
  { id: "t5", name: "B05", area: "Tầng 1", status: "empty" },
  { id: "t6", name: "B06", area: "Tầng 1", status: "empty" },
  { id: "t7", name: "V01", area: "Sân vườn", status: "empty" },
  { id: "t8", name: "V02", area: "Sân vườn", status: "empty" },
  { id: "t9", name: "V03", area: "Sân vườn", status: "empty" },
  { id: "t10", name: "V04", area: "Sân vườn", status: "empty" },
];

// 7 tác nhân theo đúng báo cáo PTTKHT: Quản trị viên, Quản lý, Phục vụ, Thu ngân,
// Pha chế, Nhân viên kho, (Khách hàng dùng trang QR công khai — không có tài khoản).
// Mật khẩu demo dưới đây sẽ được BĂM bằng bcrypt khi nạp vào CSDL.
export const STAFF = [
  { id: "s1", name: "Nguyễn Văn An", role: "Quản trị viên", roleKey: "admin", username: "admin", password: "admin123", phone: "0901111111", active: 1 },
  { id: "s2", name: "Trần Thị Bích", role: "Quản lý", roleKey: "manager", username: "manager", password: "manager123", phone: "0902222222", active: 1 },
  { id: "s3", name: "Phạm Minh Đức", role: "Nhân viên phục vụ", roleKey: "staff", username: "phucvu", password: "phucvu123", phone: "0904444444", active: 1 },
  { id: "s4", name: "Lê Hoàng Cường", role: "Nhân viên thu ngân", roleKey: "cashier", username: "thungan", password: "thungan123", phone: "0903333333", active: 1 },
  { id: "s5", name: "Hoàng Thuý Linh", role: "Nhân viên pha chế", roleKey: "barista", username: "phache", password: "phache123", phone: "0905555555", active: 1 },
  { id: "s6", name: "Đỗ Văn Kho", role: "Nhân viên kho", roleKey: "warehouse", username: "khonl", password: "khonl123", phone: "0907777777", active: 1 },
  { id: "s7", name: "Vũ Quang Huy", role: "Nhân viên phục vụ", roleKey: "staff", username: "huy", password: "huy123", phone: "0906666666", active: 0 },
];

export const CUSTOMERS = [
  { id: "cu1", name: "Nguyễn Thanh Hải", phone: "0911111111", points: 128 },
  { id: "cu2", name: "Nguyễn Thị Ngọc Giao", phone: "0922222222", points: 46 },
  { id: "cu3", name: "Diệp Từ Huy", phone: "0933333333", points: 302 },
  { id: "cu4", name: "Lưu Minh Hoà", phone: "0944444444", points: 12 },
];

export const PROMOS = [
  { id: "p0", name: "Không áp dụng", percent: 0, min: 0, active: 1 },
  { id: "p1", name: "Giảm 10% (hoá đơn từ 200.000đ)", percent: 10, min: 200000, active: 1 },
  { id: "p2", name: "Ưu đãi thành viên — Giảm 5%", percent: 5, min: 0, active: 1 },
];

export function seedDatabase(db) {
  const already = db.prepare("SELECT COUNT(*) AS n FROM categories").get();
  if (already.n > 0) return false;

  const insertMany = db.transaction(() => {
    const insCat = db.prepare("INSERT INTO categories (id, name) VALUES (@id, @name)");
    CATEGORIES.forEach((c) => insCat.run(c));

    const insMenu = db.prepare(
      "INSERT INTO menu_items (id, name, category_id, price, status, image, description) VALUES (@id, @name, @categoryId, @price, @status, @image, @description)"
    );
    MENU_ITEMS.forEach((m) => insMenu.run(m));

    const insIng = db.prepare(
      "INSERT INTO ingredients (id, name, unit, stock, min_stock) VALUES (@id, @name, @unit, @stock, @min)"
    );
    INGREDIENTS.forEach((i) => insIng.run(i));

    const insRecipe = db.prepare(
      "INSERT INTO recipes (menu_item_id, ingredient_id, qty) VALUES (@menuItemId, @ingredientId, @qty)"
    );
    RECIPES.forEach((r) => insRecipe.run(r));

    const insTable = db.prepare("INSERT INTO dining_tables (id, name, area, status) VALUES (@id, @name, @area, @status)");
    TABLES.forEach((t) => insTable.run(t));

    const insStaff = db.prepare(
      "INSERT INTO staff (id, name, role, role_key, username, password_hash, phone, active) VALUES (@id, @name, @role, @roleKey, @username, @passwordHash, @phone, @active)"
    );
    STAFF.forEach((s) => insStaff.run({ ...s, passwordHash: bcrypt.hashSync(s.password, 10) }));

    const insCust = db.prepare("INSERT INTO customers (id, name, phone, points) VALUES (@id, @name, @phone, @points)");
    CUSTOMERS.forEach((c) => insCust.run(c));

    const insPromo = db.prepare("INSERT INTO promos (id, name, percent, min_total, active) VALUES (@id, @name, @percent, @min, @active)");
    PROMOS.forEach((p) => insPromo.run(p));
  });

  insertMany();
  return true;
}

export { randomUUID };
