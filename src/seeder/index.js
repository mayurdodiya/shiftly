const connectDB = require("../db/dbConnection");
require("dotenv").config();
const adminSeeder = require("./admin.seeder");
const roleSeeder = require("./role.seeder");
const settingSeeder = require("./setting.seeder");

async function seeder() {
  try {
    await connectDB(); // Db connect.
    console.log("✅ Seeding database...");

    await adminSeeder(); // Admin seeder.
    await settingSeeder(); // Admin seeder.

    console.log("✅ All seeder run successfully...");

    /**
     * To exit with a 'failure' code use: process.exit(1)
     * To exit with a 'success' code use: process.exit(0)
     * Here we have used code 1 because it's process is used only one time when you change in seeder's files.
     */
    process.exit(0);
  } catch (error) {
    console.log("❌ Seeder error: ", error);
    process.exit(1);
  }
}

seeder(); // Seeder calling...
