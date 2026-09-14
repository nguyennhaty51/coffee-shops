import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db.js";
import { signToken } from "../auth/jwt.js";
import { requireAuth } from "../auth/middleware.js";

const router = Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Vui lòng nhập tên đăng nhập và mật khẩu" });

  const staff = db.prepare("SELECT * FROM staff WHERE username = ?").get(username);
  if (!staff) return res.status(401).json({ error: "Tên đăng nhập hoặc mật khẩu không đúng" });
  if (!staff.active) return res.status(403).json({ error: "Tài khoản đã bị khoá. Vui lòng liên hệ Quản trị viên." });

  const ok = bcrypt.compareSync(password, staff.password_hash || "");
  if (!ok) return res.status(401).json({ error: "Tên đăng nhập hoặc mật khẩu không đúng" });

  const token = signToken({ staffId: staff.id, roleKey: staff.role_key });
  res.json({ token, user: { id: staff.id, name: staff.name, role: staff.role, roleKey: staff.role_key } });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: { id: req.user.id, name: req.user.name, role: req.user.role, roleKey: req.user.roleKey } });
});

// ================== QUÊN MẬT KHẨU (UC02) ==================
// Không cần đăng nhập. Nhân viên xác thực bằng username + số điện thoại đã
// đăng ký lúc được Admin/Quản lý tạo tài khoản (bảng staff, cột phone).
// Đây là bản demo đồ án nên KHÔNG gửi OTP qua SMS thật — số điện thoại đóng
// vai trò yếu tố xác thực thay thế mật khẩu cũ.

// Bước 1: kiểm tra username + SĐT có khớp với một tài khoản đang hoạt động không
router.post("/forgot-password/verify", (req, res) => {
  const { username, phone } = req.body;
  if (!username || !phone) {
    return res.status(400).json({ error: "Vui lòng nhập tên đăng nhập và số điện thoại" });
  }

  const staff = db.prepare("SELECT * FROM staff WHERE username = ?").get(username.trim());
  const phoneMatches = staff && (staff.phone || "").trim() === phone.trim();

  if (!staff || !phoneMatches) {
    return res.status(400).json({ error: "Tên đăng nhập hoặc số điện thoại không khớp với thông tin đã đăng ký" });
  }
  if (!staff.active) {
    return res.status(403).json({ error: "Tài khoản đã bị khoá. Vui lòng liên hệ Quản trị viên." });
  }

  res.json({ ok: true, name: staff.name });
});

// Bước 2: sau khi xác thực đúng, cho phép đặt mật khẩu mới
router.post("/forgot-password/reset", (req, res) => {
  const { username, phone, newPassword } = req.body;
  if (!username || !phone || !newPassword) {
    return res.status(400).json({ error: "Thiếu thông tin để đặt lại mật khẩu" });
  }
  if (String(newPassword).length < 6) {
    return res.status(400).json({ error: "Mật khẩu mới phải có ít nhất 6 ký tự" });
  }

  const staff = db.prepare("SELECT * FROM staff WHERE username = ?").get(username.trim());
  const phoneMatches = staff && (staff.phone || "").trim() === phone.trim();

  if (!staff || !phoneMatches) {
    return res.status(400).json({ error: "Tên đăng nhập hoặc số điện thoại không khớp với thông tin đã đăng ký" });
  }
  if (!staff.active) {
    return res.status(403).json({ error: "Tài khoản đã bị khoá. Vui lòng liên hệ Quản trị viên." });
  }

  const passwordHash = bcrypt.hashSync(String(newPassword), 10);
  db.prepare("UPDATE staff SET password_hash = ? WHERE id = ?").run(passwordHash, staff.id);

  res.json({ ok: true });
});

export default router;
