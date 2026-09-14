const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

function buildSystemPrompt(menu) {
  const menuLines = menu.map((m) => `- ${m.name} (${m.price.toLocaleString("vi-VN")}đ): ${m.description || ""}`).join("\n");
  return `Bạn là trợ lý ảo thân thiện của quán cà phê "Cà Phê Ẩn". Nhiệm vụ của bạn là tư vấn đồ uống/bánh cho khách.
Thực đơn hiện tại của quán CHỈ CÓ các món sau, tuyệt đối không bịa thêm món khác:
${menuLines}

Quy tắc trả lời:
- Ngắn gọn (dưới 60 từ), thân thiện, có thể dùng emoji.
- CHỈ gợi ý món có trong danh sách trên.
- Nếu khách gửi kèm một bức ảnh: hãy quan sát và phán đoán tâm trạng/không khí trong ảnh, rồi chọn MỘT món phù hợp nhất, giải thích ngắn gọn lý do.`;
}

async function callGemini({ message, imageBase64, mimeType, menu }) {
  const apiKey = process.env.GEMINI_API_KEY;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const parts = [];
  if (message) parts.push({ text: message });
  if (imageBase64) {
    if (!message) parts.push({ text: "Hãy phân tích hình ảnh này và gợi ý đồ uống/bánh phù hợp nhé!" });
    parts.push({ inlineData: { mimeType: mimeType || "image/jpeg", data: imageBase64 } });
  }

  const payload = {
    contents: [{ role: "user", parts }],
    systemInstruction: { parts: [{ text: buildSystemPrompt(menu) }] },
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message || "Lỗi gọi Gemini API");

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini không trả về nội dung hợp lệ");
  return text;
}

function fallbackSuggest({ message, imageBase64, menu }) {
  const q = (message || "").toLowerCase();

  if (imageBase64 && !message) {
    return "Mình chưa thể phân tích hình ảnh ở chế độ rút gọn (chưa cấu hình GEMINI_API_KEY trên server). Bạn mô tả cảm xúc/thời tiết hiện tại bằng chữ giúp mình nhé! 😊";
  }

  const rules = [
    { keys: ["mệt", "buồn ngủ", "tỉnh táo"], pick: (m) => m.find((x) => /cà phê đen|espresso/i.test(x.name)) },
    { keys: ["nóng", "giải nhiệt", "khát"], pick: (m) => m.find((x) => /nước ép|trà đào/i.test(x.name)) },
    { keys: ["buồn", "chán", "stress", "căng thẳng"], pick: (m) => m.find((x) => /bạc xỉu|tiramisu/i.test(x.name)) },
    { keys: ["ngọt", "đói", "bánh"], pick: (m) => m.find((x) => /bánh/i.test(x.name)) },
  ];

  for (const rule of rules) {
    if (rule.keys.some((k) => q.includes(k))) {
      const item = rule.pick(menu);
      if (item) return `Mình gợi ý bạn thử "${item.name}" (${item.price.toLocaleString("vi-VN")}đ) — ${item.description} 🌟`;
    }
  }

  const fallbackItem = menu[Math.floor(Math.random() * menu.length)];
  return fallbackItem
    ? `Bạn có thể thử "${fallbackItem.name}" (${fallbackItem.price.toLocaleString("vi-VN")}đ) — ${fallbackItem.description} ☕`
    : "Quán hiện chưa có món nào khả dụng, bạn quay lại sau nhé!";
}

export async function suggestFromAI({ message, imageBase64, mimeType, menu }) {
  if (process.env.GEMINI_API_KEY) {
    try {
      const reply = await callGemini({ message, imageBase64, mimeType, menu });
      return { reply, mode: "gemini" };
    } catch (e) {
      console.warn("Gemini lỗi, chuyển sang fallback:", e.message);
      return { reply: fallbackSuggest({ message, imageBase64, menu }), mode: "fallback" };
    }
  }
  return { reply: fallbackSuggest({ message, imageBase64, menu }), mode: "fallback" };
}
