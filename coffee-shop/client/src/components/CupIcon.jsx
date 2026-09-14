// Biểu tượng ly cà phê thể hiện trạng thái bàn (rỗng / đang phục vụ / đã đặt trước)
// Đây là điểm nhấn hình ảnh xuyên suốt hệ thống thay cho chấm màu thông thường.
export default function CupIcon({ status, size = 34 }) {
  const fillColor = status === "serving" ? "#B45309" : "#D6D3D1";
  const strokeColor = status === "reserved" ? "#78716C" : "#57534E";
  const dash = status === "reserved" ? "3 3" : "0";

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path
        d="M9 15 H27 L25 32 A3 3 0 0 1 22 35 H14 A3 3 0 0 1 11 32 Z"
        stroke={strokeColor}
        strokeWidth="2"
        strokeDasharray={dash}
        fill="white"
      />
      {status === "serving" && (
        <path d="M11.3 24 H24.7 L24 30 A2 2 0 0 1 22 32 H14 A2 2 0 0 1 12 30 Z" fill={fillColor} />
      )}
      <path d="M27 18 C31 18 31 24 27 24" stroke={strokeColor} strokeWidth="2" fill="none" />
      {status === "serving" && (
        <>
          <path d="M15 10 C15 12 17 12 17 14" stroke="#D6D3D1" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M20 10 C20 12 22 12 22 14" stroke="#D6D3D1" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
