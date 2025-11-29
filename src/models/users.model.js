const mongoose = require("mongoose");
const { hashPassword } = require("../utils/utils");
const { ROLE } = require("../utils/constant");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: null,
    },
    role: {
      type: String,
      enum: [ROLE.ADMIN, ROLE.EMPLOYEE, ROLE.HOSPITAL],
      default: ROLE.EMPLOYEE,
    },
    countryCode: {
      type: String,
      trim: true,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      required: true,
      default: null,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      default: null,
    },
    profession: {
      type: String,
      trim: true,
      lowercase: true,
    },
    profileImage: {
      type: String,
      trim: true,
    },
    skill: {
      type: [String],
      default: undefined,
    },
    resumeUrl: {
      type: String,
      trim: true,
    },
    experience: {
      type: Number,
      trim: true,
    },
    bankDetail: {
      bankName: { type: String, trim: true },
      branchName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      accountHolderName: { type: String, trim: true },
      ifscCode: { type: String, trim: true },
    },
    // password: {
    //   type: String,
    //   trim: true,
    // },
    facility: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Pre Hook - Hash password before save
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    const bcryptPwd = await hashPassword({ password: user.password });
    user.password = bcryptPwd;
  }
  next();
});

const User = mongoose.model("users", userSchema);
module.exports = User;
