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
// Register
router.post("/signup", validate(userValidation.register), userController.register);
// router.post("/signup", upload.single("file"), validate(userValidation.register), userController.register);

// POST METHOD 
router.post("/addphotos", upload.single("file"), utils.uploadImage);

// Login
router.post("/login", validate(userValidation.loginUser), userController.loginUser);

// Send otp
router.post("/sendOtp", validate(userValidation.sendOtp), userController.sendOtp);

// verify otp
router.post("/verifyOtp", validate(userValidation.verifyOtp), userController.verifyOtp);

// add user
router.post("/", /* validate(userValidation.changePassword), */ userController.addUser);


// ------------------------------- PUT routes ------------------------------------------

// edit user
router.put("/", /* validate(userValidation.changePassword), */ userController.editUser);

// change password
router.put("/change-password", /* validate(userValidation.changePassword), */ userController.changePassword);

// ------------------------------- GET routes ------------------------------------------

// get user details
router.get("/:id", /* validate(userValidation.changePassword), */ userController.getUser);

// get all user
router.get("/", /* validate(userValidation.changePassword), */ userController.getAllUser);


// ------------------------------- DELETE routes ---------------------------------------

// delete
router.delete("/:id", /* validate(userValidation.changePassword), */ userController.deleteUser);

module.exports = router;
