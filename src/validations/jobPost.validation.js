const Joi = require("joi");
const { POST_STATUS, APPLICATION_STATUS } = require("../utils/constant");

// Common ObjectId validation with label
const objectId = (label = "id") =>
  Joi.string().trim().length(24).hex().label(label).messages({
    "string.base": "{#label} must be a string",
    "string.length": "{#label} must be 24 characters long",
    "string.hex": "{#label} must contain only hexadecimal characters",
  });

// job post ------------------------------------
const addJobPost = {
  body: Joi.object().keys({
    title: Joi.string().trim().lowercase().required(),

    description: Joi.string().trim().lowercase().allow("", null),

    skills: Joi.array().items(Joi.string().trim().lowercase()).min(1).required(),

    experience: Joi.object({
      min: Joi.number().min(0).default(0),
      max: Joi.number().max(50).default(50),
    }),

    location: Joi.object({
      city: Joi.string().trim().lowercase().required(),
      state: Joi.string().trim().lowercase().required(),
      country: Joi.string().trim().lowercase().default("india"),
      address: Joi.string().trim().lowercase().allow("", null),
    }).required(),

    salary: Joi.number().required(),

    shiftStartTime: Joi.string()
      .trim()
      .lowercase()
      .pattern(/^\d{2}:\d{2}$/)
      .required(),

    shiftEndTime: Joi.string()
      .trim()
      .lowercase()
      .pattern(/^\d{2}:\d{2}$/)
      .required(),

    jobStartDate: Joi.string()
      .trim()
      .lowercase()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required()
      .messages({
        "string.pattern.base": "jobStartDate must be in YYYY-MM-DD format only",
      }),

    jobEndDate: Joi.string()
      .trim()
      .lowercase()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required()
      .messages({
        "string.pattern.base": "jobEndDate must be in YYYY-MM-DD format only",
      }),

    isActive: Joi.boolean().default(false),
  }),
};

// const editJobPost = {
//   body: Joi.object()
//     .keys({
//       title: Joi.string().trim(),
//       description: Joi.string().trim(),
//       skills: Joi.array().items(Joi.string().trim()),
//       experience: Joi.object({
//         min: Joi.number().min(0),
//         max: Joi.number().max(50),
//       }),
//       location: Joi.object({
//         city: Joi.string().trim(),
//         state: Joi.string().trim(),
//         country: Joi.string().trim(),
//         address: Joi.string().trim(),
//       }),
//       salary: Joi.string().trim(),
//       shiftStartTime: Joi.string().trim(),
//       shiftEndTime: Joi.string().trim(),
//       jobStartDate: Joi.date(),
//       jobEndDate: Joi.date(),
//       totalDays: Joi.number(),
//       status: Joi.string().valid(POST_STATUS.OPEN, POST_STATUS.CLOSED, POST_STATUS.PAUSED),
//       expireAt: Joi.date(),
//     })
//     .min(1)
//     .messages({
//       "object.min": "At least one field must be provided for update",
//     }),
// };

const getAllJobPost = {
  body: Joi.object().keys({
    search: Joi.string().trim().lowercase().allow("", null),

    experience: Joi.object({
      min: Joi.number().min(0),
      max: Joi.number().max(50),
    }),

    location: Joi.object({
      city: Joi.string().trim().allow("", null),
      state: Joi.string().trim().allow("", null),
      country: Joi.string().trim().allow("", null),
    }),

    salary: Joi.object({
      min: Joi.number().min(0),
      max: Joi.number().min(0),
    }),

    startDate: Joi.string()
      .trim()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .allow(null, "")
      .messages({
        "string.pattern.base": "startDate must be in YYYY-MM-DD format only",
      }),

    endDate: Joi.string()
      .trim()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .allow(null, "")
      .messages({
        "string.pattern.base": "endDate must be in YYYY-MM-DD format only",
      }),

    status: Joi.string().valid(POST_STATUS.OPEN, POST_STATUS.CLOSED, POST_STATUS.PAUSED).allow(null, ""),

    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),

    sortField: Joi.string().valid("createdAt", "salary", "jobStartDate", "jobEndDate", "title").default("createdAt"),
    sortOrder: Joi.string().valid("asc", "desc").default("desc"),
    isActive: Joi.boolean().optional(),
  }),
};

const getJobPostDetails = {
  params: Joi.object().keys({
    id: objectId("id").required().messages({
      "any.required": "{#label} is required",
      "string.empty": "{#label} cannot be empty",
    }),
  }),
};

// job application -----------------------------
const applyJob = {
  body: Joi.object({
    jobPostId: objectId("Job Post ID").required(),
  }),
};

const hireApplicant = {
  params: Joi.object().keys({
    applicationId: objectId("Application ID").required(),
  })
};

const updateApplicationStatus = {
  params: Joi.object().keys({
    applicationId: objectId("Application ID").required(),
  }),
  body: Joi.object({
    status: Joi.string()
      .valid(...Object.values(APPLICATION_STATUS))
      .required()
      .label("Application Status")
      .messages({
        "any.only": "{#label} must be one of the allowed statuses",
        "any.required": "{#label} is required",
      }),
  }),
};

const getAllApplications = {
  query: Joi.object().keys({
    applicantId: Joi.string().hex().length(24).optional(),
    jobPostId: Joi.string().hex().length(24).optional(),

    status: Joi.string()
      .valid(
        APPLICATION_STATUS.APPLIED,
        APPLICATION_STATUS.REJECTED,
        APPLICATION_STATUS.HIRED,
        APPLICATION_STATUS.CANCELED,
        APPLICATION_STATUS.COMPLETED,
        APPLICATION_STATUS.VERIFIED,
      )
      .optional(),

    search: Joi.string().allow("", null),

    skill: Joi.string().allow("", null),
    phone: Joi.string().allow("", null),
    profession: Joi.string().allow("", null),

    minExperience: Joi.number().min(0),
    maxExperience: Joi.number().max(50),

    startDate: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .allow(null, ""),

    endDate: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .allow(null, ""),

    isActive: Joi.boolean().optional(),

    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),

    sortField: Joi.string()
      .valid("createdAt", "status", "applicantId", "jobPostId")
      .default("createdAt"),

    sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  }),
};

const getApplicationDetail = {
  params: Joi.object().keys({
    id: Joi.string().required().messages({
      "any.required": "Application ID is required",
      "string.empty": "Application ID cannot be empty",
    }),
  }),
};


module.exports = {
  addJobPost,
  // editJobPost,
  getAllJobPost,
  getJobPostDetails,
  applyJob,
  updateApplicationStatus,
  getAllApplications,
  hireApplicant,
  getApplicationDetail,
};
