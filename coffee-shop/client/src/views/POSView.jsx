import { useState } from "react";
import { ArrowLeft, ShoppingCart, Minus, Plus, Send } from "lucide-react";
import { money } from "../utils/format.js";

export default function POSView({ table, order, menu, cats, onBack, onAdd, onQty, onSend }) {
  const [activeCat, setActiveCat] = useState(cats[0].id);
  if (!order) return null;

  const subtotal = order.items.reduce((s, it) => s + it.qty * (menu.find((m) => m.id === it.menuId)?.price || 0), 0);
  const hasNew = order.items.some((it) => it.status === "moi");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800">
          <ArrowLeft size={15} /> Quay lại sơ đồ bàn
        </button>

        <div className="flex gap-2">
          {cats.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`px-3.5 py-1.5 rounded-full text-sm border transition-colors ${
                activeCat === c.id ? "bg-amber-700 text-white border-amber-700" : "bg-white text-stone-600 border-stone-300 hover:bg-stone-50"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {menu
            .filter((m) => m.catId === activeCat)
            .map((m) => (
              <button
                key={m.id}
                disabled={m.status === "out"}
                onClick={() => onAdd(order.id, m.id)}
                className={`text-left bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-amber-400 hover:shadow-sm transition-all ${
                  m.status === "out" ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                {m.image && <img src={`/images/menu/${m.image}`} alt={m.name} className="w-full h-20 object-cover" />}
                <div className="p-2.5">
                  <div className="text-sm font-medium text-stone-800">{m.name}</div>
                  <div className="text-xs text-stone-500 mt-1">{money(m.price)}</div>
                  {m.status === "out" && <div className="text-[10px] text-red-500 mt-1">Hết hàng</div>}
                </div>
              </button>
            ))}
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <ShoppingCart size={16} className="text-amber-700" />
          <div className="font-serif text-base">Order — Bàn {table.name}</div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px]">
          {order.items.length === 0 && <div className="text-sm text-stone-400 text-center py-10">Chưa có món nào được chọn</div>}
          {order.items.map((it) => {
            const m = menu.find((mm) => mm.id === it.menuId);
            const st = { moi: "Chưa gửi", cho_pha_che: "Đang pha chế", san_sang: "Sẵn sàng" }[it.status];
            const stColor = { moi: "text-stone-400", cho_pha_che: "text-amber-600", san_sang: "text-emerald-600" }[it.status];
            return (
              <div key={it.id} className="flex items-center gap-2 border-b border-stone-100 pb-2">
                <div className="flex-1">
                  <div className="text-sm text-stone-700">{m?.name}</div>
                  <div className={`text-[11px] ${stColor}`}>{st}</div>
                </div>
                {it.status === "moi" ? (
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => onQty(order.id, it.id, -1)} className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200">
                      <Minus size={12} />
                    </button>
                    <span className="text-sm w-4 text-center">{it.qty}</span>
                    <button onClick={() => onQty(order.id, it.id, 1)} className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200">
                      <Plus size={12} />
                    </button>
                  </div>
                ) : (
                  <span className="text-sm text-stone-500 w-14 text-right">x{it.qty}</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="border-t border-stone-200 pt-3 mt-2">
          <div className="flex justify-between text-sm text-stone-600 mb-3">
            <span>Tạm tính</span>
            <span className="font-semibold text-stone-800">{money(subtotal)}</span>
          </div>
          <button
            disabled={!hasNew}
            onClick={() => onSend(order.id)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              hasNew ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-stone-100 text-stone-400 cursor-not-allowed"
            }`}
          >
            <Send size={15} /> Gửi order xuống pha chế
          </button>
        </div>
      </div>
    </div>
  );
}
