const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create /uploads folder if not exists
const uploadDir = path.join(__dirname, "..", "uploads/image");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = function (req, file, cb) {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    return cb(new Error("Only JPEG, JPG and PNG files are allowed"));
  }
};

const upload = multer({
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit
  fileFilter,
  storage,
});
module.exports = upload;
