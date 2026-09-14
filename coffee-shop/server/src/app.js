import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import stateRoutes from "./routes/state.js";
import tableRoutes from "./routes/tables.js";
import orderRoutes from "./routes/orders.js";
import menuRoutes from "./routes/menu.js";
import ingredientRoutes from "./routes/ingredients.js";
import staffRoutes from "./routes/staff.js";
import customerRoutes from "./routes/customers.js";
import promoRoutes from "./routes/promos.js";
import authRoutes from "./routes/auth.js";
import publicRoutes from "./routes/public.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "8mb" })); // đủ lớn để nhận ảnh base64 gửi kèm chat AI

  app.get("/api/health", (req, res) => res.json({ ok: true, service: "coffee-shop-server" }));

  // Không yêu cầu đăng nhập
  app.use("/api/auth", authRoutes);
  app.use("/api/public", publicRoutes);

  // Yêu cầu đăng nhập + phân quyền theo vai trò (kiểm tra bên trong từng router)
  app.use("/api/state", stateRoutes);
  app.use("/api/tables", tableRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/menu", menuRoutes);
  app.use("/api/ingredients", ingredientRoutes);
  app.use("/api/staff", staffRoutes);
  app.use("/api/customers", customerRoutes);
  app.use("/api/promos", promoRoutes);

  // Nếu đã build frontend (client/dist), server tự phục vụ luôn giao diện —
  // cho phép triển khai chỉ với MỘT server duy nhất.
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const clientDist = path.join(__dirname, "..", "..", "client", "dist");
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get(/^(?!\/api).*/, (req, res) => {
      res.sendFile(path.join(clientDist, "index.html"));
    });
    console.log("→ Đang phục vụ giao diện frontend tĩnh từ:", clientDist);
  }

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  });

  return app;
}
