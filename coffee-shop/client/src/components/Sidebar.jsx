import { Coffee, AlertTriangle, X } from "lucide-react";
import { NAV } from "../data/constants.js";

// Sidebar responsive: hiển thị cố định bên trái trên màn hình rộng (md trở lên),
// và trở thành drawer trượt từ trái trên điện thoại/tablet dọc — điều khiển bởi
// prop mobileOpen (bật/tắt từ nút hamburger ở Topbar).
export default function Sidebar({ role, view, setView, setActiveTableId, lowStockCount, mobileOpen, onCloseMobile }) {
  const availableNav = NAV.filter((n) => n.roles.includes(role));

  const content = (
    <>
      <div className="px-5 py-5 flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-amber-700 flex items-center justify-center shrink-0">
            <Coffee size={20} className="text-amber-100" />
          </div>
          <div>
            <div className="font-serif text-lg leading-tight text-white">Cà Phê Ẩn</div>
            <div className="text-[11px] text-stone-400 tracking-wide">QUẢN LÝ VẬN HÀNH</div>
          </div>
        </div>
        <button onClick={onCloseMobile} className="md:hidden text-stone-400 hover:text-white p-1">
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {availableNav.map((item) => {
          const Icon = item.icon;
          const active = view === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                setView(item.key);
                setActiveTableId(null);
                onCloseMobile?.();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active ? "bg-amber-700 text-white" : "text-stone-300 hover:bg-stone-800 hover:text-white"
              }`}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {lowStockCount > 0 && (role === "admin" || role === "manager" || role === "warehouse") && (
        <div className="m-3 p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-start gap-2">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <span>{lowStockCount} nguyên liệu sắp hết hàng. Xem mục Kho.</span>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Sidebar cố định — desktop/tablet ngang */}
      <aside className="hidden md:flex w-60 shrink-0 bg-stone-900 text-stone-200 flex-col">{content}</aside>

      {/* Drawer trượt — điện thoại/tablet dọc */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onCloseMobile} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[80vw] bg-stone-900 text-stone-200 flex flex-col shadow-2xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
