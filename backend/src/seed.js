import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDatabase } from "./config/database.js";
import { Template, User } from "./models.js";
import { SYSTEM_TEMPLATES } from "./systemTemplates.js";

dotenv.config();
await connectDatabase();

if(!(await User.exists({email:"admin@idcard.local"}))){
  await User.create({
    name:"Platform Admin",
    email:"admin@idcard.local",
    passwordHash:await bcrypt.hash("Admin@123",12),
    role:"ADMIN",
    status:"ACTIVE"
  });
}

for(const template of SYSTEM_TEMPLATES){
  await Template.findOneAndUpdate({slug:template.slug},{$set:template},{upsert:true,new:true});
}

console.log(`${SYSTEM_TEMPLATES.length} system templates seeded.`);
process.exit(0);
