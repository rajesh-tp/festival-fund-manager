import Database from "better-sqlite3";
import { createHash } from "crypto";
import path from "path";

const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), "data", "festival.db");
const db = new Database(dbPath);

function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex");
}

const users = [
  { username: "admin", password: "ayyappa" },
  { username: "superadmin", password: "superadmin" },
];

const insert = db.prepare(
  "INSERT OR IGNORE INTO users (username, password_hash, created_at) VALUES (?, ?, unixepoch())"
);

for (const user of users) {
  insert.run(user.username, hashPassword(user.password));
}

console.log("Users seeded successfully.");
db.close();
