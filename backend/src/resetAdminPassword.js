import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import { connectDatabase } from "./config/database.js";
import { User } from "./models.js";

dotenv.config();

await connectDatabase();

const adminEmail = process.env.ADMIN_EMAIL || "admin@idcard.local";
const adminPassword =
  "Admin@123";
const passwordHash = await bcrypt.hash(adminPassword, 12);

const admin = await User.findOneAndUpdate(
  {
    email: adminEmail.trim().toLowerCase(),
    role: "ADMIN",
  },
  {
    $set: {
      passwordHash,
      status: "ACTIVE",
    },
  },
  { new: true }
);

if (!admin) {
  console.error("Admin account not found.");
  process.exit(1);
}

console.log("Admin password updated successfully.");
process.exit(0);
