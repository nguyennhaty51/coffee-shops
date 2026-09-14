import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Minus, ShoppingCart, X, ArrowLeft, MapPin, Star, CheckCircle2, RefreshCw } from "lucide-react";
import { money } from "../utils/format.js";
import AiChatWidget from "../components/AiChatWidget.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Trang khách hàng quét mã QR dán tại bàn để xem thực đơn và tự đặt món.
// KHÔNG cần đăng nhập — gọi các API công khai (/api/public/*). Khi có tableId
// (lấy từ query string ?table=... trong link QR), khách đặt món thẳng vào order
// của đúng bàn đó; nếu không có tableId thì chỉ xem được thực đơn (chế độ xem trước).
// Bố cục dạng "app di động" (max-w-md căn giữa) nhưng vẫn co giãn tốt trên tablet/desktop.
export default function PublicOrderMenu({ tableId, onBack }) {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [menu, setMenu] = useState([]);
  const [table, setTable] = useState(null);
  const [tableError, setTableError] = useState(null);

  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [cart, setCart] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [phone, setPhone] = useState("");
  const [lookup, setLookup] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/public/menu`)
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.categories);
        setMenu(d.menu);
      })
      .finally(() => setLoading(false));

    if (tableId) {
      fetch(`${API_BASE}/api/public/tables/${tableId}`)
        .then((r) => {
          if (!r.ok) throw new Error("not found");
          return r.json();
        })
        .then(setTable)
        .catch(() => setTableError("Mã QR không hợp lệ hoặc bàn không tồn tại."));
    }
  }, [tableId]);

  const filteredMenu = useMemo(() => {
    return menu.filter((m) => {
      const matchCat = activeCat === "all" || m.catId === activeCat;
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menu, activeCat, search]);

  const grouped = useMemo(() => {
    const map = {};
    filteredMenu.forEach((m) => {
      map[m.catId] = map[m.catId] || [];
      map[m.catId].push(m);
    });
    return categories.filter((c) => map[c.id]?.length).map((c) => ({ ...c, items: map[c.id] }));
  }, [filteredMenu, categories]);

  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);
  const cartTotal = Object.entries(cart).reduce((s, [id, qty]) => {
    const m = menu.find((x) => x.id === id);
    return s + (m ? m.price * qty : 0);
  }, 0);

  function addToCart(id) {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }
  function changeCartQty(id, delta) {
    setCart((prev) => {
      const next = { ...prev };
      const qty = (next[id] || 0) + delta;
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  }

  async function submitOrder() {
    setSubmitting(true);
    try {
      const items = Object.entries(cart).map(([menuId, qty]) => ({ menuId, qty }));
      const res = await fetch(`${API_BASE}/api/public/tables/${tableId}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Gửi order thất bại");
      setSubmitted(true);
      setCart({});
      setShowCart(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function checkPoints() {
    if (!phone) return;
    setLookup(null);
    const res = await fetch(`${API_BASE}/api/public/loyalty-lookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    setLookup(res.ok ? await res.json() : "not_found");
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-stone-100 text-stone-500 gap-2">
        <RefreshCw size={18} className="animate-spin" /> Đang tải thực đơn...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-stone-100 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen relative shadow-xl pb-28">
        <header className="bg-white sticky top-0 z-10 px-4 py-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div>
              <button onClick={onBack} className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 mb-1">
                <ArrowLeft size={12} /> Quay lại
              </button>
              <h1 className="text-lg font-serif font-bold text-stone-800">Cà Phê Ẩn</h1>
              <p className="text-xs text-stone-500 flex items-center gap-1">
                <MapPin size={11} className="text-red-500" /> Chi nhánh Quận 1
              </p>
            </div>
            {tableId && table && (
              <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-semibold text-sm border border-amber-200">
                Bàn: {table.name}
              </div>
            )}
          </div>

          {tableError && <div className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-2">{tableError}</div>}
          {!tableId && (
            <div className="text-xs text-stone-500 bg-stone-50 rounded-lg px-3 py-2 mb-2">
              Bạn đang xem thực đơn ở chế độ xem trước — quét mã QR tại bàn để có thể đặt món trực tiếp nhé.
            </div>
          )}

          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Tìm kiếm món ăn, đồ uống..."
              className="w-full bg-stone-100 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <Search size={15} className="absolute left-3 top-2.5 text-stone-400" />
          </div>
        </header>

        <div className="px-4 py-3 flex gap-2 overflow-x-auto border-b border-stone-100">
          <button
            onClick={() => setActiveCat("all")}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium ${
              activeCat === "all" ? "bg-amber-600 text-white shadow-sm" : "bg-stone-100 text-stone-600"
            }`}
          >
            Tất cả
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium ${
                activeCat === c.id ? "bg-amber-600 text-white shadow-sm" : "bg-stone-100 text-stone-600"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="px-4 py-3 border-b border-stone-100">
          <div className="flex gap-2">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && checkPoints()}
              placeholder="SĐT tra điểm thành viên"
              className="flex-1 bg-stone-100 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button onClick={checkPoints} className="px-3 py-1.5 bg-stone-800 text-white text-xs rounded-lg shrink-0">
              Tra cứu
            </button>
          </div>
          {lookup === "not_found" && <div className="text-[11px] text-stone-400 mt-1.5">Chưa có tài khoản thành viên với SĐT này.</div>}
          {lookup && lookup !== "not_found" && (
            <div className="text-[11px] text-amber-700 mt-1.5 flex items-center gap-1">
              <Star size={11} className="fill-amber-500 text-amber-500" /> {lookup.name} — {lookup.points} điểm
            </div>
          )}
        </div>

        <div className="px-4 py-4 space-y-5">
          {grouped.length === 0 && <div className="text-sm text-stone-400 text-center py-10">Không tìm thấy món phù hợp.</div>}
          {grouped.map((cat) => (
            <div key={cat.id} className="space-y-3">
              <h2 className="font-bold text-base text-stone-800">{cat.name}</h2>
              {cat.items.map((m) => (
                <div key={m.id} className={`flex items-center gap-3 bg-white p-3 rounded-xl border border-stone-100 shadow-sm ${m.status === "out" ? "opacity-50" : ""}`}>
                  {m.image && <img src={`/images/menu/${m.image}`} alt={m.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-stone-800 text-sm">{m.name}</h3>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-0.5">{m.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold text-amber-700 text-sm">{money(m.price)}</span>
                      {m.status === "out" ? (
                        <span className="text-[10px] text-red-500 font-medium">Hết hàng</span>
                      ) : tableId ? (
                        <button
                          onClick={() => addToCart(m.id)}
                          className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center hover:bg-amber-700 active:scale-95 transition"
                        >
                          <Plus size={14} />
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {tableId && cartCount > 0 && !showCart && (
          <div className="fixed md:absolute bottom-0 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-0 w-full max-w-md bg-white px-4 py-4 border-t border-stone-200 shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.08)] rounded-t-2xl z-20">
            <button
              onClick={() => setShowCart(true)}
              className="w-full bg-amber-600 rounded-xl p-3 flex justify-between items-center text-white hover:bg-amber-700 transition"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingCart size={20} />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-amber-600">
                    {cartCount}
                  </span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">Giỏ hàng</span>
                  <span className="text-xs text-amber-100">{cartCount} món đang chọn</span>
                </div>
              </div>
              <span className="font-bold text-base">{money(cartTotal)}</span>
            </button>
          </div>
        )}

        {showCart && (
          <div className="fixed inset-0 bg-black/50 z-30 flex items-end justify-center">
            <div className="bg-white w-full max-w-md max-h-[80vh] rounded-t-3xl flex flex-col shadow-2xl">
              <div className="flex justify-between items-center p-4 border-b border-stone-100">
                <div className="font-serif text-lg text-stone-800">Giỏ hàng của bạn</div>
                <button onClick={() => setShowCart(false)} className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center text-stone-500">
                  <X size={15} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {Object.entries(cart).map(([id, qty]) => {
                  const m = menu.find((x) => x.id === id);
                  if (!m) return null;
                  return (
                    <div key={id} className="flex items-center gap-3">
                      {m.image && <img src={`/images/menu/${m.image}`} alt={m.name} className="w-12 h-12 rounded-lg object-cover" />}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-stone-800 truncate">{m.name}</div>
                        <div className="text-xs text-amber-700">{money(m.price)}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => changeCartQty(id, -1)} className="w-7 h-7 bg-stone-100 rounded-full flex items-center justify-center">
                          <Minus size={12} />
                        </button>
                        <span className="text-sm w-4 text-center">{qty}</span>
                        <button onClick={() => changeCartQty(id, 1)} className="w-7 h-7 bg-stone-100 rounded-full flex items-center justify-center">
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-4 border-t border-stone-100">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-stone-500">Tổng cộng</span>
                  <span className="font-bold text-stone-800">{money(cartTotal)}</span>
                </div>
                <button
                  onClick={submitOrder}
                  disabled={submitting}
                  className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white py-3 rounded-xl text-sm font-medium"
                >
                  {submitting ? "Đang gửi..." : "Gửi yêu cầu gọi món"}
                </button>
              </div>
            </div>
          </div>
        )}

        {submitted && (
          <div className="fixed inset-x-4 bottom-24 md:absolute z-30 bg-emerald-600 text-white rounded-xl p-3 flex items-center gap-2 shadow-lg">
            <CheckCircle2 size={18} />
            <div className="text-sm">
              Đã gửi yêu cầu tới nhân viên! Đơn của bạn sẽ được xác nhận và pha chế sớm nhất.
              <button onClick={() => setSubmitted(false)} className="ml-2 underline text-emerald-100">
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>

      <AiChatWidget />
    </div>
  );
}
