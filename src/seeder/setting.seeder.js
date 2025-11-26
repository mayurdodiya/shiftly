const { SettingModel } = require("../models");

// Setting seeder.
module.exports = settingSeeder = async () => {
  try {
    const exist = await SettingModel.findOne({ deletedAt: null });

    if (!exist) {
      await SettingModel.create({
        commission: 5,
      });
    }

    console.log("✅ Setting seeder run successfully...");
  } catch (error) {
    console.log("❌ Error from admin seeder :", error);
  }
};
