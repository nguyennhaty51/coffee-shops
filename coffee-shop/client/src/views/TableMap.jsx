import CupIcon from "../components/CupIcon.jsx";
import { STATUS_META } from "../data/constants.js";

export default function TableMap({ tables, onOpen, orders }) {
  const areas = [...new Set(tables.map((t) => t.area))];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-5 text-xs text-stone-500">
        {Object.entries(STATUS_META).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${v.dot}`} /> {v.label}
          </div>
        ))}
      </div>

      {areas.map((area) => (
        <div key={area}>
          <div className="text-sm font-medium text-stone-500 mb-3 uppercase tracking-wide">{area}</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {tables
              .filter((t) => t.area === area)
              .map((t) => {
                const meta = STATUS_META[t.status];
                const order = orders.find((o) => o.tableId === t.id && o.status === "open");
                const itemCount = order ? order.items.reduce((s, it) => s + it.qty, 0) : 0;
                return (
                  <button
                    key={t.id}
                    onClick={() => onOpen(t)}
                    className={`rounded-xl border p-4 flex flex-col items-center gap-2 bg-white hover:shadow-md transition-shadow ring-1 ${meta.ring}`}
                  >
                    <CupIcon status={t.status} />
                    <div className="font-semibold text-stone-800">{t.name}</div>
                    <div className={`text-[11px] px-2 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>{meta.label}</div>
                    {itemCount > 0 && <div className="text-[11px] text-stone-400">{itemCount} món</div>}
                  </button>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
