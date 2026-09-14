import { LogOut, Menu } from "lucide-react";
import { NAV } from "../data/constants.js";

export default function Topbar({ view, user, onLogout, onOpenMobileMenu }) {
  return (
    <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onOpenMobileMenu} className="md:hidden text-stone-500 hover:text-stone-800 p-1 shrink-0">
          <Menu size={20} />
        </button>
        <div className="font-serif text-lg sm:text-xl text-stone-800 truncate">{NAV.find((n) => n.key === view)?.label || ""}</div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="text-right leading-tight hidden sm:block">
          <div className="text-sm font-medium text-stone-800">{user.name}</div>
          <div className="text-[11px] text-stone-500">{user.role}</div>
        </div>
        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-semibold text-sm">
          {user.name[0]}
        </div>
        <button
          onClick={onLogout}
          title="Đăng xuất"
          className="w-9 h-9 rounded-full flex items-center justify-center text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
