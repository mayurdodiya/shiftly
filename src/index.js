const express = require("express");
require("dotenv").config();
const logger = require("./config/logger");
const connectDB = require("./db/dbConnection");
const routes = require("./routes");
const message = require("./json/message.json");
const cors = require("cors");
const { default: helmet } = require("helmet");
const morgan = require("./config/morgan");
const path = require("path");
const app = express();
const apiResponse = require("./utils/api.response");
const multer = require("multer");
const adminSeeder = require("./seeder/admin.seeder");
const settingSeeder = require("./seeder/setting.seeder");

// MIDDLEWARES MUST COME BEFORE SERVER START

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.options("*", cors());
app.use(cors({ origin: "*" }));
app.use(helmet());

app.use(morgan.successHandler);
app.use(morgan.errorHandler);

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.post("/test", (req, res) => {
  console.log(req.body); // should print body now
  return res.send("ok");
});

app.use("/api", routes);

// error handling middleware
app.use((err, req, res, next) => {
  console.log(err.message);
  return res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: message.route_not_found });
});

// START SERVER AFTER EVERYTHING IS SET
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
      logger.info(`Server is running`);
    });
  })
  .catch((error) => console.log(error));

// settingSeeder();
// adminSeeder();
