import { useState } from "react";
import { AlertTriangle } from "lucide-react";

export default function InventoryView({ ingredients, onNhapKho, onXuatKho }) {
  const [showForm, setShowForm] = useState(null); // { id, mode: 'in' | 'out' }
  const [qty, setQty] = useState("");

  function submit(id, mode) {
    if (!qty) return;
    if (mode === "in") onNhapKho(id, qty);
    else onXuatKho(id, qty);
    setQty("");
    setShowForm(null);
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-stone-500">
        {ingredients.length} nguyên liệu — {ingredients.filter((i) => i.stock <= i.min).length} đang ở mức cảnh báo
      </div>
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-stone-50 text-stone-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2.5">Nguyên liệu</th>
              <th className="text-left px-4 py-2.5">Đơn vị</th>
              <th className="text-left px-4 py-2.5">Tồn kho</th>
              <th className="text-left px-4 py-2.5">Ngưỡng tối thiểu</th>
              <th className="text-left px-4 py-2.5">Trạng thái</th>
              <th className="text-right px-4 py-2.5">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {ingredients.map((i) => {
              const low = i.stock <= i.min;
              const formOpen = showForm?.id === i.id;
              return (
                <tr key={i.id}>
                  <td className="px-4 py-2.5 text-stone-800">{i.name}</td>
                  <td className="px-4 py-2.5 text-stone-500">{i.unit}</td>
                  <td className="px-4 py-2.5 text-stone-700">{i.stock}</td>
                  <td className="px-4 py-2.5 text-stone-500">{i.min}</td>
                  <td className="px-4 py-2.5">
                    {low ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-600 flex items-center gap-1 w-fit">
                        <AlertTriangle size={11} /> Sắp hết
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 w-fit block">Ổn định</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {formOpen ? (
                      <div className="flex items-center gap-1.5 justify-end">
                        <input
                          autoFocus
                          type="number"
                          value={qty}
                          onChange={(e) => setQty(e.target.value)}
                          placeholder="Số lượng"
                          className="w-20 border border-stone-300 rounded-lg px-2 py-1 text-xs"
                        />
                        <button onClick={() => submit(i.id, showForm.mode)} className="text-xs bg-stone-900 text-white px-2.5 py-1 rounded-lg">
                          OK
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => { setShowForm({ id: i.id, mode: "in" }); setQty(""); }}
                          className="text-xs px-2.5 py-1 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50"
                        >
                          + Nhập kho
                        </button>
                        <button
                          onClick={() => { setShowForm({ id: i.id, mode: "out" }); setQty(""); }}
                          className="text-xs px-2.5 py-1 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50"
                        >
                          − Xuất kho
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
