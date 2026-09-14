import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { seedDatabase } from "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "data", "coffeeshop.db");
const SCHEMA_PATH = path.join(__dirname, "schema.sql");

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
db.exec(schema);

const didSeed = seedDatabase(db);
if (didSeed) {
  console.log("✔ Đã nạp dữ liệu mẫu vào cơ sở dữ liệu:", DB_PATH);
} else {
  console.log("✔ Cơ sở dữ liệu đã có sẵn dữ liệu:", DB_PATH);
}
