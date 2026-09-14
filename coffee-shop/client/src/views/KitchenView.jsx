import { Clock, CheckCircle2 } from "lucide-react";
import EmptyHint from "../components/EmptyHint.jsx";

export default function KitchenView({ orders, tables, menu, onReady }) {
  const pending = [];
  orders.forEach((o) => {
    if (o.status !== "open") return;
    o.items.forEach((it) => {
      if (it.status === "cho_pha_che") pending.push({ order: o, item: it, table: tables.find((t) => t.id === o.tableId) });
    });
  });

  if (pending.length === 0) return <EmptyHint text="Hiện không có món nào đang chờ chế biến." />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {pending.map((p) => {
        const m = menu.find((mm) => mm.id === p.item.menuId);
        return (
          <div key={p.item.id} className="bg-white rounded-xl border border-amber-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Bàn {p.table.name}</div>
              <Clock size={14} className="text-stone-400" />
            </div>
            <div className="font-medium text-stone-800">{m?.name}</div>
            <div className="text-sm text-stone-500 mb-3">Số lượng: {p.item.qty}</div>
            <button
              onClick={() => onReady(p.order.id, p.item.id)}
              className="w-full flex items-center justify-center gap-1.5 bg-stone-900 text-white text-sm py-2 rounded-lg hover:bg-stone-800"
            >
              <CheckCircle2 size={15} /> Hoàn thành
            </button>
          </div>
        );
      })}
    </div>
  );
}
