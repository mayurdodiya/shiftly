// const sendGridMail = require("@sendgrid/mail");
// sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);
const logger = require("../config/logger");

// const sgMail = require("@sendgrid/mail");
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// const msg = {
//   to: "test@example.com",
//   from: "test@example.com", // Use the email address or domain you verified above
//   subject: "Sending with Twilio SendGrid is Fun",
//   text: "and easy to do anywhere, even with Node.js",
//   html: "<strong>and easy to do anywhere, even with Node.js</strong>",
// };
// //ES6
// sgMail.send(msg).then(
//   () => {},
//   (error) => {
//     logger.log("Sending mail with Sendgrind");
//     if (error.response) {
//       logger.error("Error while Sending mail", error.response.body);
//     }
//   }
// );

// const sendEmail = async ({ to, subject, text, html }) => {
//   const msg = {
//     to,
//     from: process.env.SENDGRID_FROM_EMAIL, // Make sure this is verified in SendGrid
//     subject,
//     text,
//     html,
//   };

//   try {
//     await sgMail.send(msg);
//     logger.info(`Email sent to ${to}`);
//   } catch (error) {
//     logger.error("Error sending email via SendGrid");
//     if (error.response) {
//       logger.error(error.response.body);
//     } else {
//       logger.error(error.message);
//     }
//     throw error;
//   }
// };

// module.exports = sendEmail;

// utils/sendEmail.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com", // Use your mail server (e.g., Gmail, Mailtrap, etc.)
  port: process.env.MAIL_PORT || 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: process.env.MAIL_USER, // your email (or username for SMTP)
    pass: process.env.MAIL_PASS, // your email password or app-specific password
  },
});

/**
 * Send email with nodemailer
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    logger.info(`Email sent: ${info.messageId}`);
  } catch (error) {
    logger.error("Error sending email via Nodemailer:", error.message);
    throw error;
  }
};

module.exports = sendEmail;

