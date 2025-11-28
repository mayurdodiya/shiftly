const mongoose = require("mongoose");
const { APPLICATION_STATUS, JOB_POST_PAYMENT_STATUS } = require("../utils/constant");

const jobPostSchema = mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    experience: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 50 },
    },
    location: {
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true, default: "India" },
      address: { type: String },
    },
    salary: {
      type: Number,
      required: true,
    },
    adminFee: {
      type: Number,
      required: true,
    },
    employeeSalary: {
      type: Number,
      required: true,
    },
    shiftStartTime: {
      type: String, // format "HH:mm"
      trim: true,
      required: true,
    },
    shiftEndTime: {
      type: String, // format "HH:mm"
      trim: true,
      required: true,
    },
    jobStartDate: {
      type: Date, // when job becomes visible/active
      required: true,
    },
    jobEndDate: {
      type: Date, // last day job is visible
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
    },
    hiredApplicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    status: {
      type: String,
      // enum: [POST_STATUS.OPEN, POST_STATUS.CLOSED, POST_STATUS.PAUSED, POST_STATUS.EXPIRED],
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.PENDING,
    },
    recruiterPaymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "payment",
      default: null,
    },
    recruiterRefundPaymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "payment",
      default: null,
    },
    employeePaymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "payment",
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(JOB_POST_PAYMENT_STATUS),
      default: JOB_POST_PAYMENT_STATUS.RECRUITER_PAYMENT_PENDING,
    },
    expireAt: {
      type: Date,
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

const jobPost = mongoose.model("jobPost", jobPostSchema, "jobPost");
module.exports = jobPost;
