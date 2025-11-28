const express = require("express");
const router = express.Router();
const postController = require("../controllers/jobPost.controller");
const validate = require("../middlewares/validate");
const { jobPostValidation } = require("../validations");
const { auth } = require("../middlewares/auth");
const { ROLE } = require("../utils/constant");


// ------------------------------- POST routes -----------------------------------------
// create a new job post (Recruiter only)
router.post("/add", auth({ usersAllowed: [ROLE.HOSPITAL] }), validate(jobPostValidation.addJobPost), postController.addJobPost);

// apply to a job (Applicant only)
router.post("/apply", auth({ usersAllowed: [ROLE.EMPLOYEE] }), validate(jobPostValidation.applyJob), postController.applyJob);

// payment by hospital for new job posting
router.post("/payment", auth({ usersAllowed: [ROLE.HOSPITAL] }), /* validate(jobPostValidation.applyJob), */ postController.addJobPostPayment);


// ------------------------------- PUT routes ------------------------------------------
// hire applicat status (hospital only)
router.put("/application/hospital/hire/:applicationId", auth({ usersAllowed: [ROLE.HOSPITAL] }), validate(jobPostValidation.hireApplicant), postController.hireApplicant);

// change job post status i'am arrived (start job) (only for employee)
router.put("/start-job/:jobPostId", auth({ usersAllowed: [ROLE.EMPLOYEE] }), validate(jobPostValidation.startJobByEmployee), postController.startJobByEmployee);

// change job post status i'am completed my duty (only for employee)
router.put("/complete-job/:jobPostId", auth({ usersAllowed: [ROLE.EMPLOYEE] }), validate(jobPostValidation.completeJobByEmployee), postController.completeJobByEmployee);

// change job post status as verified (only for hospital user)
router.put("/verified-job/:jobPostId", auth({ usersAllowed: [ROLE.HOSPITAL] }), validate(jobPostValidation.verifiedJobByHospital), postController.verifiedJobByHospital);


// ------------------------------- GET routes ------------------------------------------
// list of all jobs
router.get("/list", auth({ usersAllowed: [ROLE.HOSPITAL, ROLE.EMPLOYEE] }), validate(jobPostValidation.getAllJobPost), postController.getAllJobPost);

// view all upcoming jobs for hospital and employee
router.get("/upcoming-job/list", auth({ usersAllowed: [ROLE.HOSPITAL, ROLE.EMPLOYEE] }), validate(jobPostValidation.viewAllUpcomingJobs), postController.viewAllUpcomingJobs);

// view all ongoing jobs for hospital and employee
router.get("/ongoing-job/list", auth({ usersAllowed: [ROLE.HOSPITAL, ROLE.EMPLOYEE] }), validate(jobPostValidation.viewAllUpcomingJobs), postController.viewAllOngoingJobs);

// view all completed jobs for hospital and employee
router.get("/completed-job/list", auth({ usersAllowed: [ROLE.HOSPITAL, ROLE.EMPLOYEE] }), validate(jobPostValidation.viewAllCompletedJobs), postController.viewAllCompletedJobs);

// view all verified jobs for hospital and employee
router.get("/verified-job/list", auth({ usersAllowed: [ROLE.HOSPITAL, ROLE.EMPLOYEE] }), validate(jobPostValidation.viewAllVerifiedJobs), postController.viewAllVerifiedJobs);

// view all expried jobs for hospital
router.get("/expried-job/list", auth({ usersAllowed: [ROLE.HOSPITAL] }), validate(jobPostValidation.viewAllExpriedJobs), postController.viewAllExpriedJobs);

// view job by id
router.get("/:id", auth({ usersAllowed: [ROLE.HOSPITAL, ROLE.EMPLOYEE] }), validate(jobPostValidation.getJobPostDetails), postController.getJobPostDetail);

// list of applicant
router.get("/application/list", auth({ usersAllowed: [ROLE.HOSPITAL, ROLE.EMPLOYEE] }), validate(jobPostValidation.getAllApplications), postController.getAllApplications);

// list of applicant
router.get("/my-applied-job/list", auth({ usersAllowed: [ROLE.EMPLOYEE] }), validate(jobPostValidation.getAllMyAppliedJobApplication), postController.getAllMyAppliedJobApplication);

// view application by id
router.get("/application/:id", auth({ usersAllowed: [ROLE.HOSPITAL, ROLE.EMPLOYEE] }), validate(jobPostValidation.getApplicationDetail), postController.getApplicationDetail);


// ------------------------------- DELETE routes ---------------------------------------
// delete job post (soft delete)
// router.delete("/remove/:postId", auth({ usersAllowed: [ROLE.HOSPITAL] }), postController.deleteJobPost);

module.exports = router;
