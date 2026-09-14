import { Router } from "express";
import { getFullState } from "../state.js";

const router = Router();

// GET /api/state — trả về toàn bộ dữ liệu hệ thống hiện tại.

router.get("/", (req, res) => {
  res.json(getFullState());
});

export default router;
