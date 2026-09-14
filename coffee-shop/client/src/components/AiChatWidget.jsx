import { useState, useRef } from "react";
import { MessageCircle, X, Sparkles, Send, Image as ImageIcon } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Trợ lý AI công khai cho khách quét QR: gợi ý món theo tin nhắn hoặc theo ảnh
// khách gửi lên. Gọi tới backend (POST /api/public/ai-suggest) — backend mới là
// nơi thật sự gọi Gemini bằng API key riêng, trình duyệt không bao giờ thấy API key.
export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Xin chào! Mình là trợ lý AI của quán ☕ Bạn đang muốn uống gì, hoặc gửi mình một tấm ảnh để mình đoán tâm trạng và gợi ý món nhé!" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState(null);
  const fileInputRef = useRef(null);

  async function send(text, imageFile) {
    if (!text && !imageFile) return;
    setSending(true);

    let previewUrl = null;
    let imageBase64 = null;
    let mimeType = null;

    if (imageFile) {
      previewUrl = URL.createObjectURL(imageFile);
      const dataUrl = await fileToDataUrl(imageFile);
      imageBase64 = dataUrl.split(",")[1];
      mimeType = imageFile.type;
    }

    setMessages((prev) => [...prev, { from: "user", text: text || "Gợi ý giúp mình dựa trên ảnh này nhé!", image: previewUrl }]);
    setInput("");

    try {
      const res = await fetch(`${API_BASE}/api/public/ai-suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, imageBase64, mimeType }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Có lỗi xảy ra");
      setMessages((prev) => [...prev, { from: "bot", text: body.reply }]);
      setMode(body.mode);
    } catch (e) {
      setMessages((prev) => [...prev, { from: "bot", text: `Xin lỗi, mình gặp sự cố: ${e.message}` }]);
    } finally {
      setSending(false);
    }
  }

  function handleImagePick(e) {
    const file = e.target.files?.[0];
    if (file) send(input.trim(), file);
    e.target.value = "";
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-red-500 text-white shadow-lg flex items-center justify-center z-40"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-4 left-4 sm:left-auto sm:w-96 h-[70vh] max-h-[520px] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col z-40 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-white px-4 py-3 flex items-center gap-2 border-b border-stone-100">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 relative">
              <Sparkles size={16} />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <div className="text-sm font-semibold text-stone-800">Trợ lý gọi món AI</div>
              <div className="text-[11px] text-stone-400">
                {mode === "gemini" ? "Đang dùng Gemini AI" : mode === "fallback" ? "Chế độ gợi ý rút gọn" : "Tư vấn chọn món"}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-stone-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`text-sm max-w-[80%] px-3 py-2 rounded-2xl leading-relaxed ${
                    m.from === "bot" ? "bg-white text-stone-700 border border-stone-100 rounded-tl-sm" : "bg-amber-600 text-white rounded-tr-sm"
                  }`}
                >
                  {m.text}
                  {m.image && <img src={m.image} alt="Ảnh đã gửi" className="mt-2 rounded-lg max-w-[180px]" />}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white border border-stone-100 rounded-2xl rounded-tl-sm px-4 py-2.5 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            )}
          </div>

          <div className="p-2 border-t border-stone-100 bg-white flex items-center gap-1.5">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
              title="Gửi hình ảnh"
              className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-100 disabled:opacity-50"
            >
              <ImageIcon size={17} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !sending && send(input.trim())}
              placeholder="Nhắn tin cho trợ lý..."
              disabled={sending}
              className="flex-1 border border-stone-300 rounded-full px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
            />
            <button
              onClick={() => send(input.trim())}
              disabled={sending || !input.trim()}
              className="w-9 h-9 shrink-0 bg-amber-700 text-white rounded-full flex items-center justify-center disabled:opacity-50"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
