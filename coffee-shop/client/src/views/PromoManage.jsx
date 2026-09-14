import { useState } from "react";
import { PlusCircle, Trash2, Pencil, X } from "lucide-react";
import { money } from "../utils/format.js";

export default function PromoManage({ promos, onAdd, onUpdate, onToggleActive, onRemove }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [percent, setPercent] = useState("");
  const [min, setMin] = useState("");

  function openAddForm() {
    setEditingId(null);
    setName("");
    setPercent("");
    setMin("");
    setShowForm(true);
  }

  function openEditForm(p) {
    setEditingId(p.id);
    setName(p.name);
    setPercent(String(p.percent));
    setMin(String(p.min));
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
  }

  function submit() {
    if (!name || percent === "") return;
    if (editingId) {
      onUpdate(editingId, { name, percent: Number(percent), min: Number(min || 0) });
    } else {
      onAdd({ name, percent: Number(percent), min: Number(min || 0) });
    }
    closeForm();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-stone-500">
          {promos.length} khuyến mãi — {promos.filter((p) => p.active).length} đang hiển thị cho Thu ngân
        </div>
        {!showForm && (
          <button onClick={openAddForm} className="flex items-center gap-1.5 bg-amber-700 text-white text-sm px-3.5 py-2 rounded-lg hover:bg-amber-800">
            <PlusCircle size={15} /> Thêm khuyến mãi
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-stone-700">{editingId ? "Chỉnh sửa khuyến mãi" : "Khuyến mãi mới"}</div>
            <button onClick={closeForm} className="text-stone-400 hover:text-stone-600">
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-xs text-stone-500 block mb-1">Tên khuyến mãi</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Giảm 10% hoá đơn từ 200.000đ"
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="w-full sm:w-36">
              <label className="text-xs text-stone-500 block mb-1">Giảm (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="w-full sm:w-48">
              <label className="text-xs text-stone-500 block mb-1">Hoá đơn tối thiểu (đ)</label>
              <input
                type="number"
                min="0"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                placeholder="0"
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button onClick={submit} className="bg-stone-900 text-white text-sm px-4 py-2 rounded-lg">
            Lưu
          </button>
        </div>
      )}

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-stone-50 text-stone-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2.5">Tên khuyến mãi</th>
              <th className="text-left px-4 py-2.5">Giảm giá</th>
              <th className="text-left px-4 py-2.5">Đơn tối thiểu</th>
              <th className="text-left px-4 py-2.5">Trạng thái</th>
              <th className="text-right px-4 py-2.5">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {promos.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2.5 text-stone-800">{p.name}</td>
                <td className="px-4 py-2.5 text-stone-600">{p.percent}%</td>
                <td className="px-4 py-2.5 text-stone-500">{p.min > 0 ? money(p.min) : "Không yêu cầu"}</td>
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => onToggleActive(p.id)}
                    className={`text-xs px-2 py-1 rounded-full ${p.active ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}
                  >
                    {p.active ? "Đang áp dụng" : "Đã tắt"}
                  </button>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex justify-end items-center gap-2">
                    <button onClick={() => openEditForm(p)} className="text-stone-400 hover:text-amber-700">
                      <Pencil size={15} />
                    </button>
                    {p.id === "p0" ? (
                      <span className="text-[11px] text-stone-300 px-1">Mặc định</span>
                    ) : (
                      <button onClick={() => onRemove(p.id)} className="text-stone-400 hover:text-red-600">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-stone-400">
        Khuyến mãi ở trạng thái "Đang áp dụng" sẽ hiện ngay trong danh sách chọn khuyến mãi ở màn hình Thu ngân khi lập hoá đơn. Tắt (không cần xoá) nếu muốn ngừng áp dụng tạm thời.
      </div>
    </div>
  );
}
