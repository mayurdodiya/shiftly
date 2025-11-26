const ROLE = {
  ADMIN: "admin",
  EMPLOYEE: "employee",
  HOSPITAL: "hospital",
};

const POST_STATUS = {
  OPEN: "open",
  CLOSED: "closed",
  PAUSED: "paused",
};

const JOB_POST_PAYMENT_STATUS = {
  // Recruiter → Admin (job creation)
  RECRUITER_PAYMENT_PENDING: "recruiter_payment_pending",
  RECRUITER_PAYMENT_SUCCESS: "recruiter_payment_success",
  RECRUITER_PAYMENT_FAILED: "recruiter_payment_failed",

  // Refund → Recruiter
  RECRUITER_REFUND_PENDING: "recruiter_refund_pending",
  RECRUITER_REFUND_SUCCESS: "recruiter_refund_success",
  RECRUITER_REFUND_FAILED: "recruiter_refund_failed",

  // Employee payout
  EMPLOYEE_PAYMENT_PENDING: "employee_payment_pending",
  EMPLOYEE_PAYMENT_SUCCESS: "employee_payment_success",
  EMPLOYEE_PAYMENT_FAILED: "employee_payment_failed",
};

const APPLICATION_STATUS = {
  APPLIED: "applied",
  REJECTED: "rejected",
  HIRED: "hired",
  CANCELED: "canceled",
  COMPLETED: "completed",
  VERIFIED: "verified", // if verified by hospital then send payment by admin
};

module.exports = {
  ROLE,
  POST_STATUS,
  APPLICATION_STATUS,
  JOB_POST_PAYMENT_STATUS,
};
