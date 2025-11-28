const mongoose = require("mongoose");
const { APPLICATION_STATUS } = require("../utils/constant");

const jobApplicationSchema = mongoose.Schema(
  {
    jobPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "jobPost",
      required: true,
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const jobApplication = mongoose.model("jobApplication", jobApplicationSchema, "jobApplication");
module.exports = jobApplication;
