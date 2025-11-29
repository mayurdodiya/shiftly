const Joi = require("joi");
const { APPLICATION_STATUS } = require("../utils/constant");

// Common ObjectId validation with label
const objectId = (label = "id") =>
  Joi.string().trim().length(24).hex().label(label).messages({
    "string.base": "{#label} must be a string",
    "string.length": "{#label} must be 24 characters long",
    "string.hex": "{#label} must contain only hexadecimal characters",
  });

  const dateFormate = "/^(?:(?:31-(?:01|03|05|07|08|10|12))|(?:29|30-(?:01|03|04|05|06|07|08|09|10|11|12))|(?:29-02-(?:\d\d(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00))|(?:0[1-9]|1\d|2[0-8]-(?:01|02|03|04|05|06|07|08|09|10|11|12)))-\d{4}$/"


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
      .pattern(dateFormate)
      .required()
      .messages({
        "string.pattern.base": "jobStartDate must be in YYYY-MM-DD format only",
      }),

    jobEndDate: Joi.string()
      .trim()
      .lowercase()
      .pattern(dateFormate)
      .required()
      .messages({
        "string.pattern.base": "jobEndDate must be in YYYY-MM-DD format only",
      }),

    isActive: Joi.boolean().default(true),
    transactionId: Joi.string().required(),
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
      .pattern(dateFormate)
      .allow(null, "")
      .messages({
        "string.pattern.base": "startDate must be in YYYY-MM-DD format only",
      }),

    endDate: Joi.string()
      .trim()
      .pattern(dateFormate)
      .allow(null, "")
      .messages({
        "string.pattern.base": "endDate must be in YYYY-MM-DD format only",
      }),

    status: Joi.string()
      .valid(...Object.values(APPLICATION_STATUS))
      .allow(null, ""),

    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),

    sortField: Joi.string().valid("createdAt", "salary", "jobStartDate", "jobEndDate", "title").default("createdAt"),
    sortOrder: Joi.string().valid("asc", "desc").default("desc"),
    isActive: Joi.boolean().optional(),
  }),
};

const viewAllUpcomingJobs = {
  body: Joi.object().keys({
    search: Joi.string().trim().lowercase().allow("", null),

    salary: Joi.object({
      min: Joi.number().min(0),
      max: Joi.number().min(0),
    }),

    startDate: Joi.string()
      .trim()
      .pattern(dateFormate)
      .allow(null, "")
      .messages({
        "string.pattern.base": "startDate must be in YYYY-MM-DD format only",
      }),

    endDate: Joi.string()
      .trim()
      .pattern(dateFormate)
      .allow(null, "")
      .messages({
        "string.pattern.base": "endDate must be in YYYY-MM-DD format only",
      }),

    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
  }),
};

const viewAllOngoingJobs = {
  body: Joi.object().keys({
    search: Joi.string().trim().lowercase().allow("", null),

    salary: Joi.object({
      min: Joi.number().min(0),
      max: Joi.number().min(0),
    }),

    startDate: Joi.string()
      .trim()
      .pattern(dateFormate)
      .allow(null, "")
      .messages({
        "string.pattern.base": "startDate must be in YYYY-MM-DD format only",
      }),

    endDate: Joi.string()
      .trim()
      .pattern(dateFormate)
      .allow(null, "")
      .messages({
        "string.pattern.base": "endDate must be in YYYY-MM-DD format only",
      }),

    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
  }),
};

const viewAllCompletedJobs = {
  body: Joi.object().keys({
    search: Joi.string().trim().lowercase().allow("", null),

    salary: Joi.object({
      min: Joi.number().min(0),
      max: Joi.number().min(0),
    }),

    startDate: Joi.string()
      .trim()
      .pattern(dateFormate)
      .allow(null, "")
      .messages({
        "string.pattern.base": "startDate must be in YYYY-MM-DD format only",
      }),

    endDate: Joi.string()
      .trim()
      .pattern(dateFormate)
      .allow(null, "")
      .messages({
        "string.pattern.base": "endDate must be in YYYY-MM-DD format only",
      }),

    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
  }),
};

const viewAllVerifiedJobs = {
  body: Joi.object().keys({
    search: Joi.string().trim().lowercase().allow("", null),

    salary: Joi.object({
      min: Joi.number().min(0),
      max: Joi.number().min(0),
    }),

    startDate: Joi.string()
      .trim()
      .pattern(dateFormate)
      .allow(null, "")
      .messages({
        "string.pattern.base": "startDate must be in YYYY-MM-DD format only",
      }),

    endDate: Joi.string()
      .trim()
      .pattern(dateFormate)
      .allow(null, "")
      .messages({
        "string.pattern.base": "endDate must be in YYYY-MM-DD format only",
      }),

    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
  }),
};

const viewAllExpriedJobs = {
  body: Joi.object().keys({
    recruiterId: objectId("recruiterId").optional(),
    search: Joi.string().trim().lowercase().allow("", null),

    salary: Joi.object({
      min: Joi.number().min(0),
      max: Joi.number().min(0),
    }),

    startDate: Joi.string()
      .trim()
      .pattern(dateFormate)
      .allow(null, "")
      .messages({
        "string.pattern.base": "startDate must be in YYYY-MM-DD format only",
      }),

    endDate: Joi.string()
      .trim()
      .pattern(dateFormate)
      .allow(null, "")
      .messages({
        "string.pattern.base": "endDate must be in YYYY-MM-DD format only",
      }),

    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
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
  }),
};

const startJobByEmployee = {
  params: Joi.object().keys({
    jobPostId: objectId("Job Post ID").required(),
  }),
};

const completeJobByEmployee = {
  params: Joi.object().keys({
    jobPostId: objectId("Job Post ID").required(),
  }),
};

const verifiedJobByHospital = {
  params: Joi.object().keys({
    jobPostId: objectId("Job Post ID").required(),
  }),
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
      .valid(...Object.values(APPLICATION_STATUS))
      .optional(),

    search: Joi.string().allow("", null),

    skill: Joi.string().allow("", null),
    phone: Joi.string().allow("", null),
    profession: Joi.string().allow("", null),

    minExperience: Joi.number().min(0),
    maxExperience: Joi.number().max(50),

    startDate: Joi.string()
      .pattern(dateFormate)
      .allow(null, ""),

    endDate: Joi.string()
      .pattern(dateFormate)
      .allow(null, ""),

    isActive: Joi.boolean().optional(),

    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),

    sortField: Joi.string().valid("createdAt", "status", "applicantId", "jobPostId").default("createdAt"),
    sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  }),
};

const getAllMyAppliedJobApplication = {
  query: Joi.object().keys({
    jobPostId: Joi.string().hex().length(24).optional(),

    status: Joi.string()
      .valid(...Object.values(APPLICATION_STATUS))
      .optional(),

    search: Joi.string().allow("", null),

    skill: Joi.string().allow("", null),
    phone: Joi.string().allow("", null),
    profession: Joi.string().allow("", null),

    minExperience: Joi.number().min(0),
    maxExperience: Joi.number().max(50),

    startDate: Joi.string()
      .pattern(dateFormate)
      .allow(null, ""),

    endDate: Joi.string()
      .pattern(dateFormate)
      .allow(null, ""),

    isActive: Joi.boolean().optional(),

    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),

    sortField: Joi.string().valid("createdAt", "status", "applicantId", "jobPostId").default("createdAt"),
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
  getAllMyAppliedJobApplication,
  hireApplicant,
  startJobByEmployee,
  getApplicationDetail,
  viewAllUpcomingJobs,
  viewAllOngoingJobs,
  viewAllCompletedJobs,
  viewAllVerifiedJobs,
  viewAllExpriedJobs,
  completeJobByEmployee,
  verifiedJobByHospital,
};
