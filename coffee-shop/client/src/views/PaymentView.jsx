import { useState, useEffect } from "react";
import { CreditCard, QrCode, Loader2 } from "lucide-react";
import { money } from "../utils/format.js";
import EmptyHint from "../components/EmptyHint.jsx";

export default function PaymentView({ orders, tables, menu, customers, promos, onCheckout, onGetPaymentQr }) {
  const [selected, setSelected] = useState(null);
  const [promoId, setPromoId] = useState("p0");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState("Tiền mặt");
  const [qr, setQr] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  const order = orders.find((o) => o.id === selected);
  const customer = customers.find((c) => c.phone === phone);
  const needsQr = method === "Chuyển khoản" || method === "Ví điện tử";

  const subtotalOfOrder = order
    ? order.items.reduce((s, it) => s + it.qty * (menu.find((m) => m.id === it.menuId)?.price || 0), 0)
    : 0;
  // Chỉ hiện các khuyến mãi đang bật (active — do Admin/Quản lý cấu hình ở mục Khuyến mãi)
  // và đủ điều kiện hoá đơn tối thiểu cho order đang chọn. "p0" (Không áp dụng) luôn hiện.
  const eligiblePromos = promos.filter((p) => p.id === "p0" || subtotalOfOrder >= p.min);

  useEffect(() => {
    if (!eligiblePromos.find((p) => p.id === promoId)) setPromoId("p0");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id, promos]);

  useEffect(() => {
    setQr(null);
    if (!order || !needsQr) return;
    let cancelled = false;
    setQrLoading(true);
    onGetPaymentQr(order.id, promoId).then((result) => {
      if (!cancelled) {
        setQr(result);
        setQrLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id, promoId, method]);

  if (orders.length === 0) return <EmptyHint text="Không có order nào đang mở để thanh toán." />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="space-y-2">
        {orders.map((o) => {
          const t = tables.find((tt) => tt.id === o.tableId);
          const sub = o.items.reduce((s, it) => s + it.qty * (menu.find((m) => m.id === it.menuId)?.price || 0), 0);
          return (
            <button
              key={o.id}
              onClick={() => {
                setSelected(o.id);
                setPromoId("p0");
                setPhone("");
                setMethod("Tiền mặt");
              }}
              className={`w-full text-left p-3.5 rounded-xl border bg-white transition-colors ${
                selected === o.id ? "border-amber-500 ring-1 ring-amber-300" : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="font-medium text-stone-800">Bàn {t.name}</div>
                <div className="text-sm text-stone-600">{money(sub)}</div>
              </div>
              <div className="text-xs text-stone-400 mt-1">{o.items.length} món</div>
            </button>
          );
        })}
      </div>

      <div className="lg:col-span-2">
        {!order ? (
          <EmptyHint text="Chọn một order bên trái để lập hoá đơn thanh toán." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
              <div className="font-serif text-lg">Hoá đơn — Bàn {tables.find((t) => t.id === order.tableId).name}</div>

              <div className="divide-y divide-stone-100">
                {order.items.map((it, idx) => {
                  const m = menu.find((mm) => mm.id === it.menuId);
                  return (
                    <div key={idx} className="flex justify-between py-1.5 text-sm">
                      <span className="text-stone-600">
                        {m?.name} x{it.qty}
                      </span>
                      <span className="text-stone-800">{money(m.price * it.qty)}</span>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="text-xs text-stone-500 mb-1 block">Số điện thoại khách hàng (tuỳ chọn — tích điểm)</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09xxxxxxxx"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {phone &&
                  (customer ? (
                    <div className="text-xs text-emerald-600 mt-1">
                      Thành viên: {customer.name} — {customer.points} điểm hiện có
                    </div>
                  ) : (
                    <div className="text-xs text-stone-400 mt-1">Không tìm thấy khách hàng thân thiết với SĐT này</div>
                  ))}
              </div>

              <div>
                <label className="text-xs text-stone-500 mb-1 block">Khuyến mãi áp dụng</label>
                <select
                  value={promoId}
                  onChange={(e) => setPromoId(e.target.value)}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {eligiblePromos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {promos.some((p) => p.id !== "p0" && subtotalOfOrder < p.min) && (
                  <div className="text-[11px] text-stone-400 mt-1">
                    Một số khuyến mãi khác chưa đủ điều kiện hoá đơn tối thiểu cho order này.
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-stone-500 mb-1 block">Hình thức thanh toán</label>
                <div className="flex flex-wrap gap-2">
                  {["Tiền mặt", "Chuyển khoản", "Ví điện tử"].map((mth) => (
                    <button
                      key={mth}
                      onClick={() => setMethod(mth)}
                      className={`px-3 py-1.5 rounded-lg text-sm border ${
                        method === mth ? "bg-stone-900 text-white border-stone-900" : "border-stone-300 text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      {mth}
                    </button>
                  ))}
                </div>
              </div>

              {(() => {
                const subtotal = order.items.reduce((s, it) => s + it.qty * (menu.find((m) => m.id === it.menuId)?.price || 0), 0);
                const promo = promos.find((p) => p.id === promoId);
                const discount = subtotal * (promo.percent / 100);
                const total = subtotal - discount;
                return (
                  <div className="border-t border-stone-200 pt-3 space-y-1 text-sm">
                    <div className="flex justify-between text-stone-500">
                      <span>Tạm tính</span>
                      <span>{money(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-stone-500">
                      <span>Giảm giá</span>
                      <span>-{money(discount)}</span>
                    </div>
                    <div className="flex justify-between text-base font-semibold text-stone-800 pt-1">
                      <span>Tổng thanh toán</span>
                      <span>{money(total)}</span>
                    </div>
                  </div>
                );
              })()}

              <button
                onClick={() => onCheckout(order.id, { promoId, customerPhone: phone, method })}
                className="w-full bg-amber-700 hover:bg-amber-800 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                <CreditCard size={16} /> Xác nhận thanh toán
              </button>
            </div>

            {needsQr && (
              <div className="bg-white rounded-xl border border-stone-200 p-5 flex flex-col items-center text-center">
                <div className="flex items-center gap-1.5 text-sm font-medium text-stone-700 mb-3">
                  <QrCode size={15} className="text-amber-700" /> Quét mã để {method.toLowerCase()}
                </div>
                {qrLoading && (
                  <div className="w-56 h-56 flex items-center justify-center text-stone-400">
                    <Loader2 size={22} className="animate-spin" />
                  </div>
                )}
                {!qrLoading && qr && (
                  <>
                    <img src={qr.qrDataUrl} alt="Mã QR thanh toán" className="w-56 h-56 rounded-lg border border-stone-100" />
                    <div className="text-lg font-semibold text-stone-800 mt-3">{money(qr.amount)}</div>
                    <div className="text-[11px] text-stone-400 mt-2 whitespace-pre-line leading-relaxed">{qr.content}</div>
                    <div className="text-[11px] text-amber-600 mt-3 bg-amber-50 rounded-lg px-2.5 py-1.5">
                      Mã QR minh hoạ cho mục đích demo đồ án — không phải cổng thanh toán ngân hàng thật.
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
