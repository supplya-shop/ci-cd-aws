const nodemailer = require("nodemailer");

const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  const expiration = new Date();
  expiration.setTime(expiration.getTime() + 30 * 60 * 1000);
  return { otp, expiration };
};

const sendOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: "Supplya: Your OTP for Registration",
    text: `Your OTP for registration is: ${otp}. It will expire in 30 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

const sendConfirmationEmail = async (email) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: "Supplya: Registration Confirmation",
    text: "Welcome to Supplya! You have been successfully registered.",
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  generateOTP,
  sendOTP,
  sendConfirmationEmail,
};
