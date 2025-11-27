const message = require("../json/message.json");
const { UserModel, OtpModel, SettingModel } = require("../models");
const apiResponse = require("../utils/api.response");
const logger = require("../config/logger");
const { comparePassword, generateToken, getPagination, pagingData, hashPassword } = require("../utils/utils");
const sendEmail = require("../services/sendgrid");
const { ROLE } = require("../utils/constant");

module.exports = {
  register: async (req, res) => {
    try {
      let reqBody = req.body;
      console.log(req.vody)

      const otpVarified = await OtpModel.findOne({ phone: reqBody.phone, isVerify: true });
      if (!otpVarified) return apiResponse.BAD_REQUEST({ res, message: message.otp_verify_pending });

      const phoneExist = await UserModel.findOne({ phone: reqBody.phone, isActive: true, deletedAt: null });
      if (phoneExist) return apiResponse.DUPLICATE_VALUE({ res, message: message.phone_already_taken });

      // If file uploaded, store URL from S3
      if (req.file && req.file.location) {
        reqBody.resumeUrl = req.file.location;
      }

      let data = await UserModel.create({ ...reqBody });
      const token = await generateToken({ userId: data._id, phone: data.phone });
      data = data.toObject()
      data.token = token;

      return apiResponse.OK({ res, message: message.user_add_success, data });
    } catch (err) {
      console.log(err)
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  loginUser: async (req, res) => {
    try {
      const reqBody = req.body;
      let user = await UserModel.findOne({ phone: reqBody.phone, isActive: true, deletedAt: null }).select("-reset_link_expiry -deletedAt -updatedAt");

      if (!user) return apiResponse.NOT_FOUND({ res, message: message.user_not_found });

      const pwdMatch = await comparePassword({ password: reqBody.password, hash: user.password });
      if (!pwdMatch) return apiResponse.BAD_REQUEST({ res, message: message.invalid_credentials });

      const token = generateToken({ userId: user._id, email: user.email });
      const userObj = user.toObject();
      delete userObj.password;

      userObj.token = token;
      return apiResponse.OK({ res, message: message.login_success, data: userObj });
    } catch (err) {
      console.log(err);
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

      // const otp = Math.floor(1000 + Math.random() * 9000);
      const otp = "0000";
      // send otp with the tool pending******

      await Promise.all([
        OtpModel.findOneAndUpdate({ phone }, { otp: otp, expiryTime: new Date(Date.now() + 1 * 60 * 1000) }, { upsert: true, new: true }),
        // send otp in phone number
        // sendEmail({
        //   to: email,
        //   subject: "Algomatic forgot password request",
        //   text: `Your Otp is: ${otp}`,
        //   html: sendOTP(email, otp),
        // }),
      ]);

      return apiResponse.OK({ res, message: message.otp_sent_phone });
    } catch (err) {
      console.log(err);
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
      let user = {};
      user = await UserModel.findOne({ phone: phone }).lean();
      if (user) {
        user.isNewUser = false;
        const token = generateToken({ userId: user._id, phone: user.phone });
        user.token = token;
      } else {
        user = { isNewUser: true };
      }

      return apiResponse.OK({ res, message: message.otp_verified, data: user });
    } catch (err) {
      console.log(err);
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
    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  addUser: async (req, res) => {
    try {
      const reqBody = req.body;
      const phoneExist = await UserModel.findOne({ phone: reqBody.phone, deletedAt: null });

      if (phoneExist) return apiResponse.DUPLICATE_VALUE({ res, message: message.phone_already_taken });

      const data = await UserModel.create({ ...reqBody });
      return apiResponse.OK({ res, message: message.user_add_success, data });
    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  editProfile: async (req, res) => {
    try {
      const reqBody = req.body;
      const id = req.user._id;

      // phone not change
      if (reqBody.phone) delete reqBody.phone;

      // email not change
      if (reqBody.email) delete reqBody.email;

      await UserModel.findOneAndUpdate({ _id: id, isActive: true, deletedAt: null }, { $set: { ...reqBody } }, { new: true });
      return apiResponse.OK({ res, message: `User ${message.updated}` });
    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await UserModel.findByIdAndUpdate({ id, deletedAt: null }, { $set: { deletedAt: new Date() } }, { new: true });

      if (!data) return apiResponse.NOT_FOUND({ res, message: message.user_not_found });

      return apiResponse.OK({ res, message: `User ${message.deleted}` });
    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  getUser: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await UserModel.findOne({ _id: id, deletedAt: null }).select("-password -reset_link_expiry -deletedAt -updatedAt");

      if (!data) return apiResponse.NOT_FOUND({ res, message: message.user_not_found });

      const userObj = data.toObject();
      return apiResponse.OK({ res, message: `User ${message.data_get}`, data: userObj });
    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  getProfile: async (req, res) => {
    try {
      const { user } = req
      return apiResponse.OK({ res, message: `Profile ${message.data_get}`, data: user });
    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  getSetting: async (req, res) => {
    try {
      const data = await SettingModel.findOne({ deletedAt: null });
      return apiResponse.OK({ res, message: `Setting ${message.data_get}`, data: data });
    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  getAllUser: async (req, res) => {
    try {
      const { search, page, limit, isActive, role } = req.query;
      const { skip, limit: pageLimit } = getPagination(page, limit);

      let DataObj = [{ deletedAt: null }];

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
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },
};
