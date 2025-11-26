const express = require("express");

const router = express.Router();


// User routes
router.use("/user", require("./user.route.js"));
router.use("/job-post", require("./jobPost.route.js"));


module.exports = router;
