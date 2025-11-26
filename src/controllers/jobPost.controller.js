const message = require("../json/message.json");
const { JobPostModel, UserModel, SettingModel, JobApplicationModel } = require("../models");
const apiResponse = require("../utils/api.response");
const logger = require("../config/logger");
const moment = require("moment");
const { getPagination, pagingData } = require("../utils/utils");
const { POST_STATUS, APPLICATION_STATUS } = require("../utils/constant");

module.exports = {
  // Job post ----------------------------------
  addJobPost: async (req, res) => {
    try {
      const reqBody = req.body;
      const { user } = req;
      reqBody.recruiterId = user._id;

      // Check recruiter exists
      const recruiter = await UserModel.findOne({ _id: reqBody.recruiterId, deletedAt: null, isActive: true });
      if (!recruiter) return apiResponse.NOT_FOUND({ res, message: message.recruiter_not_found });

      // expireAt = 1 hour before midnight from jobStartDate
      const jobStartMidnight = moment(reqBody.jobStartDate).startOf("day");
      reqBody.expireAt = moment(jobStartMidnight).subtract(1, "hour").toDate();

      // Calculate days diff
      const diffTime = new Date(reqBody.jobEndDate) - new Date(reqBody.jobStartDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      reqBody.totalDays = diffDays == 0 ? 1 : diffDays;

      const adminCommission = await SettingModel.findOne({ deletedAt: null });
      reqBody.adminFee = (adminCommission.commission * reqBody.salary) / 100;

      reqBody.employeeSalary = reqBody.salary - (adminCommission.commission * reqBody.salary) / 100;

      const data = await JobPostModel.create({ ...reqBody });

      return apiResponse.OK({ res, message: message.job_post_created, data });
    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  getAllJobPost: async (req, res) => {
    try {
      const { isActive, search, status, city, state, minExperience, maxExperience, minSalary, maxSalary, startDate, endDate, page, limit } = req.query;

      const { skip, limit: pageLimit } = getPagination(page, limit);

      let filterArr = [{ deletedAt: null }];

      // Search (title, description, skills)
      if (search) {
        const reg = new RegExp(search, "i");
        filterArr.push({
          $or: [{ title: reg }, { description: reg }, { skills: { $in: [reg] } }, { "location.city": reg }, { "location.state": reg }],
        });
      }

      // Status Filter
      if (status) {
        filterArr.push({ status });
      }

      // isActive Filter
      if (isActive == true) {
        filterArr.push({ isActive: true });
      } else if (isActive == false) {
        filterArr.push({ isActive: false });
      }

      // Location Filters
      if (city) filterArr.push({ "location.city": city });
      if (state) filterArr.push({ "location.state": state });

      // Experience Filter
      if (minExperience) {
        filterArr.push({ "experience.min": { $gte: Number(minExperience) } });
      }
      if (maxExperience) {
        filterArr.push({ "experience.max": { $lte: Number(maxExperience) } });
      }

      // Salary Filter
      if (minSalary) {
        filterArr.push({ salary: { $gte: Number(minSalary) } });
      }
      if (maxSalary) {
        filterArr.push({ salary: { $lte: Number(maxSalary) } });
      }

      // Date Range Filter
      if (startDate) {
        filterArr.push({
          jobStartDate: { $gte: new Date(startDate) },
        });
      }
      if (endDate) {
        filterArr.push({
          jobStartDate: { $lte: new Date(endDate) },
        });
      }

      const filterQuery = filterArr.length > 0 ? { $and: filterArr } : {};

      const data = await JobPostModel.find(filterQuery).populate("recruiterId", "name email phone role").skip(skip).limit(pageLimit).sort({ createdAt: -1 });

      const totalCount = await JobPostModel.countDocuments(filterQuery);

      const response = pagingData({
        data,
        total: totalCount,
        page,
        limit: pageLimit,
      });

      return apiResponse.OK({ res, message: `Job Post ${message.data_get}`, data: response });
    } catch (err) {
      console.log("Error fetching job posts", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  getJobPostDetail: async (req, res) => {
    try {
      const { id } = req.params;

      const jobPost = await JobPostModel.findOne({ _id: id, isActive: true }).populate("recruiterId", "name email phone role");

      if (!jobPost) return apiResponse.NOT_FOUND({ res, message: "Job post not found" });

      return apiResponse.OK({
        res,
        message: "Job post details fetched successfully",
        data: jobPost,
      });
    } catch (err) {
      console.log("Error fetching job post", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  // Apply to job ------------------------------
  applyJob: async (req, res) => {
    // try {
    //   const { jobPostId } = req.body;
    //   const { user } = req;

    //   // Check job exists and active
    //   const jobPost = await JobPostModel.findOne({ _id: jobPostId, isActive: true });
    //   console.log(jobPost, '------------------------jobPost')
    //   if (!jobPost) return apiResponse.NOT_FOUND({ res, message: message.job_post_not_found });

    //   // Check if user already applied
    //   const existingApplication = await JobApplicationModel.findOne({
    //     jobPostId,
    //     applicantId: user._id,
    //     isActive: true,
    //   });
    //   if (existingApplication) return apiResponse.BAD_REQUEST({ res, message: message.already_applied_job });

    //   // Create job application
    //   const application = await JobApplicationModel.create({
    //     jobPostId,
    //     applicantId: user._id,
    //   });

    //   return apiResponse.OK({ res, message: message.job_applied_success, data: application });
    // } catch (err) {
    //   console.log("Error applying to job:", err);
    //   return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    // }
    try {
      const { jobPostId } = req.body;
      const { user } = req;

      // Check job exists
      const jobPost = await JobPostModel.findOne({ _id: jobPostId, isActive: true });
      if (!jobPost) {
        return apiResponse.NOT_FOUND({ res, message: message.job_post_not_found });
      }

      const newStart = new Date(jobPost.jobStartDate);
      const newEnd = new Date(jobPost.jobEndDate);

      // ❗ Check overlapping hired jobs
      const overlappingHiredApplication = await JobApplicationModel.findOne({
        applicantId: user._id,
        status: "hired", // only hired jobs block new applications
        isActive: true,
      }).populate({
        path: "jobPostId",
        match: {
          jobStartDate: { $lte: newEnd },   // existing.start <= new.end
          jobEndDate: { $gte: newStart }    // existing.end >= new.start
        }
      });

      if (overlappingHiredApplication && overlappingHiredApplication.jobPostId) {
        return apiResponse.BAD_REQUEST({
          res,
          message: "You already have a hired job overlapping this date range. You can apply only before or after those dates."
        });
      }

      // Check already applied for same job
      const existingApplication = await JobApplicationModel.findOne({
        jobPostId,
        applicantId: user._id,
        isActive: true
      });

      if (existingApplication) {
        return apiResponse.BAD_REQUEST({ res, message: message.already_applied_job });
      }

      // Create new application
      const application = await JobApplicationModel.create({ jobPostId, applicantId: user._id, });

      return apiResponse.OK({ res, message: message.job_applied_success, data: application, });

    } catch (err) {
      console.log("Error applying to job:", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong, });
    }
  },

  getAllApplications: async (req, res) => {
    try {
      const { applicantId, jobPostId, status, search,
        minExperience,
        maxExperience,
        skill,
        phone,
        profession,
        isActive,
        startDate,
        endDate,
        page,
        limit,
        sortField,
        sortOrder
      } = req.query;

      const { skip, limit: pageLimit } = getPagination(page, limit);

      let filter = [];

      // filter only active records by default
      filter.push({ deletedAt: null });

      // Applicant filter
      if (applicantId) {
        filter.push({ applicantId });
      }

      // Job Post filter
      if (jobPostId) {
        filter.push({ jobPostId });
      }

      // Status filter
      if (status) {
        filter.push({ status });
      }

      // isActive Filter
      if (typeof isActive !== "undefined") {
        filter.push({ isActive: isActive === "true" });
      }

      // Date range filter (application created date)
      if (startDate) {
        filter.push({ createdAt: { $gte: new Date(startDate) } });
      }
      if (endDate) {
        filter.push({ createdAt: { $lte: new Date(endDate) } });
      }

      // Search text filter (name, phone, job title)
      if (search) {
        const reg = new RegExp(search, "i");
        filter.push({
          $or: [
            { "applicant.name": reg },
            { "applicant.phone": reg },
            { "jobPost.title": reg },
            { "jobPost.skills": { $in: [reg] } },
          ],
        });
      }

      // Skill filter
      if (skill) {
        filter.push({ "applicant.skill": { $in: [skill] } });
      }

      // Phone filter
      if (phone) {
        filter.push({ "applicant.phone": phone });
      }

      // Profession filter
      if (profession) {
        filter.push({ "applicant.profession": profession });
      }

      // Experience filter
      if (minExperience) {
        filter.push({ "applicant.experience": { $gte: Number(minExperience) } });
      }
      if (maxExperience) {
        filter.push({ "applicant.experience": { $lte: Number(maxExperience) } });
      }

      const finalQuery = filter.length ? { $and: filter } : {};

      // === Populate with applicant + jobPost ===
      const data = await JobApplicationModel.find(finalQuery)
        .populate("applicantId", "name phone profession skill experience resumeUrl")
        .populate("jobPostId", "title skills salary experience location")
        .skip(skip)
        .limit(pageLimit)
        .sort({ [sortField]: sortOrder === "asc" ? 1 : -1 });

      const totalCount = await JobApplicationModel.countDocuments(finalQuery);

      const response = pagingData({
        data,
        total: totalCount,
        page,
        limit: pageLimit,
      });

      return apiResponse.OK({
        res,
        message: "Job Applications fetched successfully",
        data: response,
      });
    } catch (err) {
      console.log("Error fetching applications :", err);
      return apiResponse.CATCH_ERROR({
        res,
        message: "Something went wrong",
      });
    }
  },

  getApplicationDetail: async (req, res) => {
    try {
      const { id } = req.params;
      const data = await JobApplicationModel.findById(id)
        .populate(
          "applicantId",
          "name phone profession skill experience resumeUrl"
        )
        .populate(
          "jobPostId",
          "title description skills salary experience location"
        );

      if (!data) {
        return apiResponse.NOT_FOUND({
          res,
          message: "Application not found",
        });
      }

      return apiResponse.OK({
        res,
        message: "Application detail fetched successfully",
        data,
      });
    } catch (err) {
      console.log("Error fetching application detail:", err);
      return apiResponse.CATCH_ERROR({
        res,
        message: "Something went wrong",
      });
    }
  },

  addJobPostPayment: async (req, res) => {
    try {
      const { jobPostId } = req.body;
      const { user } = req;

      // Check job exists and active
      const jobPost = await JobPostModel.findOne({ _id: jobPostId, isActive: true });
      console.log(jobPost, '------------------------jobPost')
      if (!jobPost) return apiResponse.NOT_FOUND({ res, message: message.job_post_not_found });

      await JobPostModel.findOneAndUpdate({ _id: jobPostId }, { isActive: true });

      // job post payment status change
      // add payment id in job post

      return apiResponse.OK({ res, message: message.payment_success });
    } catch (err) {
      console.log("Error applying to job:", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  changeApplicationStatusByHospital: async (req, res) => {
    try {
      const { status } = req.body;
      const applicationId = req.params.applicationId;

      // Check if application exists and active
      const application = await JobApplicationModel.findOne({ _id: applicationId, isActive: true });
      if (!application) return apiResponse.NOT_FOUND({ res, message: message.application_not_found });

      const currentStatus = application.status;
      if (currentStatus === APPLICATION_STATUS.COMPLETED && [APPLICATION_STATUS.CANCELED, APPLICATION_STATUS.REJECTED].includes(status)) {
        return apiResponse.BAD_REQUEST({ res, message: message.invalid_status_change });
      }

      // Case 2: If current status is VERIFIED → cannot change to anything else
      if (currentStatus === APPLICATION_STATUS.VERIFIED) {
        return apiResponse.BAD_REQUEST({ res, message: message.invalid_status_change_verified });
      }

      // Update status
      application.status = status;
      await application.save();

      return apiResponse.OK({ res, message: message.application_status_updated, data: application });
    } catch (err) {
      console.log("Error updating application status:", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },
};
