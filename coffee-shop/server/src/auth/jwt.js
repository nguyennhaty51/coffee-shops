import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "coffee-shop-demo-secret-change-me";
const EXPIRES_IN = "12h";

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
