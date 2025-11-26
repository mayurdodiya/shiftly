const mongoose = require("mongoose");

const settingSchema = mongoose.Schema(
  {
    commission: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const setting = mongoose.model("setting", settingSchema, "setting");
module.exports = setting;
