const nodemailer = require("nodemailer");
const nodemailerConfig = require("./nodemailerConfig");

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport(nodemailerConfig);

  return transporter.sendMail({
    from: `"Banker Staff" <${nodemailerConfig.auth.user}>`, // sender address
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
