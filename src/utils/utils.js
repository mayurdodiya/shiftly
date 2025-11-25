const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const apiResponse = require("./api.response");
const messages = require("../json/message.json");

module.exports = {
  hashPassword: async ({ password }) => {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  },

  generateToken: (data) => {
    const token = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    return token;
  },

  decodeToken: ({ token }) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  },

  comparePassword: async ({ password, hash }) => {
    const isPasswordMatch = await bcrypt.compare(password, hash);
    return isPasswordMatch;
  },

  getPagination: (page = 1, limit = 10) => {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    return { skip, limit: limitNum };
  },

  pagingData: ({ data = [], total = 0, page = 1, limit = 10 }) => {
    const totalPages = Math.ceil(total / limit);
    return {
      totalRecords: total,
      currentPage: parseInt(page),
      totalPages,
      pageSize: data.length,
      data,
    };
  },

  calculatePlanEndDate: (startDateStr, planType) => {
    const months = +planType.replace(/\D/g, "");
    const date = new Date(startDateStr);

    date.setMonth(date.getMonth() + months);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}T23:59`;
  },

  setToStartOfDay: (dateInput) => {
    const date = new Date(dateInput);
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  },

  setToEndOfDay: (dateInput) => {
    const date = new Date(dateInput);
    date.setHours(23, 59, 59, 999);
    return date.toISOString();
  },
  uploadImage: async (req, res) => {
    try {
      if (!req.file)
        return apiResponse.BAD_REQUEST({
          res,
          message: messages.image_required,
        });
      return apiResponse.OK({
        res,
        message: messages.success,
        data: req.file.location,
      });
    } catch (error) {
      return apiResponse.CATCH_ERROR({ res, message: error.message });
    }
  },
};
