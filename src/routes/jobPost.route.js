const express = require("express");
const router = express.Router();
const postController = require("../controllers/jobPost.controller");
const validate = require("../middlewares/validate");
const { jobPostValidation } = require("../validations");
const { upload } = require("../services/s3.upload");
const { auth } = require("../middlewares/auth");
const { ROLE } = require("../utils/constant");

// ------------------------------- POST routes -----------------------------------------
// Create a new job post (Recruiter only)
router.post("/add", auth({ usersAllowed: [ROLE.HOSPITAL] }), validate(jobPostValidation.addJobPost), postController.addJobPost);

// Apply to a job (Applicant only)
router.post("/apply", auth({ usersAllowed: [ROLE.EMPLOYEE] }), validate(jobPostValidation.applyJob), postController.applyJob);

// Apply to a job (Applicant only)
router.post("/payment", auth({ usersAllowed: [ROLE.HOSPITAL] }), /* validate(jobPostValidation.applyJob), */ postController.addJobPostPayment);


// ------------------------------- PUT routes ------------------------------------------
// Change job post status (open/closed/paused)
// router.put("/status/:postId", auth({ usersAllowed: [ROLE.HOSPITAL] }), validate(jobPostValidation.editJobPost), postController.updatePostStatus);

// Chnage application status (applicant only)
router.put("/application/hospital/hire/:applicationId", auth({ usersAllowed: [ROLE.HOSPITAL] }), validate(jobPostValidation.hireApplicant), postController.hireApplicant);


// ------------------------------- GET routes ------------------------------------------
// list of jobs
router.get("/list", auth({ usersAllowed: [ROLE.HOSPITAL, ROLE.EMPLOYEE] }), validate(jobPostValidation.getAllJobPost), postController.getAllJobPost);

// view job by id
router.get("/:id", auth({ usersAllowed: [ROLE.HOSPITAL, ROLE.EMPLOYEE] }), validate(jobPostValidation.getJobPostDetails), postController.getJobPostDetail);

// list of applicant
router.get("/application/list", auth({ usersAllowed: [ROLE.HOSPITAL, ROLE.EMPLOYEE] }), validate(jobPostValidation.getAllApplications), postController.getAllApplications);

// view application by id
router.get("/application/:id", auth({ usersAllowed: [ROLE.HOSPITAL, ROLE.EMPLOYEE] }), validate(jobPostValidation.getApplicationDetail), postController.getApplicationDetail);

// Get all job posts (Recruiter looking at their posts)
// router.get("/list", auth({ usersAllowed: [ROLE.HOSPITAL] }), postController.getMyJobPosts);

// Get a single job post
// router.get("/details/:postId", auth(), postController.getJobPostDetails);

// Public job-feed for employees (filters + pagination)
// router.get("/feed", auth(ROLE.EMPLOYEE), postController.getJobFeed);

// ------------------------------- DELETE routes ---------------------------------------
// Delete job post (soft delete)
// router.delete("/remove/:postId", auth({ usersAllowed: [ROLE.HOSPITAL] }), postController.deleteJobPost);

module.exports = router;
