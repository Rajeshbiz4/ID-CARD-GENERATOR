import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import { connectDatabase } from "./config/database.js";
import { ensureSystemTemplates } from "./systemTemplateBootstrap.js";
import { ensureStudentIndexes } from "./studentIndexes.js";
import { User } from "./models.js";

dotenv.config();

await connectDatabase();
await ensureSystemTemplates();
await ensureStudentIndexes();

const adminEmail = "admin@idcard.local";
const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

if (!(await User.exists({ email: adminEmail }))) {
  await User.create({
    name: "Platform Admin",
    email: adminEmail,
    passwordHash: await bcrypt.hash(adminPassword, 12),
    role: "ADMIN",
    status: "ACTIVE",
  });

  console.log("Admin created.");
}

console.log("Seed complete.");
process.exit(0);
