import { useState } from "react";
import { MessageCircle, X, Sparkles, Send } from "lucide-react";
import { money } from "../utils/format.js";

// Trợ lý ảo dạng luật từ khoá đơn giản, trả lời dựa trên dữ liệu thật của app.
// Khi tích hợp AI thật (VD: Google Gemini API), chỉ cần thay hàm `reply()`
// bằng lời gọi API, giữ nguyên phần giao diện bên dưới.
export default function ChatWidget({ menu, lowStock, todayRevenue, topSellers }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Xin chào! Mình là trợ lý ảo của quán. Bạn có thể hỏi về món, giá, doanh thu hoặc tồn kho nguyên liệu." },
  ]);
  const [input, setInput] = useState("");

  function reply(text) {
    const q = text.toLowerCase();
    const found = menu.find((m) => q.includes(m.name.toLowerCase()));
    if (found) {
      return `${found.name} có giá ${money(found.price)}, hiện đang ${found.status === "available" ? "còn hàng" : "tạm hết hàng"}.`;
    }
    if (q.includes("doanh thu")) {
      return `Doanh thu trong phiên demo hiện tại là ${money(todayRevenue)}.`;
    }
    if (q.includes("bán chạy")) {
      if (topSellers.length === 0) return "Chưa có dữ liệu bán hàng trong phiên này.";
      return "Món bán chạy nhất hiện tại: " + topSellers.map((t) => `${t.name} (${t.qty} ly)`).join(", ") + ".";
    }
    if (q.includes("tồn kho") || q.includes("nguyên liệu") || q.includes("hết hàng")) {
      if (lowStock.length === 0) return "Hiện tại tất cả nguyên liệu đều ở mức ổn định.";
      return "Nguyên liệu sắp hết: " + lowStock.map((i) => `${i.name} (còn ${i.stock} ${i.unit})`).join(", ") + ".";
    }
    if (q.includes("menu") || q.includes("thực đơn")) {
      return "Quán có các danh mục: Cà phê, Trà, Nước ép, Bánh ngọt. Bạn muốn xem món nào cụ thể?";
    }
    return "Mình chưa có thông tin chính xác cho câu hỏi này. Bạn thử hỏi về tên món, doanh thu, món bán chạy hoặc tồn kho nguyên liệu nhé.";
  }

  function send(text) {
    const t = (text ?? input).trim();
    if (!t) return;
    setMessages((prev) => [...prev, { from: "user", text: t }, { from: "bot", text: reply(t) }]);
    setInput("");
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-amber-700 hover:bg-amber-800 text-white shadow-lg flex items-center justify-center z-40"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-xl shadow-2xl border border-stone-200 flex flex-col z-40 overflow-hidden">
          <div className="bg-stone-900 text-white px-4 py-3 flex items-center gap-2">
            <Sparkles size={15} className="text-amber-400" />
            <div className="text-sm font-medium">Trợ lý AI — Cà Phê Ẩn</div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm max-w-[85%] px-3 py-2 rounded-lg ${
                  m.from === "bot" ? "bg-stone-100 text-stone-700" : "bg-amber-700 text-white ml-auto"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>
          <div className="p-2 flex flex-wrap gap-1.5 border-t border-stone-100">
            {["Doanh thu hôm nay?", "Món bán chạy?", "Tồn kho nguyên liệu?"].map((q) => (
              <button key={q} onClick={() => send(q)} className="text-[11px] px-2 py-1 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
                {q}
              </button>
            ))}
          </div>
          <div className="p-2 border-t border-stone-100 flex gap-1.5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Nhập câu hỏi..."
              className="flex-1 border border-stone-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button onClick={() => send()} className="bg-amber-700 text-white px-3 rounded-lg">
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
