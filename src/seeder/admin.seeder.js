const { UserModel } = require("../models");
const { ROLE } = require("../utils/constant");

// Admin seeder.
module.exports = adminSeeder = async () => {
  try {
    const adminExist = await UserModel.findOne({ phone: process.env.ADMIN_PHONE, deletedAt: null });

    if (!adminExist) {
      await UserModel.create({
        name: process.env.ADMIN_NAME,
        email: process.env.ADMIN_EMAIL,
        countryCode: process.env.ADMIN_COUNTRY_CODE,
        phone: process.env.ADMIN_PHONE,
        password: process.env.ADMIN_PASSWORD,
        role: ROLE.ADMIN,
      });
    }

    console.log("✅ Admin seeder run successfully...");
  } catch (error) {
    console.log("❌ Error from admin seeder :", error);
  }
};
