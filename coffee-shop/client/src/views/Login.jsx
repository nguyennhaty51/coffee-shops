import { useState } from "react";
import { Coffee, LogIn, AlertCircle, ChevronDown, ChevronUp, KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";

const DEMO_ACCOUNTS = [
  { username: "admin", password: "admin123", label: "Quản trị viên — toàn quyền" },
  { username: "manager", password: "manager123", label: "Quản lý" },
  { username: "phucvu", password: "phucvu123", label: "Nhân viên phục vụ" },
  { username: "thungan", password: "thungan123", label: "Nhân viên thu ngân" },
  { username: "phache", password: "phache123", label: "Nhân viên pha chế" },
  { username: "khonl", password: "khonl123", label: "Nhân viên kho" },
];

export default function Login({ onLogin, error, onShowPublicMenu, onForgotVerify, onForgotReset }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  // "login" | "forgot-step1" | "forgot-step2" | "forgot-done"
  const [mode, setMode] = useState("login");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username || !password) return;
    setSubmitting(true);
    await onLogin(username, password);
    setSubmitting(false);
  }

  function fillDemo(acc) {
    setUsername(acc.username);
    setPassword(acc.password);
  }

  function backToLogin() {
    setMode("login");
  }

  if (mode !== "login") {
    return (
      <ForgotPasswordFlow
        mode={mode}
        setMode={setMode}
        onForgotVerify={onForgotVerify}
        onForgotReset={onForgotReset}
        onDoneBackToLogin={(u) => {
          setUsername(u || "");
          setPassword("");
          setMode("login");
        }}
        onCancel={backToLogin}
      />
    );
  }

  return (
    <div className="w-full min-h-screen bg-stone-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-700 flex items-center justify-center mx-auto mb-3">
            <Coffee size={26} className="text-amber-100" />
          </div>
          <div className="font-serif text-xl sm:text-2xl text-stone-800">Cà Phê Ẩn</div>
          <div className="text-sm text-stone-500 mt-1">Đăng nhập hệ thống quản lý</div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 space-y-4">
          <div>
            <label className="text-xs text-stone-500 block mb-1">Tên đăng nhập</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              placeholder="VD: admin"
              className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-stone-500 block">Mật khẩu</label>
              <button
                type="button"
                onClick={() => setMode("forgot-step1")}
                className="text-xs text-amber-700 hover:text-amber-800 underline underline-offset-2"
              >
                Quên mật khẩu?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium"
          >
            <LogIn size={16} /> {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-4">
          <button
            onClick={() => setShowDemo((v) => !v)}
            className="w-full flex items-center justify-between text-xs text-stone-500 px-1 py-2 hover:text-stone-700"
          >
            <span>Tài khoản demo để dùng thử (6 vai trò)</span>
            {showDemo ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showDemo && (
            <div className="bg-white border border-stone-200 rounded-lg divide-y divide-stone-100 overflow-hidden">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  onClick={() => fillDemo(acc)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-stone-50 text-left"
                >
                  <span className="text-stone-600">{acc.label}</span>
                  <span className="text-stone-400 font-mono">{acc.username}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onShowPublicMenu}
          className="w-full text-center text-sm text-amber-700 hover:text-amber-800 mt-6 underline underline-offset-2"
        >
          Là khách hàng? Xem thực đơn không cần đăng nhập →
        </button>
      </div>
    </div>
  );
}

// Luồng "Quên mật khẩu" — 2 bước:
// 1) Nhập tên đăng nhập + SĐT đã đăng ký lúc Admin/Quản lý tạo tài khoản (UC10) để xác thực.
// 2) Nếu khớp, cho nhập mật khẩu mới.
function ForgotPasswordFlow({ mode, setMode, onForgotVerify, onForgotReset, onDoneBackToLogin, onCancel }) {
  const [fpUsername, setFpUsername] = useState("");
  const [fpPhone, setFpPhone] = useState("");
  const [fpNewPassword, setFpNewPassword] = useState("");
  const [fpConfirmPassword, setFpConfirmPassword] = useState("");
  const [fpStaffName, setFpStaffName] = useState("");
  const [fpError, setFpError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleVerify(e) {
    e.preventDefault();
    setFpError("");
    if (!fpUsername || !fpPhone) return;
    setSubmitting(true);
    try {
      const result = await onForgotVerify(fpUsername.trim(), fpPhone.trim());
      setFpStaffName(result.name || "");
      setMode("forgot-step2");
    } catch (err) {
      setFpError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setFpError("");
    if (!fpNewPassword || !fpConfirmPassword) return;
    if (fpNewPassword.length < 6) {
      setFpError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (fpNewPassword !== fpConfirmPassword) {
      setFpError("Mật khẩu xác nhận không khớp");
      return;
    }
    setSubmitting(true);
    try {
      await onForgotReset(fpUsername.trim(), fpPhone.trim(), fpNewPassword);
      setMode("forgot-done");
    } catch (err) {
      setFpError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-stone-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-700 flex items-center justify-center mx-auto mb-3">
            <KeyRound size={24} className="text-amber-100" />
          </div>
          <div className="font-serif text-xl sm:text-2xl text-stone-800">Quên mật khẩu</div>
          <div className="text-sm text-stone-500 mt-1">
            {mode === "forgot-step1" && "Xác thực bằng số điện thoại đã đăng ký với Quản trị viên/Quản lý"}
            {mode === "forgot-step2" && `Xin chào ${fpStaffName || ""} — đặt mật khẩu mới cho tài khoản`}
            {mode === "forgot-done" && "Đặt lại mật khẩu thành công"}
          </div>
        </div>

        {mode === "forgot-step1" && (
          <form onSubmit={handleVerify} className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 space-y-4">
            <div>
              <label className="text-xs text-stone-500 block mb-1">Tên đăng nhập</label>
              <input
                value={fpUsername}
                onChange={(e) => setFpUsername(e.target.value)}
                autoFocus
                placeholder="VD: phucvu"
                className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Số điện thoại đã đăng ký</label>
              <input
                value={fpPhone}
                onChange={(e) => setFpPhone(e.target.value)}
                placeholder="09xxxxxxxx"
                className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="text-[11px] text-stone-400 mt-1">
                Đây là số điện thoại được Quản trị viên/Quản lý nhập khi tạo tài khoản cho bạn ở mục "Nhân viên & tài khoản".
              </div>
            </div>

            {fpError && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" /> {fpError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium"
            >
              {submitting ? "Đang xác thực..." : "Xác nhận"}
            </button>
          </form>
        )}

        {mode === "forgot-step2" && (
          <form onSubmit={handleReset} className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 space-y-4">
            <div>
              <label className="text-xs text-stone-500 block mb-1">Mật khẩu mới</label>
              <input
                type="password"
                value={fpNewPassword}
                onChange={(e) => setFpNewPassword(e.target.value)}
                autoFocus
                placeholder="Ít nhất 6 ký tự"
                className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={fpConfirmPassword}
                onChange={(e) => setFpConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {fpError && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" /> {fpError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium"
            >
              {submitting ? "Đang lưu..." : "Đặt lại mật khẩu"}
            </button>
          </form>
        )}

        {mode === "forgot-done" && (
          <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
              <CheckCircle2 size={26} className="text-emerald-600" />
            </div>
            <div className="text-sm text-stone-600">
              Mật khẩu của tài khoản <span className="font-medium text-stone-800">{fpUsername}</span> đã được đặt lại. Bạn có thể đăng nhập bằng mật khẩu mới.
            </div>
            <button
              onClick={() => onDoneBackToLogin(fpUsername)}
              className="w-full flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-800 text-white py-2.5 rounded-lg text-sm font-medium"
            >
              <LogIn size={16} /> Đến trang đăng nhập
            </button>
          </div>
        )}

        {mode !== "forgot-done" && (
          <button
            onClick={onCancel}
            className="w-full flex items-center justify-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 mt-4"
          >
            <ArrowLeft size={14} /> Quay lại đăng nhập
          </button>
        )}
      </div>
    </div>
  );
}
