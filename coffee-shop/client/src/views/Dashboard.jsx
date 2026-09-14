import { Wallet, LayoutGrid, Receipt, AlertTriangle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { money } from "../utils/format.js";
import EmptyHint from "../components/EmptyHint.jsx";

export default function Dashboard({ todayRevenue, tables, lowStock, orders, revenueByCategory, topSellers, invoices }) {
  const openOrders = orders.filter((o) => o.status === "open");
  const serving = tables.filter((t) => t.status === "serving").length;

  const kpis = [
    { label: "Doanh thu phiên này", value: money(todayRevenue), icon: Wallet, color: "text-amber-700 bg-amber-50" },
    { label: "Bàn đang phục vụ", value: `${serving} / ${tables.length}`, icon: LayoutGrid, color: "text-emerald-700 bg-emerald-50" },
    { label: "Order đang mở", value: openOrders.length, icon: Receipt, color: "text-sky-700 bg-sky-50" },
    { label: "Cảnh báo tồn kho", value: lowStock.length, icon: AlertTriangle, color: "text-red-700 bg-red-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="bg-white rounded-xl border border-stone-200 p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${k.color}`}>
              <k.icon size={18} />
            </div>
            <div className="text-2xl font-semibold text-stone-800">{k.value}</div>
            <div className="text-xs text-stone-500 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 p-5">
          <div className="font-serif text-base text-stone-800 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-amber-700" /> Doanh thu theo danh mục (phiên này)
          </div>
          {invoices.length === 0 ? (
            <EmptyHint text="Chưa có hoá đơn nào trong phiên demo này. Hãy thử tạo order và thanh toán ở mục Sơ đồ bàn." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenueByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#78716C" />
                <YAxis tick={{ fontSize: 11 }} stroke="#78716C" tickFormatter={(v) => v / 1000 + "k"} />
                <Tooltip formatter={(v) => money(v)} />
                <Bar dataKey="revenue" fill="#B45309" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="font-serif text-base text-stone-800 mb-4">Món bán chạy nhất</div>
          {topSellers.length === 0 ? (
            <EmptyHint text="Chưa có dữ liệu bán hàng." />
          ) : (
            <div className="space-y-3">
              {topSellers.map((t, i) => (
                <div key={t.menuId} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div className="flex-1 text-sm text-stone-700">{t.name}</div>
                  <div className="text-sm font-medium text-stone-800">{t.qty} ly</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
