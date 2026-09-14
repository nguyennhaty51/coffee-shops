# Cà Phê Ẩn — Hệ thống quản lý quán cà phê
```
coffee-shop-fullstack/
├── server/
│   ├── src/
│   │   ├── schema.sql          Cấu trúc bảng CSDL (9 bảng)
│   │   ├── seed.js             Dữ liệu mẫu + 7 tài khoản nhân viên demo
│   │   ├── db.js                Kết nối + khởi tạo CSDL
│   │   ├── state.js              Gom dữ liệu + tính toán báo cáo
│   │   ├── app.js                 Cấu hình Express (routes, CORS, static)
│   │   ├── index.js                Điểm khởi chạy server
│   │   ├── auth/                    JWT + middleware phân quyền theo vai trò
│   │   ├── ai/suggest.js              Trợ lý AI (Gemini thật hoặc fallback theo luật)
│   │   └── routes/                     tables, orders, menu, ingredients, staff,
│   │                                    customers, auth, public (không cần đăng nhập)
│   └── data/coffeeshop.db       File CSDL SQLite (tự tạo khi chạy lần đầu)
│
└── client/
    ├── public/images/menu/      12 ảnh minh hoạ món (tự tạo, không cần internet)
    └── src/
        ├── hooks/useAuth.js          Đăng nhập / đăng xuất / giữ phiên
        ├── hooks/useShopState.js     Gọi API backend (đính token) + state giao diện
        ├── views/Login.jsx           Màn hình đăng nhập
        ├── views/PublicOrderMenu.jsx  Trang khách quét QR — xem menu, đặt món, chatbot AI
        ├── views/                     Dashboard, Sơ đồ bàn, POS, Bếp, Thanh toán,
        │                              Thực đơn, Kho, Nhân viên, Khách hàng thân thiết
        └── components/                Sidebar (responsive), Topbar, ChatWidget nội bộ,
                                        AiChatWidget (công khai)
```

---

## 1. Yêu cầu môi trường

- **Node.js 18 trở lên** (khuyến nghị 20/22) — https://nodejs.org
- Không cần cài MySQL/PostgreSQL — CSDL SQLite lưu trong 1 file.

## 2. Cài đặt

```bash
cd server && npm install
cd ../client && npm install
```

## 3. Chạy ở môi trường phát triển (2 tiến trình)

**Terminal 1 — backend (cổng 4000):**
```bash
cd server
npm run dev
```
Lần đầu chạy sẽ tự tạo `server/data/coffeeshop.db` và nạp sẵn dữ liệu mẫu.

**Terminal 2 — frontend (cổng 5173):**
```bash
cd client
npm run dev
```
Mở trình duyệt tại địa chỉ Vite hiển thị (thường `http://localhost:5173`).
Trên điện thoại/tablet cùng mạng LAN, có thể truy cập qua địa chỉ IP máy chạy
`npm run dev -- --host` để test giao diện responsive trên thiết bị thật.

## 4. Tài khoản demo (6 vai trò)

| Vai trò | Tên đăng nhập | Mật khẩu |
|---|---|---|
| Quản trị viên | `admin` | `admin123` |
| Quản lý | `manager` | `manager123` |
| Nhân viên phục vụ | `phucvu` | `phucvu123` |
| Nhân viên thu ngân | `thungan` | `thungan123` |
| Nhân viên pha chế | `phache` | `phache123` |
| Nhân viên kho | `khonl` | `khonl123` |

Tài khoản `huy` (mật khẩu `huy123`) bị khoá sẵn — dùng để demo tính năng
khoá/mở khoá tài khoản (chỉ Quản trị viên được thao tác).

Trang đăng nhập có nút **"Là khách hàng? Xem thực đơn không cần đăng nhập"**
để thử trang đặt món công khai mà không cần quét QR thật.

## 5. Reset dữ liệu về trạng thái demo ban đầu

```bash
cd server
npm run seed:reset
```
Sau đó khởi động lại `npm run dev`.

## 6. Phân quyền theo vai trò (tương ứng 13 nhóm Use Case trong báo cáo)

| Vai trò | Được truy cập |
|---|---|
| Quản trị viên (admin) | Toàn bộ hệ thống, kể cả khoá/mở khoá tài khoản |
| Quản lý (manager) | Toàn bộ trừ khoá/mở khoá tài khoản nhân viên |
| Nhân viên phục vụ (staff) | Sơ đồ bàn, gọi món, khách hàng thân thiết |
| Nhân viên thu ngân (cashier) | Thanh toán, hoá đơn, khách hàng thân thiết |
| Nhân viên pha chế (barista) | Màn hình bếp — nhận & hoàn thành món |
| Nhân viên kho (warehouse) | Kho nguyên liệu — nhập/xuất kho |
| Khách hàng | Trang QR công khai — xem menu, đặt món, tra điểm, chat AI |

Mỗi lần gọi API, backend kiểm tra token JWT rồi đối chiếu `role_key` với danh
sách vai trò được phép của từng route (`server/src/auth/middleware.js`) — sai
vai trò sẽ nhận lỗi `403 Forbidden`, đã kiểm thử với cả 6 tài khoản.
### Tách riêng frontend/backend
- Deploy `server/` như trên, ghi nhớ URL (VD: `https://api.domain.com`).
- Trong `client/.env`, đặt `VITE_API_URL=https://api.domain.com`, build rồi
  deploy `client/dist` lên Vercel/Netlify/Nginx tĩnh. CORS đã mở sẵn ở backend
  nên gọi API từ domain khác vẫn hoạt động bình thường.
