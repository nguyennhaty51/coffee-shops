import "dotenv/config";
import "./db.js";
import { createApp } from "./app.js";

const PORT = process.env.PORT || 4000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`\n☕  Coffee Shop API đang chạy tại http://localhost:${PORT}`);
  console.log(`    Kiểm tra nhanh: http://localhost:${PORT}/api/health\n`);
});
