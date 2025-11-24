const jwt = require("jsonwebtoken");
const apiResponse = require("../utils/api.response");
const messages = require("../json/message.json");
const { UserModel } = require("../models");
const { ROLE } = require("../utils/constant");

module.exports = {
  auth: ({ isTokenRequired = true, usersAllowed = [] } = {}) => {
    return async (req, res, next) => {
      const token = req.header("x-auth-token");

      if (isTokenRequired && !token) return apiResponse.BAD_REQUEST({ res, message: messages.token_required });
      if (!isTokenRequired && !token) return next();
      try {
        let decoded = jwt.verify(token, process.env.JWT_SECRET);
        let user = await UserModel.findOne({ _id: decoded.userId }).lean();
        if (!user) return apiResponse.UNAUTHORIZED({ res, message: messages.invalid_token });

        req.user = user;

        if (usersAllowed.length) {
          if (req.user.role === ROLE.ADMIN) return next();
          if (usersAllowed.includes("*")) return next();
          if (usersAllowed.includes(req.user.role)) return next();
          return apiResponse.UNAUTHORIZED({ res, message: messages.unauthorized });
        } else {
          if (req.user.role === ROLE.ADMIN) return next();

          return apiResponse.UNAUTHORIZED({ res, message: messages.unauthorized });
        }
      } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }
    };
  },
};
