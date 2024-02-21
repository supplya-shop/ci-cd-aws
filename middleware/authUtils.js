const nodemailer = require("nodemailer");

const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiration = new Date();
  expiration.setTime(expiration.getTime() + 30 * 60 * 1000);
  return { otp, expiration };
};

const sendOTP = async (email, otpData) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const expirationTime = otpData.expiration.toLocaleString();

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: "OTP for Registration",
    text: `Your OTP for registration is: ${otpData.otp}. It will expire at ${expirationTime}.`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = generateOTP;
module.exports = sendOTP;
