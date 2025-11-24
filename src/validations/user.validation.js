const Joi = require("joi");
const { ROLE } = require("../utils/constant");

const bankDetailValidation = Joi.object({
  bankName: Joi.string().trim().required().messages({
    "any.required": "Bank name is required",
    "string.empty": "Bank name cannot be empty",
  }),
  branchName: Joi.string().trim().required().messages({
    "any.required": "Branch name is required",
    "string.empty": "Branch name cannot be empty",
  }),
  accountNumber: Joi.string()
    .trim()
    .pattern(/^[0-9]{9,18}$/)
    .required()
    .messages({
      "string.pattern.base": "Account number must be 9–18 digits",
      "any.required": "Account number is required",
    }),
  accountHolderName: Joi.string().trim().required().messages({
    "any.required": "Account holder name is required",
    "string.empty": "Account holder name cannot be empty",
  }),
  ifscCode: Joi.string()
    .trim()
    .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid IFSC code format",
      "any.required": "IFSC code is required",
    }),
});

const registerUser = {
  body: Joi.object().keys({
    name: Joi.string().trim().required(),
    role: Joi.string().trim().required().valid(ROLE.EMPLOYEE, ROLE.HOSPITAL),
    email: Joi.string().trim().email().required(),
    countryCode: Joi.string().trim().required(),
    phone: Joi.string()
      .trim()
      .pattern(/^[6-9]\d{9}$/)
      .required()
      .messages({
        "string.empty": "Phone number is required",
        "string.pattern.base": "Phone number must be a valid 10-digit Indian number starting with 6-9",
      }),
    password: Joi.string()
      .trim()
      .min(8)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"))
      .required()
      .messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 8 characters long",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character e.g Test@123",
      }),
    confirmPassword: Joi.string().trim().required().valid(Joi.ref("password")),
    profession: Joi.when("role", {
      is: ROLE.EMPLOYEE,
      then: Joi.string().trim().required(),
      otherwise: Joi.string().trim().optional().allow(null, ""),
    }),
    skill: Joi.when("role", {
      is: ROLE.EMPLOYEE,
      then: Joi.array().items(Joi.string().trim().required()).min(1).required(),
      otherwise: Joi.array().items(Joi.string().trim()).optional(),
    }),
    resumeUrl: Joi.string().trim(),
    experience: Joi.number(),
    bankDetail: bankDetailValidation.required(),
  }),
};

const loginUser = {
  body: Joi.object().keys({
    phone: Joi.string()
      .trim()
      .pattern(/^[6-9]\d{9}$/)
      .required()
      .messages({
        "string.empty": "Phone number is required",
        "string.pattern.base": "Phone number must be a valid 10-digit Indian number starting with 6-9",
      }),
    password: Joi.string().trim().required(),
  }),
};

const addUser = {
  body: Joi.object().keys({
    name: Joi.string().trim().required(),
    email: Joi.string().trim().email().required(),
    countryCode: Joi.string().trim().required(),
    phone: Joi.string().trim().required(),
    metaAccountNo: Joi.string().trim().required(),
  }),
};

const editUser = {
  body: Joi.object()
    .keys({
      name: Joi.string().trim(),
      countryCode: Joi.string().trim(),
      phone: Joi.string().trim(),
      metaAccountNo: Joi.string().trim(),
    })
    .min(1)
    .messages({
      "object.min": "At least one field must be provided for update",
    }),
};

const sendOtp = {
  body: Joi.object().keys({
    phone: Joi.string()
      .trim()
      .pattern(/^[6-9]\d{9}$/)
      .required()
      .messages({
        "string.empty": "Phone number is required",
        "string.pattern.base": "Phone number must be a valid 10-digit Indian number starting with 6-9",
      }),
  }),
};

const verifyOtp = {
  body: Joi.object().keys({
    phone: Joi.string()
      .trim()
      .pattern(/^[6-9]\d{9}$/)
      .required()
      .messages({
        "string.empty": "Phone number is required",
        "string.pattern.base": "Phone number must be a valid 10-digit Indian number starting with 6-9",
      }),
    otp: Joi.string().required(),
  }),
};

const changePassword = {
  body: Joi.object().keys({
    email: Joi.string().trim().email().required(),
    newPassword: Joi.string().trim().required(),
    confirmPassword: Joi.string().trim().required().valid(Joi.ref("newPassword")),
  }),
};

module.exports = {
  registerUser,
  loginUser,
  addUser,
  editUser,
  sendOtp,
  verifyOtp,
  changePassword,
};
