import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "data", "coffeeshop.db");

for (const suffix of ["", "-wal", "-shm"]) {
  const p = DB_PATH + suffix;
  if (fs.existsSync(p)) fs.unlinkSync(p);
}
console.log("✔ Đã xoá cơ sở dữ liệu cũ. Khởi động lại server (npm run dev) để nạp dữ liệu mẫu mới.");
