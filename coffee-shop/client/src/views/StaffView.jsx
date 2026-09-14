import { useState } from "react";
import { PlusCircle } from "lucide-react";

export default function StaffView({ staff, onAdd, onToggleActive }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [roleName, setRoleName] = useState("Nhân viên phục vụ");
  const [phone, setPhone] = useState("");

  function submit() {
    if (!name || !phone) return;
    onAdd({ name, role: roleName, phone });
    setName("");
    setPhone("");
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-stone-500">{staff.length} nhân viên</div>
        <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1.5 bg-amber-700 text-white text-sm px-3.5 py-2 rounded-lg hover:bg-amber-800">
          <PlusCircle size={15} /> Thêm nhân viên
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-stone-200 rounded-xl p-4 flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs text-stone-500 block mb-1">Họ tên</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="w-40">
            <label className="text-xs text-stone-500 block mb-1">Vai trò</label>
            <select value={roleName} onChange={(e) => setRoleName(e.target.value)} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm">
              {["Quản lý", "Nhân viên phục vụ", "Nhân viên thu ngân", "Nhân viên pha chế", "Nhân viên kho"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="w-40">
            <label className="text-xs text-stone-500 block mb-1">Số điện thoại</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <button onClick={submit} className="bg-stone-900 text-white text-sm px-4 py-2 rounded-lg">
            Lưu
          </button>
        </div>
      )}

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead className="bg-stone-50 text-stone-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2.5">Họ tên</th>
              <th className="text-left px-4 py-2.5">Vai trò</th>
              <th className="text-left px-4 py-2.5">SĐT</th>
              <th className="text-left px-4 py-2.5">Trạng thái</th>
              <th className="text-right px-4 py-2.5">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {staff.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-2.5 text-stone-800">{s.name}</td>
                <td className="px-4 py-2.5 text-stone-500">{s.role}</td>
                <td className="px-4 py-2.5 text-stone-500">{s.phone}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs px-2 py-1 rounded-full ${s.active ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>
                    {s.active ? "Đang làm việc" : "Đã khoá"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={() => onToggleActive(s.id)} className="text-xs px-2.5 py-1 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50">
                    {s.active ? "Khoá" : "Mở khoá"}
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
