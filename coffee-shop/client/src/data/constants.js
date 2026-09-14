import {
  LayoutDashboard, LayoutGrid, ChefHat, CreditCard, UtensilsCrossed,
  Package, Users, Star, Percent,
} from "lucide-react";

// 6 vai trò tài khoản nhân viên (khớp role_key ở backend) — đúng 6/7 tác nhân
// trong báo cáo PTTKHT. Tác nhân thứ 7 "Khách hàng" không có tài khoản, dùng
// trang đặt món quét QR công khai (PublicOrderMenu.jsx), không thuộc hệ phân quyền này.
export const ROLE_LABELS = {
  admin: "Quản trị viên",
  manager: "Quản lý",
  staff: "Nhân viên phục vụ",
  cashier: "Nhân viên thu ngân",
  barista: "Nhân viên pha chế",
  warehouse: "Nhân viên kho",
};

// Cấu hình menu điều hướng bên trái, mỗi mục khai báo những vai trò được thấy —
// đối chiếu trực tiếp với 13 nhóm Use Case trong báo cáo (2.2).
export const NAV = [
  { key: "dashboard", label: "Tổng quan", icon: LayoutDashboard, roles: ["admin", "manager"] },
  { key: "tables", label: "Sơ đồ bàn & Gọi món", icon: LayoutGrid, roles: ["admin", "manager", "staff"] },
  { key: "kitchen", label: "Bếp / Pha chế", icon: ChefHat, roles: ["admin", "manager", "barista"] },
  { key: "payment", label: "Hoá đơn & Thanh toán", icon: CreditCard, roles: ["admin", "manager", "cashier"] },
  { key: "menu", label: "Thực đơn", icon: UtensilsCrossed, roles: ["admin", "manager"] },
  { key: "promotions", label: "Khuyến mãi", icon: Percent, roles: ["admin", "manager"] },
  { key: "inventory", label: "Kho nguyên liệu", icon: Package, roles: ["admin", "manager", "warehouse"] },
  { key: "staff", label: "Nhân viên & tài khoản", icon: Users, roles: ["admin", "manager"] },
  { key: "loyalty", label: "Khách hàng thân thiết", icon: Star, roles: ["admin", "manager", "cashier", "staff"] },
];

// Màu sắc / nhãn cho từng trạng thái bàn — dùng ở TableMap và chú thích
export const STATUS_META = {
  empty: { label: "Trống", ring: "ring-emerald-300", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  serving: { label: "Đang phục vụ", ring: "ring-amber-300", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  reserved: { label: "Đã đặt trước", ring: "ring-stone-300", bg: "bg-stone-100", text: "text-stone-600", dot: "bg-stone-400" },
};

export const PIE_COLORS = ["#B45309", "#0D9488", "#CA8A04", "#7C3AED"];
