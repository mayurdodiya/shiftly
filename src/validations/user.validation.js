const Joi = require("joi");
const { ROLE } = require("../utils/constant");

const bankDetailValidation = Joi.object({
  bankName: Joi.string().trim().lowercase().required().messages({
    "any.required": "Bank name is required",
    "string.empty": "Bank name cannot be empty",
  }),
  branchName: Joi.string().trim().lowercase().required().messages({
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
  accountHolderName: Joi.string().trim().lowercase().required().messages({
    "any.required": "Account holder name is required",
    "string.empty": "Account holder name cannot be empty",
  }),
  ifscCode: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid IFSC code format",
      "any.required": "IFSC code is required",
    }),
});

const register = {
  body: Joi.object().keys({
    name: Joi.string().trim().lowercase().required(),

    role: Joi.string().trim().required().valid(ROLE.EMPLOYEE, ROLE.HOSPITAL),

    email: Joi.string().trim().email().lowercase().required(),

    countryCode: Joi.string().trim(),

    phone: Joi.string()
      .trim()
      .pattern(/^[6-9]\d{9}$/)
      .required()
      .messages({
        "string.empty": "Phone number is required",
        "string.pattern.base": "Phone number must be a valid 10-digit Indian number starting with 6-9",
      }),

    profession: Joi.when("role", {
      is: ROLE.EMPLOYEE,
      then: Joi.string().trim().lowercase().required(),
      otherwise: Joi.string().trim().lowercase().optional().allow(null, ""),
    }),

    skill: Joi.when("role", {
      is: ROLE.EMPLOYEE,
      then: Joi.array().items(Joi.string().trim().lowercase().required()).min(1).required(),
      otherwise: Joi.array().items(Joi.string().trim().lowercase()).optional(),
    }),

    resumeUrl: Joi.string().optional().allow(null, ""),
    facility: Joi.string().trim().lowercase(),
    city: Joi.string().trim().lowercase(),
    state: Joi.string().trim().lowercase(),
    address: Joi.string().trim().lowercase(),
    experience: Joi.number(),
    bankDetail: bankDetailValidation.required(),
  }),
};

const editProfile = {
  body: Joi.object({
    name: Joi.string().trim().lowercase().optional(),
    profession: Joi.string().trim().lowercase().optional(),
    profileImage: Joi.string().trim().optional(),
    skill: Joi.array().items(Joi.string().lowercase()).optional(),
    resumeUrl: Joi.string().trim().optional(),
    experience: Joi.number().optional(),

    bankDetail: Joi.object({
      bankName: Joi.string().lowercase().optional(),
      branchName: Joi.string().lowercase().optional(),
      accountNumber: Joi.string().lowercase().optional(),
      accountHolderName: Joi.string().lowercase().optional(),
      ifscCode: Joi.string().optional(),
    }).optional(),

    facility: Joi.string().trim().lowercase().optional(),
    city: Joi.string().trim().lowercase().optional(),
    state: Joi.string().trim().lowercase().optional(),
    address: Joi.string().trim().lowercase().optional(),
  }).min(1),
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
    email: Joi.string().trim().email().lowercase().required(),
    newPassword: Joi.string().trim().required(),
    confirmPassword: Joi.string().trim().required().valid(Joi.ref("newPassword")),
  }),
};

module.exports = {
  register,
  editProfile,
  sendOtp,
  verifyOtp,
  changePassword,
};
