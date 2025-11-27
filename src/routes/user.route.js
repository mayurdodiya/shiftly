const express = require("express");
const userController = require("../controllers/user.controller");
const validate = require("../middlewares/validate");
const { userValidation } = require("../validations");
const { auth } = require("../middlewares/auth");
const { ROLE } = require("../utils/constant");
const { upload } = require("../../src/services/s3.upload");
const utils = require("../utils/utils");
const router = express.Router();


// ------------------------------- POST routes -----------------------------------------
// Send otp
router.post("/sendOtp", validate(userValidation.sendOtp), userController.sendOtp);

// verify otp
router.post("/verifyOtp", validate(userValidation.verifyOtp), userController.verifyOtp);

// Register
router.post("/signup", upload.single("file"), validate(userValidation.register), userController.register);

// upload single 
router.post("/upload", upload.single("file"), utils.uploadImage);


// ------------------------------- PUT routes ------------------------------------------

// edit user
router.put("/edit-profile", auth({ usersAllowed: [ROLE.HOSPITAL, ROLE.EMPLOYEE, ROLE.ADMIN] }), validate(userValidation.editProfile), userController.editProfile);

// ------------------------------- GET routes ------------------------------------------

// get setting details
router.get("/setting",auth({ usersAllowed: [ROLE.HOSPITAL, ROLE.ADMIN] }), userController.getSetting);

// view profile
router.get("/profile", auth({ usersAllowed: [ROLE.HOSPITAL, ROLE.EMPLOYEE, ROLE.ADMIN] }), userController.getProfile);

// get user details
// router.get("/:id", /* validate(userValidation.changePassword), */ userController.getUser);


// ------------------------------- DELETE routes ---------------------------------------

module.exports = router;
