import { verifyToken } from "./jwt.js";
import { db } from "../db.js";

// Xác thực người dùng qua JWT gửi trong header: Authorization: Bearer <token>
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Chưa đăng nhập" });

  try {
    const payload = verifyToken(token);
    const staff = db.prepare("SELECT id, name, role, role_key AS roleKey, active FROM staff WHERE id = ?").get(payload.staffId);
    if (!staff || !staff.active) {
      return res.status(401).json({ error: "Tài khoản không tồn tại hoặc đã bị khoá" });
    }
    req.user = staff;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn" });
  }
}

// Chỉ cho phép các vai trò được liệt kê truy cập route.
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Chưa đăng nhập" });
    if (!allowedRoles.includes(req.user.roleKey)) {
      return res.status(403).json({ error: "Bạn không có quyền thực hiện thao tác này" });
    }
    next();
  };
}
