const message = require("../json/message.json");
const { UserModel, OtpModel } = require("../models");
const apiResponse = require("../utils/api.response");
const logger = require("../config/logger");
const { comparePassword, generateToken, getPagination, pagingData, hashPassword } = require("../utils/utils");
const sendEmail = require("../services/sendgrid");
const { ROLE } = require("../utils/constant");

module.exports = {
  // registerUser: async (req, res) => {
  //   try {
  //     console.log('--------------------------1')
  //     const reqBody = req.body;
  //     console.log('--------------------------2')
  //     const otpVarified = await OtpModel.findOne({ phone: reqBody.phone, isVerify: true });
  //     console.log('--------------------------3')
  //     if (!otpVarified) return apiResponse.BAD_REQUEST({ res, message: message.otp_verify_pending });
  //     console.log('--------------------------4')

  //     const phoneExist = await UserModel.findOne({ phone: reqBody.phone, isActive: true, deletedAt: null });
  //     console.log('--------------------------5')
  //     if (phoneExist) return apiResponse.DUPLICATE_VALUE({ res, message: message.phone_already_taken, });
  //     console.log('--------------------------6')

  //     const data = await UserModel.create({ ...reqBody });
  //     console.log('--------------------------7')
  //     return apiResponse.OK({ res, message: message.otp_sent_phone });
  //     return apiResponse.OK({ res, message: message.phone_already_taken, });
  //     return res.status(200).json({
  //       success: true,
  //       message: message.user_add_success,
  //       data,
  //     });
  //     return apiResponse.OK({ res, message: message.user_add_success, data });
  //     console.log('--------------------------8')
  //   } catch (err) {
  //     logger.error("error generating", err);
  //     return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
  //   }
  // },

  registerUser: async (req, res) => {
    try {
      console.log('--------------------------1');
      const reqBody = req.body;
      console.log('--------------------------2');

      const otpVarified = await OtpModel.findOne({ phone: reqBody.phone, isVerify: true });
      console.log('--------------------------3');
      if (!otpVarified) {
        return apiResponse.BAD_REQUEST({ res, message: message.otp_verify_pending });
      }

      console.log('--------------------------4');
      const phoneExist = await UserModel.findOne({ phone: reqBody.phone, isActive: true, deletedAt: null });
      console.log('--------------------------5');
      if (phoneExist) {
        return apiResponse.DUPLICATE_VALUE({ res, message: message.phone_already_taken });
      }

      console.log('--------------------------6');
      const data = await UserModel.create(reqBody);
      // console.log(data, '--------------------------7');

      // ✅ Send response and END request properly
      // return apiResponse.OK({ res, message: message.user_add_success, /* data */ });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.write('OK');
      res.end();
      return
      // return res.status(200).json({ success: true, message: message.user_add_success, data });

    } catch (err) {
      console.error("Error generating:", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
    // try {
    //   // raw send (lowest-level)
    //   console.log('--------------------------7 - after raw send');
    // } catch (sendErr) {
    //   console.error('Error sending raw response:', sendErr);
    // }
    // console.log('res.headersSent =', res.headersSent, 'res.finished =', res.finished);
    // return;
  },


  loginUser: async (req, res) => {
    try {
      console.log('------------------1122')
      const reqBody = req.body;
      let user = await UserModel.findOne({ phone: reqBody.phone, isActive: true, deletedAt: null }).select("-reset_link_expiry -deletedAt -updatedAt");
      
      if (!user) return apiResponse.NOT_FOUND({ res, message: message.user_not_found, });

      const pwdMatch = await comparePassword({ password: reqBody.password, hash: user.password });
      if (!pwdMatch) return apiResponse.BAD_REQUEST({ res, message: message.invalid_credentials });

      const token = generateToken({ userId: user._id, email: user.email });
      const userObj = user.toObject();
      delete userObj.password;

      userObj.token = token;
      console.log('------------------2')
      return apiResponse.OK({ res, message: message.login_success, data: userObj });
    } catch (err) {
      logger.error("error generating", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  sendOtp: async (req, res) => {
    try {
      const { phone } = req.body;
      // const user = await OtpModel.findOne({ phone, deletedAt: null });
      // if (!user) {
      //   return apiResponse.NOT_FOUND({ res, message: message.phone_not_found });
      // }

      const otp = Math.floor(100000 + Math.random() * 900000);
      // send otp with the tool pending******

      await Promise.all([
        OtpModel.findOneAndUpdate({ phone }, { otp: "000000", expiryTime: new Date(Date.now() + 1 * 60 * 1000) }, { upsert: true, new: true }),
        // send otp in phone number
        // sendEmail({
        //   to: email,
        //   subject: "Algomatic forgot password request",
        //   text: `Your Otp is: ${otp}`,
        //   html: sendOTP(email, otp),
        // }),
      ]);

      return apiResponse.OK({ res, message: message.otp_sent_phone });
    } catch (error) {
      logger.error("Error in forgotPassword", error);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  verifyOtp: async (req, res) => {
    try {
      const { phone, otp } = req.body;

      const otpData = await OtpModel.findOne({ phone });
      if (!otpData) return apiResponse.NOT_FOUND({ res, message: message.phone_not_found });
      if (otpData.expiryTime < new Date()) return apiResponse.NOT_FOUND({ res, message: message.otp_expired });
      if (otpData.otp !== otp) return apiResponse.BAD_REQUEST({ res, message: message.invalid_otp });

      await OtpModel.findOneAndUpdate({ _id: otpData._id }, { $set: { expiryTime: new Date(), isVerify: true } }, { upsert: true }, { new: true });
      return apiResponse.OK({ res, message: message.otp_verified });
    } catch (error) {
      logger.error("Error in verifyOtp", error);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { phone, newPassword, confirmPassword } = req.body;
      const user = await UserModel.findOne({ phone, isActive: true, deletedAt: null });
      if (!user) return apiResponse.NOT_FOUND({ res, message: message.phone_not_found });

      if (newPassword !== confirmPassword) {
        return apiResponse.BAD_REQUEST({ res, message: message.invalid_credentials });
      }
      const finalPassword = await hashPassword({ password: newPassword });
      await UserModel.findOneAndUpdate({ _id: user._id, deletedAt: null }, { $set: { password: finalPassword } }, { new: true });
      return apiResponse.OK({ res, message: message.password_changed });
    } catch (error) {
      logger.error("Error in changePassword", error);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  addUser: async (req, res) => {
    try {
      const reqBody = req.body;
      const phoneExist = await UserModel.findOne({ phone: reqBody.phone, deletedAt: null });

      if (phoneExist) return apiResponse.DUPLICATE_VALUE({ res, message: message.phone_already_taken, });

      const data = await UserModel.create({ ...reqBody });
      return apiResponse.OK({ res, message: message.user_add_success, data });
    } catch (err) {
      logger.error("error generating", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  editUser: async (req, res) => {
    try {
      const reqBody = req.body;
      const id = req.params.id;
      const data = await UserModel.findOne({ _id: id, deletedAt: null });

      if (!data) return apiResponse.NOT_FOUND({ res, message: message.user_not_found, });

      // phone not change
      if (reqBody.phone) {
        delete reqBody.phone;
      }

      await UserModel.findOneAndUpdate({ _id: data._id, isActive: true, deletedAt: null }, { $set: { ...reqBody } }, { new: true });
      return apiResponse.OK({ res, message: `User ${message.updated}` });
    } catch (err) {
      logger.error("error generating", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await UserModel.findByIdAndUpdate({ id, deletedAt: null }, { $set: { deletedAt: new Date() } }, { new: true });

      if (!data) return apiResponse.NOT_FOUND({ res, message: message.user_not_found, });

      return apiResponse.OK({ res, message: `User ${message.deleted}` });
    } catch (err) {
      logger.error("error generating", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  getUser: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await UserModel.findOne({ _id: id, deletedAt: null }).select("-password -reset_link_expiry -deletedAt -updatedAt");

      if (!data) return apiResponse.NOT_FOUND({ res, message: message.user_not_found, });

      const userObj = data.toObject();
      return apiResponse.OK({ res, message: `User ${message.data_get}`, data: userObj });
    } catch (err) {
      logger.error("error generating", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  getAllUser: async (req, res) => {
    try {
      const { search, page, limit, isActive, role } = req.query
      const { skip, limit: pageLimit } = getPagination(page, limit);

      let DataObj = [{ deletedAt: null, }];

      if (search) {
        const regSearch = new RegExp(search, "i");
        DataObj = [
          ...DataObj,
          {
            $or: [{ name: regSearch }, { email: regSearch }, { phone: regSearch }],
          },
        ];
      }

      if (isActive === true) {
        DataObj.push({ isActive: true });
      } else if (isActive === false) {
        DataObj.push({ isActive: false });
      }
      if (role) {
        DataObj.push({ role });
      }
      const filterQuery = DataObj.length > 0 ? { $and: DataObj } : { deletedAt: null };

      const data = await UserModel.find(filterQuery).select("-password -reset_link_expiry").skip(skip).limit(pageLimit).sort({ createdAt: -1 });
      const response = pagingData({ data: data, total: data?.length, page, limit: pageLimit });
      return apiResponse.OK({ res, message: `User ${message.data_get}`, data: response });
    } catch (err) {
      logger.error("error generating", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },
};
