import { useState } from "react";
import { Search, PlusCircle, Star } from "lucide-react";

export default function LoyaltyView({ customers, onAdd }) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  function submit() {
    if (!name || !phone) return;
    onAdd({ name, phone });
    setName("");
    setPhone("");
    setShowForm(false);
  }

  const filtered = customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc SĐT..."
            className="w-full border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1.5 bg-amber-700 text-white text-sm px-3.5 py-2 rounded-lg hover:bg-amber-800">
          <PlusCircle size={15} /> Đăng ký thành viên
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-stone-200 rounded-xl p-4 flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs text-stone-500 block mb-1">Họ tên khách hàng</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="w-44">
            <label className="text-xs text-stone-500 block mb-1">Số điện thoại</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <button onClick={submit} className="bg-stone-900 text-white text-sm px-4 py-2 rounded-lg">
            Lưu
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div key={c.id} className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-semibold">{c.name[0]}</div>
            <div className="flex-1">
              <div className="text-sm font-medium text-stone-800">{c.name}</div>
              <div className="text-xs text-stone-400">{c.phone}</div>
            </div>
            <div className="flex items-center gap-1 text-amber-700 font-semibold text-sm">
              <Star size={14} className="fill-amber-500 text-amber-500" /> {c.points}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
