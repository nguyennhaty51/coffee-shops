import { useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import { money } from "../utils/format.js";

export default function MenuManage({ menu, cats, onAdd, onToggleStatus, onRemove }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [catId, setCatId] = useState(cats[0].id);
  const [description, setDescription] = useState("");

  function submit() {
    if (!name || !price) return;
    onAdd({ name, price, catId, description });
    setName("");
    setPrice("");
    setDescription("");
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-stone-500">{menu.length} món trong thực đơn</div>
        <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1.5 bg-amber-700 text-white text-sm px-3.5 py-2 rounded-lg hover:bg-amber-800">
          <PlusCircle size={15} /> Thêm món mới
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-xs text-stone-500 block mb-1">Tên món</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="w-full sm:w-40">
              <label className="text-xs text-stone-500 block mb-1">Danh mục</label>
              <select value={catId} onChange={(e) => setCatId(e.target.value)} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm">
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-32">
              <label className="text-xs text-stone-500 block mb-1">Giá bán</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs text-stone-500 block mb-1">Mô tả ngắn (hiển thị ở trang đặt món QR)</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="text-[11px] text-stone-400">
            Ảnh minh hoạ món chưa hỗ trợ tải lên qua giao diện demo — món mới sẽ hiển thị khung trống, bạn có thể thêm ảnh trực tiếp trong thư mục
            <code className="mx-1 bg-stone-100 px-1 rounded">client/public/images/menu</code> và cập nhật cột <code className="bg-stone-100 px-1 rounded">image</code> trong CSDL.
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
              <th className="text-left px-4 py-2.5"></th>
              <th className="text-left px-4 py-2.5">Tên món</th>
              <th className="text-left px-4 py-2.5">Danh mục</th>
              <th className="text-left px-4 py-2.5">Giá bán</th>
              <th className="text-left px-4 py-2.5">Trạng thái</th>
              <th className="text-right px-4 py-2.5">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {menu.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-2">
                  {m.image ? (
                    <img src={`/images/menu/${m.image}`} alt={m.name} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-stone-100" />
                  )}
                </td>
                <td className="px-4 py-2.5 text-stone-800">{m.name}</td>
                <td className="px-4 py-2.5 text-stone-500">{cats.find((c) => c.id === m.catId)?.name}</td>
                <td className="px-4 py-2.5 text-stone-600">{money(m.price)}</td>
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => onToggleStatus(m.id)}
                    className={`text-xs px-2 py-1 rounded-full ${m.status === "available" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}
                  >
                    {m.status === "available" ? "Còn hàng" : "Hết hàng"}
                  </button>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={() => onRemove(m.id)} className="text-stone-400 hover:text-red-600">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
