const nodemailer = require("nodemailer");

const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  const expiration = new Date();
  expiration.setTime(expiration.getTime() + 30 * 60 * 1000);
  return { otp, expiration };
};

// const capitalizeFirstLetter = (string) => {
//   return string.charAt(0).toUpperCase() + string.slice(1);
// };

const sendOTPMail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const otpString = otp.toString().padStart(6, "0").replace(/\s/g, "0");

  const mailOptions = {
    from: {
      name: "Supplya",
      address: process.env.EMAIL_USERNAME,
    },
    to: email,
    subject: "Supplya OTP",
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>OTP</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
      rel="stylesheet"
    />
  </head>

  <body style="margin: 0; padding: 0; font-family: 'Lato', sans-serif">
    <table
      style="padding: 10px 20px"
      role="presentation"
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="100%"
      bgcolor="#FFFFFF"
    >
      <tr>
        <td>
          <div
            align="center"
            style="
              margin-top: 30px;
              margin-bottom: 30px;
              display: flex;
              margin: 0 auto;
              background-color: #0199a4;
              width: 70%;
            "
          >
            <img
              src="https://i.postimg.cc/85Gw5Rhv/Supplya-Logo-Y-BGB.jpg"
              alt="Supplya-Logo-on-GBG"
              style="text-align: left; width: 90px; margin-left: 70px"
            />
          </div>
          <table
            align="center"
            bgcolor="#F4F6F8"
            width="70%"
            style="border-radius: 15px; padding: 0"
          >
            <tr>
              <td>
                <table
                  align="center"
                  style="padding-left: 32px; padding-right: 32px"
                  border="0"
                  cellspacing="0"
                  cellpadding="0"
                  width="80%"
                >
                  <tr>
                    <td style="padding: 0; margin-top: 20px; text-align: left">
                      <table
                        align="center"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="border-collapse: collapse"
                      >
                        <tr>
                          <td style="color: #153643">
                            <p
                              style="
                                font-size: 14px;
                                font-weight: 600;
                                margin-top: 40px;
                                text-align: left;
                                font-size: 18px;
                                color: #131417;
                              "
                            >
                              Your One-Time Password for Account Verification
                            </p>
                            <p
                              style="
                                font-size: 14px;
                                text-align: left;
                                color: #131417;
                              "
                            >
                              Thank you for registering on Supplya! To finalise
                              your registration and ensure account security,
                              please use the OTP code provided below
                            </p>
                            <div
                              style="
                                display: flex;
                                text-align: left;
                                margin-top: 35px;
                              "
                            >
                              <div
                                style="
                                  background-color: #ffffff;
                                  border-radius: 5px;
                                  margin-right: 5px;
                                  width: 60px;
                                  height: 70px;
                                "
                              >
                                <p
                                  style="
                                    font-size: 30px;
                                    text-align: center;
                                    font-weight: 600;
                                    line-height: 20px;
                                    color: #0199a4;
                                  "
                                >
                                  ${
                                    otpString.charAt(0) !== " "
                                      ? otpString.charAt(0)
                                      : "&#48;"
                                  }
                                </p>
                              </div>
                              <div
                                style="
                                  background-color: #ffffff;
                                  border-radius: 5px;
                                  margin-right: 5px;
                                  width: 60px;
                                  height: 70px;
                                "
                              >
                                <p
                                  style="
                                    font-size: 30px;
                                    text-align: center;
                                    font-weight: 600;
                                    line-height: 20px;
                                    color: #0199a4;
                                  "
                                >
                                  ${
                                    otpString.charAt(1) !== " "
                                      ? otpString.charAt(1)
                                      : "&#48;"
                                  }
                                </p>
                              </div>
                              <div
                                style="
                                  background-color: #ffffff;
                                  border-radius: 5px;
                                  margin-right: 5px;
                                  width: 60px;
                                  height: 70px;
                                "
                              >
                                <p
                                  style="
                                    font-size: 30px;
                                    text-align: center;
                                    font-weight: 600;
                                    line-height: 20px;
                                    color: #0199a4;
                                  "
                                >
                                  ${
                                    otpString.charAt(2) !== " "
                                      ? otpString.charAt(2)
                                      : "&#48;"
                                  }
                                </p>
                              </div>
                              <div
                                style="
                                  background-color: #ffffff;
                                  border-radius: 5px;
                                  margin-right: 5px;
                                  width: 60px;
                                  height: 70px;
                                "
                              >
                                <p
                                  style="
                                    font-size: 30px;
                                    text-align: center;
                                    font-weight: 600;
                                    line-height: 20px;
                                    color: #0199a4;
                                  "
                                >
                                  ${
                                    otpString.charAt(3) !== " "
                                      ? otpString.charAt(3)
                                      : "&#48;"
                                  }
                                </p>
                              </div>
                              <div
                                style="
                                  background-color: #ffffff;
                                  border-radius: 5px;
                                  margin-right: 5px;
                                  width: 60px;
                                  height: 70px;
                                "
                              >
                                <p
                                  style="
                                    font-size: 30px;
                                    text-align: center;
                                    font-weight: 600;
                                    line-height: 20px;
                                    color: #0199a4;
                                  "
                                >
                                  ${
                                    otpString.charAt(4) !== " "
                                      ? otpString.charAt(4)
                                      : "&#48;"
                                  }
                                </p>
                              </div>
                              <div
                                style="
                                  background-color: #ffffff;
                                  border-radius: 5px;
                                  margin-right: 5px;
                                  width: 60px;
                                  height: 70px;
                                "
                              >
                                <p
                                  style="
                                    font-size: 30px;
                                    text-align: center;
                                    font-weight: 600;
                                    line-height: 20px;
                                    color: #0199a4;
                                  "
                                >
                                  ${
                                    otpString.charAt(5) !== " "
                                      ? otpString.charAt(5)
                                      : "&#48;"
                                  }
                                </p>
                              </div>
                            </div>
                            <p
                              style="
                                font-size: 14px;
                                line-height: 20px;
                                color: #131417;
                                text-align: left;
                                margin-top: 40px;
                              "
                            >
                              Enter this code to
                              verify your email and complete the registration
                              process securely.
                            </p>
                          </td>
                        </tr>

                        <tr>
                          <td style="font-size: 14px; line-height: 16px">
                            <p
                              style="
                                margin-top: 35px;
                                text-align: left;
                                margin-bottom: 35px;
                                line-height: 20px;
                                font-weight: 400;
                                color: #131417;
                              "
                            >
                              If you did not request this OTP code, please
                              disregard this email.
                            </p>
                            <p
                              style="
                                color: #131417;
                                text-align: left;
                                font-weight: 400;
                                line-height: 15px;
                              "
                            >
                              Thank you,
                            </p>
                            <p
                              style="
                                color: #131417;
                                text-align: left;
                                font-weight: 400;
                                line-height: 15px;
                              "
                            >
                              Supplya Team.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center">
          <footer>
            <a
              style="
                display: flex;
                justify-content: center;
                align-items: center;
                text-decoration: none;
                background-color: #0199a4;
                color: white;
                border-radius: 6px;
                padding: 10px 25px;
                width: fit-content;
                margin: 0 auto;
                cursor: pointer;
                margin-top: 20px;
              "
              href="https://supplya-web.vercel.app/auth/sign-in"
              >Verify Account</a
            >
            <p style="color: #131417; margin-top: 20px; font-size: 14px">
              Copyright © 2024 Supplya
            </p>
          </footer>
        </td>
      </tr>
    </table>
  </body>
</html>
`,
  };
  await transporter.sendMail(mailOptions);
};

const resendOTPMail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const otpString = otp.toString().padStart(6, "0").replace(/\s/g, "0");

  const mailOptions = {
    from: {
      name: "Supplya",
      address: process.env.EMAIL_USERNAME,
    },
    to: email,
    subject: "Supplya OTP",
    html: `<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Resend OTP</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
        rel="stylesheet">
</head>

<body style="margin: 0; padding:0; font-family: 'Lato', sans-serif;">
    <table style="padding: 10px 20px;" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
        bgcolor="#FFFFFF">
        <tr>
            <td>
                <div align="center" style="margin-top:30px; margin-bottom:30px;  display: flex; margin: 0 auto; background-color: #0199a4; width: 70%;">
                    <img
              src="https://i.postimg.cc/85Gw5Rhv/Supplya-Logo-Y-BGB.jpg"
              alt="Supplya-Logo"
              style="text-align: left; width: 90px; margin-left: 70px"
            />
                </div>
                <table align="center" bgcolor="#F4F6F8" width="70%" style="border-radius: 15px; padding:0;">
                    <tr>
                        <td>
                            <table align="center" style="padding-left: 32px; padding-right:32px;" border="0"
                                cellspacing="0" cellpadding="0" width="80%">
                                
                                <tr>
                                    <td style="padding: 0; margin-top:20px; text-align:left;">
                                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
                                            style="border-collapse: collapse;">
                                            <tr>
                                                <td style="color: #153643;">
                                                    
                                                    <p style="font-size:14px; font-weight: 600; margin-top: 40px; text-align: left; font-size: 18px; color:#131417;">
                                                        Your One-Time Password for Account Verification 🔄
                                                    </p>
                                                    <p style="font-size:14px; text-align: left; color:#131417;">
                                                        Here's that brand new OTP you requested! Please enter the code provided below:
                                                    </p>
                                                    <div style="display:flex; text-align: left; margin-top: 35px;">
                                                        <div style="background-color: #FFFFFF; border-radius:5px; margin-right:5px;  width:60px; height:70px;">
                                                            <p
                                                                style="font-size: 30px; text-align:center; font-weight:600;   line-height:20px; color:#0199a4;">
                                                                ${
                                                                  otpString.charAt(
                                                                    0
                                                                  ) !== " "
                                                                    ? otpString.charAt(
                                                                        0
                                                                      )
                                                                    : "&#48;"
                                                                }
                                                            </p>
                                                        </div>
                                                        <div style="background-color: #FFFFFF; border-radius:5px; margin-right:5px; width:60px; height:70px;">
                                                            <p
                                                                style="font-size: 30px; text-align:center; font-weight:600;   line-height:20px; color:#0199a4;">
                                                                ${
                                                                  otpString.charAt(
                                                                    1
                                                                  ) !== " "
                                                                    ? otpString.charAt(
                                                                        1
                                                                      )
                                                                    : "&#48;"
                                                                }
                                                            </p>
                                                        </div>
                                                        <div style="background-color: #FFFFFF; border-radius:5px; margin-right:5px;  width:60px; height:70px;">
                                                            <p
                                                                style="font-size: 30px; text-align:center; font-weight:600;   line-height:20px; color:#0199a4;">
                                                                ${
                                                                  otpString.charAt(
                                                                    2
                                                                  ) !== " "
                                                                    ? otpString.charAt(
                                                                        2
                                                                      )
                                                                    : "&#48;"
                                                                }
                                                            </p>
                                                        </div>
                                                        <div style="background-color: #FFFFFF; border-radius:5px; margin-right:5px;  width:60px; height:70px;">
                                                            <p
                                                                style="font-size: 30px; text-align:center; font-weight:600;   line-height:20px; color:#0199a4;">
                                                                ${
                                                                  otpString.charAt(
                                                                    3
                                                                  ) !== " "
                                                                    ? otpString.charAt(
                                                                        3
                                                                      )
                                                                    : "&#48;"
                                                                }
                                                            </p>
                                                        </div>
                                                        <div style="background-color: #FFFFFF; border-radius:5px; margin-right:5px;  width:60px; height:70px;">
                                                            <p
                                                                style="font-size: 30px; text-align:center; font-weight:600;   line-height:20px; color:#0199a4;">
                                                                ${
                                                                  otpString.charAt(
                                                                    4
                                                                  ) !== " "
                                                                    ? otpString.charAt(
                                                                        4
                                                                      )
                                                                    : "&#48;"
                                                                }
                                                            </p>
                                                        </div>
                                                        <div style="background-color: #FFFFFF; border-radius:5px; margin-right:5px;  width:60px; height:70px;">
                                                            <p
                                                                style="font-size: 30px; text-align:center; font-weight:600;   line-height:20px; color:#0199a4;">
                                                                ${
                                                                  otpString.charAt(
                                                                    5
                                                                  ) !== " "
                                                                    ? otpString.charAt(
                                                                        5
                                                                      )
                                                                    : "&#48;"
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p
                                                        style="font-size:14px; line-height:20px; color:#131417; text-align:left; margin-top: 50px;">
                                                        Enter this code to verify your email and complete the process securely.
                                                    </p>

                                            </tr>
                                            
                                            <tr>
                                                <td style="font-size: 14px; line-height: 16px">
                                                    <p
                                                        style="margin-top: 35px; text-align: left; margin-bottom: 35px; line-height: 20px; font-weight: 400; color:#131417;">
                                                        If you did not request this OTP code, please disregard this email.</p>
                                                    <p
                                                        style="color:#131417; text-align: left; font-weight:400; line-height: 15px;">
                                                        Thank you,</p>
                                                    <p
                                                        style="color:#131417; text-align: left; font-weight:400; line-height: 15px;">
                                                        Supplya Team.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
        <tr>
            <td align="center">
                <footer>
                    <p style="color: #131417; margin-top: 20px; font-size: 14px;">Copyright © 2024 Supplya</p>
                </footer>
            </td>
        </tr>
    </table>
</body>

    </html>`,
  };
  await transporter.sendMail(mailOptions);
};

const sendConfirmationMail = async (email) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: {
      name: "Welcome to Supplya",
      address: process.env.EMAIL_USERNAME,
    },
    to: email,
    subject: "Registration Complete",
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Registration successful</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
      rel="stylesheet"
    />
  </head>

  <style>
    a:hover {
      background-color: #02555b;
    }
  </style>

  <body style="margin: 0; padding: 0; font-family: 'Lato', sans-serif">
    <table
      style="padding: 10px 20px"
      role="presentation"
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="100%"
      bgcolor="#FFFFFF"
    >
      <tr>
        <td>
          <div
            align="center"
            style="
              margin-top: 30px;
              margin-bottom: 30px;
              display: flex;
              margin: 0 auto;
              background-color: #0199a4;
              width: 70%;
            "
          >
            <img
              src="https://i.postimg.cc/85Gw5Rhv/Supplya-Logo-Y-BGB.jpg"
              alt="Supplya-Logo"
              style="text-align: left; width: 90px; margin-left: 70px"
            />
          </div>
          <table
            align="center"
            bgcolor="#F4F6F8"
            width="70%"
            style="border-radius: 15px; padding: 0"
          >
            <tr>
              <td>
                <table
                  align="center"
                  style="padding-left: 32px; padding-right: 32px"
                  border="0"
                  cellspacing="0"
                  cellpadding="0"
                  width="80%"
                >
                  <tr>
                    <td style="padding: 0; margin-top: 20px; text-align: left">
                      <table
                        align="center"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="border-collapse: collapse"
                      >
                        <tr>
                          <td style="color: #153643">
                            <p
                              style="
                                font-size: 14px;
                                font-weight: 600;
                                margin-top: 40px;
                                text-align: left;
                                font-size: 18px;
                                color: #131417;
                              "
                            >
                              Registration complete! 🚀
                            </p>
                            <p
                              style="
                                font-size: 14px;
                                text-align: left;
                                color: #131417;
                                margin-bottom: 30px;
                                line-height: 20px;
                              "
                            >
                              You have successfully completed your registration
                              on <span style="font-weight: 600"> Supplya</span>!
                              Click the link below to experience a
                              new world of buying and selling!
                            </p>

                            <a
                              style="
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                text-decoration: none;
                                background-color: #0199a4;
                                color: white;
                                border-radius: 6px;
                                padding: 10px 25px;
                                width: fit-content;
                                margin: 0 auto;
                                cursor: pointer;
                              "
                              href="https://supplya-web.vercel.app/auth/sign-in"
                              >Login</a
                            >
                          </td>
                        </tr>

                        <tr>
                          <td style="font-size: 14px; line-height: 16px">
                            <div style="text-align: right">
                              <p
                                style="
                                  color: #131417;
                                  font-weight: 400;
                                  margin-top: 30px;
                                "
                              >
                                Thank you,
                              </p>
                              <p style="color: #131417; font-weight: 400">
                                Supplya Team.
                              </p>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center">
          <footer>
            <p style="color: #131417; margin-top: 30px; font-size: 14px">
              Copyright © 2024 Supplya
            </p>
          </footer>
        </td>
      </tr>
    </table>
  </body>
</html>
`,
  };

  await transporter.sendMail(mailOptions);
};

const newUserSignUpMail = async (email = null, phoneNumber = null) => {
  const identifier = email || phoneNumber;
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: {
      name: "Supplya",
      address: process.env.EMAIL_USERNAME,
    },
    to: process.env.EMAIL_USERNAME,
    subject: "New User Alert!  🎉",
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>New User Registration</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
      rel="stylesheet"
    />
  </head>

  <style>
    a:hover {
      background-color: #02555b;
    }
  </style>

  <body style="margin: 0; padding: 0; font-family: 'Lato', sans-serif">
    <table
      style="padding: 10px 20px"
      role="presentation"
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="100%"
      bgcolor="#FFFFFF"
    >
      <tr>
        <td>
          <div
            align="center"
            style="
              margin-top: 30px;
              margin-bottom: 30px;
              display: flex;
              margin: 0 auto;
              background-color: #0199a4;
              width: 70%;
            "
          >
            <img
              src="https://i.postimg.cc/85Gw5Rhv/Supplya-Logo-Y-BGB.jpg"
              alt="Supplya-Logo-on-GBG"
              style="text-align: left; width: 90px; margin-left: 70px"
            />
          </div>
          <table
            align="center"
            bgcolor="#F4F6F8"
            width="70%"
            style="border-radius: 15px; padding: 0"
          >
            <tr>
              <td>
                <table
                  align="center"
                  style="padding-left: 32px; padding-right: 32px"
                  border="0"
                  cellspacing="0"
                  cellpadding="0"
                  width="80%"
                >
                  <tr>
                    <td style="padding: 0; margin-top: 20px; text-align: left">
                      <table
                        align="center"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="border-collapse: collapse"
                      >
                        <tr>
                          <td style="color: #153643">
                            <p
                              style="
                                font-size: 14px;
                                font-weight: 600;
                                margin-top: 20px;
                                text-align: left;
                                font-size: 18px;
                                color: #131417;
                              "
                            >
                              New User Onboarded 🎊 
                            </p>
                            <p
                              style="
                                font-size: 14px;
                                text-align: left;
                                color: #131417;
                                margin-bottom: 25px;
                                line-height: 20px;
                              "
                            >
                              A new user <span style="font-weight: 600"> ${identifier} </span>
                              has just registered on Supplya! 🥳
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center">
          <footer>
            <p style="color: #131417; margin-top: 30px; font-size: 14px">
              Copyright © 2024 Supplya
            </p>
          </footer>
        </td>
      </tr>
    </table>
  </body>
</html>
`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending signup email:", error.message);
  }
};

const newVendorSignUpMail = async (email) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: {
      name: "Supplya",
      address: process.env.EMAIL_USERNAME,
    },
    to: process.env.EMAIL_USERNAME,
    subject: "New Vendor Alert!  🎉",
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>New Vendor Registration</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
      rel="stylesheet"
    />
  </head>

  <style>
    a:hover {
      background-color: #02555b;
    }
  </style>

  <body style="margin: 0; padding: 0; font-family: 'Lato', sans-serif">
    <table
      style="padding: 10px 20px"
      role="presentation"
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="100%"
      bgcolor="#FFFFFF"
    >
      <tr>
        <td>
          <div
            align="center"
            style="
              margin-top: 30px;
              margin-bottom: 30px;
              display: flex;
              margin: 0 auto;
              background-color: #0199a4;
              width: 70%;
            "
          >
            <img
              src="https://i.postimg.cc/4HKm5g4g/Supplya-Logo-on-GBG.png"
              alt="Supplya-Logo-on-GBG"
              style="text-align: left; width: 90px; margin-left: 70px"
            />
          </div>
          <table
            align="center"
            bgcolor="#F4F6F8"
            width="70%"
            style="border-radius: 15px; padding: 0"
          >
            <tr>
              <td>
                <table
                  align="center"
                  style="padding-left: 32px; padding-right: 32px"
                  border="0"
                  cellspacing="0"
                  cellpadding="0"
                  width="80%"
                >
                  <tr>
                    <td style="padding: 0; margin-top: 20px; text-align: left">
                      <table
                        align="center"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="border-collapse: collapse"
                      >
                        <tr>
                          <td style="color: #153643">
                            <p
                              style="
                                font-size: 14px;
                                font-weight: 600;
                                margin-top: 20px;
                                text-align: left;
                                font-size: 18px;
                                color: #131417;
                              "
                            >
                              New User Onboarded 🎊 
                            </p>
                            <p
                              style="
                                font-size: 14px;
                                text-align: left;
                                color: #131417;
                                margin-bottom: 25px;
                                line-height: 20px;
                              "
                            >
                              A new vendor <span style="font-weight: 600"> ${email} </span>
                              has just registered on Supplya! 🥳
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center">
          <footer>
            <p style="color: #131417; margin-top: 30px; font-size: 14px">
              Copyright © 2024 Supplya
            </p>
          </footer>
        </td>
      </tr>
    </table>
  </body>
</html>
`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending new vendor signup mail:", error.message);
  }
};

const forgotPasswordMail = async (email, resetCode) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: {
      name: "Supplya",
      address: process.env.EMAIL_USERNAME,
    },
    to: email,
    subject: "Forgot Password",
    html: `
       <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Forgot Password</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
      rel="stylesheet"
    />
  </head>

  <style>
    a:hover {
      background-color: #02555b;
    }
  </style>

  <body style="margin: 0; padding: 0; font-family: 'Lato', sans-serif">
    <table
      style="padding: 10px 20px"
      role="presentation"
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="100%"
      bgcolor="#FFFFFF"
    >
      <tr>
        <td>
          <div
            align="center"
            style="
              margin-top: 30px;
              margin-bottom: 30px;
              display: flex;
              margin: 0 auto;
              background-color: #0199a4;
              width: 70%;
            "
          >
            <img
              src="https://i.postimg.cc/4HKm5g4g/Supplya-Logo-on-GBG.png"
              alt="Supplya-Logo-on-GBG"
              style="text-align: left; width: 90px; margin-left: 70px"
            />
          </div>
          <table
            align="center"
            bgcolor="#F4F6F8"
            width="70%"
            style="border-radius: 15px; padding: 0"
          >
            <tr>
              <td>
                <table
                  align="center"
                  style="padding-left: 32px; padding-right: 32px"
                  border="0"
                  cellspacing="0"
                  cellpadding="0"
                  width="80%"
                >
                  <tr>
                    <td style="padding: 0; margin-top: 20px; text-align: left">
                      <table
                        align="center"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="border-collapse: collapse"
                      >
                        <tr>
                          <td style="color: #153643">
                            <p
                              style="
                                font-size: 14px;
                                font-weight: 600;
                                margin-top: 40px;
                                text-align: left;
                                font-size: 18px;
                                color: #131417;
                              "
                            >
                              Reset Your Password  📟
                            </p>
                            <p
                              style="
                                font-size: 14px;
                                text-align: left;
                                color: #131417;
                                margin-bottom: 30px;
                                line-height: 20px;
                              "
                            >
                              You are receiving this email because you (or
                              someone else) has requested a password reset for
                              your account.
                            </p>
                            <div
                              style="
                                display: flex;
                                text-align: left;
                                margin-top: 40px;
                              "
                            >
                              <div
                                style="
                                  background-color: #ffffff;
                                  border-radius: 5px;
                                  margin-right: 5px;
                                  width: 60px;
                                  height: 70px;
                                "
                              >
                                <p
                                  style="
                                    font-size: 30px;
                                    text-align: center;
                                    font-weight: 600;
                                    line-height: 20px;
                                    color: #0199a4;
                                  "
                                >
                                  ${
                                    resetCode.charAt(0) !== " "
                                      ? resetCode.charAt(0)
                                      : "&#48;"
                                  }
                                </p>
                              </div>
                              <div
                                style="
                                  background-color: #ffffff;
                                  border-radius: 5px;
                                  margin-right: 5px;
                                  width: 60px;
                                  height: 70px;
                                "
                              >
                                <p
                                  style="
                                    font-size: 30px;
                                    text-align: center;
                                    font-weight: 600;
                                    line-height: 20px;
                                    color: #0199a4;
                                  "
                                >
                                  ${
                                    resetCode.charAt(1) !== " "
                                      ? resetCode.charAt(1)
                                      : "&#48;"
                                  }
                                </p>
                              </div>
                              <div
                                style="
                                  background-color: #ffffff;
                                  border-radius: 5px;
                                  margin-right: 5px;
                                  width: 60px;
                                  height: 70px;
                                "
                              >
                                <p
                                  style="
                                    font-size: 30px;
                                    text-align: center;
                                    font-weight: 600;
                                    line-height: 20px;
                                    color: #0199a4;
                                  "
                                >
                                  ${
                                    resetCode.charAt(2) !== " "
                                      ? resetCode.charAt(2)
                                      : "&#48;"
                                  }
                                </p>
                              </div>
                              <div
                                style="
                                  background-color: #ffffff;
                                  border-radius: 5px;
                                  margin-right: 5px;
                                  width: 60px;
                                  height: 70px;
                                "
                              >
                                <p
                                  style="
                                    font-size: 30px;
                                    text-align: center;
                                    font-weight: 600;
                                    line-height: 20px;
                                    color: #0199a4;
                                  "
                                >
                                  ${
                                    resetCode.charAt(3) !== " "
                                      ? resetCode.charAt(3)
                                      : "&#48;"
                                  }
                                </p>
                              </div>
                              <div
                                style="
                                  background-color: #ffffff;
                                  border-radius: 5px;
                                  margin-right: 5px;
                                  width: 60px;
                                  height: 70px;
                                "
                              >
                                <p
                                  style="
                                    font-size: 30px;
                                    text-align: center;
                                    font-weight: 600;
                                    line-height: 20px;
                                    color: #0199a4;
                                  "
                                >
                                  ${
                                    resetCode.charAt(4) !== " "
                                      ? resetCode.charAt(4)
                                      : "&#48;"
                                  }
                                </p>
                              </div>
                              <div
                                style="
                                  background-color: #ffffff;
                                  border-radius: 5px;
                                  margin-right: 5px;
                                  width: 60px;
                                  height: 70px;
                                "
                              >
                                <p
                                  style="
                                    font-size: 30px;
                                    text-align: center;
                                    font-weight: 600;
                                    line-height: 20px;
                                    color: #0199a4;
                                  "
                                >
                                  ${
                                    resetCode.charAt(5) !== " "
                                      ? resetCode.charAt(5)
                                      : "&#48;"
                                  }
                                </p>
                              </div>
                            </div>
                            <p style="font-size: 14px; margin-top: 30px;">
                              This code will expire in 30 minutes. Please go to
                              the following page and enter this code to reset
                              your password:
                            </p>
                            <a
                              style="
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                text-decoration: none;
                                background-color: #0199a4;
                                color: white;
                                border-radius: 6px;
                                padding: 10px 25px;
                                width: fit-content;
                                margin: 0 auto;
                                cursor: pointer;
                                margin-top: 20px;
                              "
                              href="https://supplya-web.vercel.app/auth/reset-password"
                              >Reset Password</a
                            >

                            <p
                              style="
                                font-size: 14px;
                                text-align: center;
                                margin-top: 25px;
                              "
                            >
                              If you did not request a password reset, please
                              ignore this email.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center">
          <footer>
            <p style="color: #131417; margin-top: 30px; font-size: 14px">
              Copyright © 2024 Supplya
            </p>
          </footer>
        </td>
      </tr>
    </table>
  </body>
</html>

`,
  };

  await transporter.sendMail(mailOptions);
};

const resetPasswordMail = async (email) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: {
      name: "Supplya",
      address: process.env.EMAIL_USERNAME,
    },
    to: email,
    subject: "Password Reset",
    html: `
       <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Reset Password</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
      rel="stylesheet"
    />
  </head>

  <style>
    a:hover {
      background-color: #02555b;
    }
  </style>

  <body style="margin: 0; padding: 0; font-family: 'Lato', sans-serif">
    <table
      style="padding: 10px 20px"
      role="presentation"
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="100%"
      bgcolor="#FFFFFF"
    >
      <tr>
        <td>
          <div
            align="center"
            style="
              margin-top: 30px;
              margin-bottom: 30px;
              display: flex;
              margin: 0 auto;
              background-color: #0199a4;
              width: 70%;
            "
          >
            <img
              src="https://i.postimg.cc/4HKm5g4g/Supplya-Logo-on-GBG.png"
              alt="Supplya-Logo-on-GBG"
              style="text-align: left; width: 90px; margin-left: 70px"
            />
          </div>
          <table
            align="center"
            bgcolor="#F4F6F8"
            width="70%"
            style="border-radius: 15px; padding: 0"
          >
            <tr>
              <td>
                <table
                  align="center"
                  style="padding-left: 32px; padding-right: 32px"
                  border="0"
                  cellspacing="0"
                  cellpadding="0"
                  width="80%"
                >
                  <tr>
                    <td style="padding: 0; margin-top: 20px; text-align: left">
                      <table
                        align="center"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="border-collapse: collapse"
                      >
                        <tr>
                          <td style="color: #153643">
                            <p
                              style="
                                font-size: 14px;
                                font-weight: 600;
                                margin-top: 40px;
                                text-align: left;
                                font-size: 18px;
                                color: #131417;
                              "
                            >
                              Password Reset Successfully 🔐
                            </p>
                            <p
                              style="
                                font-size: 14px;
                                text-align: left;
                                color: #131417;
                                margin-bottom: 30px;
                                line-height: 20px;
                              "
                            >
                              Your password has been successfully reset. If you
                              did not request a password reset, please contact
                              support immediately.
                            </p>
                            <p style="margin-bottom: 35px">
                              Support email:
                              <strong style="color: #0199a4"
                                >hi@supplya.shop</strong
                              >
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center">
          <footer>
            <p style="color: #131417; margin-top: 30px; font-size: 14px">
              Copyright © 2024 Supplya
            </p>
          </footer>
        </td>
      </tr>
    </table>
  </body>
</html>
`,
  };

  await transporter.sendMail(mailOptions);
};

const sendOrderSummaryMail = async (order) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const formattedDate = new Date(order.dateOrdered).toLocaleString();

  const mailOptions = {
    from: {
      name: "Supplya",
      address: process.env.EMAIL_USERNAME,
    },
    to: process.env.EMAIL_USERNAME,
    subject: `Order Summary for Order #${order.orderId}`,
    html: `
       <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Admin Order Summary</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
      rel="stylesheet"
    />
  </head>

  <style>
    a:hover {
      background-color: #02555b;
    }
  </style>

  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>Admin Order Summary</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
        rel="stylesheet"
      />
    </head>

    <style>
      a:hover {
        background-color: #02555b;
      }
    </style>

    <body style="margin: 0; padding: 0; font-family: 'Lato', sans-serif">
      <table
        style="padding: 10px 20px"
        role="presentation"
        border="0"
        cellpadding="0"
        cellspacing="0"
        width="100%"
        bgcolor="#FFFFFF"
      >
        <tr>
          <td>
            <div
              align="center"
              style="
                margin-top: 30px;
                margin-bottom: 30px;
                display: flex;
                margin: 0 auto;
                background-color: #0199a4;
                width: 70%;
              "
            >
              <img
                src="https://i.postimg.cc/4HKm5g4g/Supplya-Logo-on-GBG.png"
                alt="Supplya-Logo-on-GBG"
                style="text-align: left; width: 90px; margin-left: 60px"
              />
            </div>
            <table
              align="center"
              bgcolor="#F4F6F8"
              width="70%"
              style="border-radius: 15px; padding: 0"
            >
              <tr>
                <td>
                  <table
                    align="center"
                    style="padding-left: 32px; padding-right: 32px"
                    border="0"
                    cellspacing="0"
                    cellpadding="0"
                    width="80%"
                  >
                    <tr>
                      <td
                        style="padding: 0; margin-top: 20px; text-align: left"
                      >
                        <table
                          align="center"
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          style="border-collapse: collapse"
                        >
                          <tr>
                            <td style="color: #153643">
                            <p>Hi, </p>
                              <p>
                                A new order has been created with the following
                                details:
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td style="font-size: 12px; background-color: white; padding: 10px 20px;">
                              <p><strong>Order ID:</strong> ${order.orderId}</p>
                              <p>
                                <strong>Customer Name:</strong> ${
                                  order.user.firstName
                                }  ${order.user.lastName}
                              </p>
                              <p>
                                <strong>Order Status:</strong> ${
                                  order.orderStatus
                                }
                              </p>
                              <p>
                                <strong>Shipping Address:</strong> ${
                                  order.address
                                }, ${order.country}
                              </p>
                              
                              <p>
                                <strong>Customer Phone Number:</strong> ${
                                  order.phone ?? ""
                                }
                              </p>
                              <p>
                                <strong>Customer email:</strong> ${order.email}
                              </p>
                             
                              <p>
                                <strong>Order Note:</strong> ${
                                  order.orderNote ?? ""
                                }
                              </p>
                              <p>
                                <strong>Total Price:</strong> ₦${
                                  order.totalPrice
                                }
                              </p>
                              <p>
                                <strong>Payment Method:</strong> ${
                                  order.paymentMethod
                                }
                              </p>
                              <p>
                                <strong>Order Date:</strong> ${formattedDate}
                              </p>
                              <h4><strong>Order Items:</strong></h4>
                              <ul>
                                ${order.orderItems
                                  .map(
                                    (item) => `
                                <li>
                                  <p>
                                    <strong>Product Name:</strong>
                                    ${item.product.name}
                                  </p>
                                  <p>
                                    <strong>Quantity:</strong> ${item.quantity}
                                  </p>
                                  <p>
                                    <strong>Price per Unit:</strong>
                                    ₦${item.product.unit_price}
                                  </p>
                                  <p>
                                    <strong>Vendor Name:</strong>
                                    ${item.vendorDetails.firstName} ${
                                      item.vendorDetails.lastName
                                    } 
                                  </p>
                                  <p>
                                    <strong>Supplya store address:</strong>
                                    ${item.vendorDetails.storeUrl ?? ""} 
                                  </p>
                                </li>
                                `
                                  )
                                  .join(", ")}
                              </ul>
                               
                            </td>
                          </tr>
                            <tr>
                          <td style="font-size: 14px; line-height: 16px">
                            <p
                              style="
                                color: #131417;
                                text-align: left;
                                font-weight: 400;
                                line-height: 15px;
                                margin-top: 30px;
                              "
                            >
                              Regards,
                            </p>
                            <p
                              style="
                                color: #131417;
                                text-align: left;
                                font-weight: 400;
                                line-height: 15px;
                              "
                            >
                              Supplya Support.
                            </p>
                          </td>
                        </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center">
            <footer>
              <p style="color: #131417; margin-top: 30px; font-size: 14px">
                Copyright © 2024 Supplya
              </p>
            </footer>
          </td>
        </tr>
      </table>
    </body>
  </html>
</html>
`,
  };

  await transporter.sendMail(mailOptions);
};

const sendCustomerOrderSummaryMail = async (order, user, email) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const formattedDate = new Date(order.dateOrdered).toLocaleString();

  const mailOptions = {
    from: {
      name: "Supplya",
      address: process.env.EMAIL_USERNAME,
    },
    to: email,
    subject: `Order Summary for Order #${order.orderId}`,
    html: `
       <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Customer Order Summary</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
      rel="stylesheet"
    />
  </head>

  <style>
    a:hover {
      background-color: #02555b;
    }
  </style>

  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>Registration successful</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
        rel="stylesheet"
      />
    </head>

    <style>
      a:hover {
        background-color: #02555b;
      }
    </style>

    <body style="margin: 0; padding: 0; font-family: 'Lato', sans-serif">
      <table
        style="padding: 10px 20px"
        role="presentation"
        border="0"
        cellpadding="0"
        cellspacing="0"
        width="100%"
        bgcolor="#FFFFFF"
      >
        <tr>
          <td>
            <div
              align="center"
              style="
                margin-top: 30px;
                margin-bottom: 30px;
                display: flex;
                margin: 0 auto;
                background-color: #0199a4;
                width: 70%;
              "
            >
              <img
                src="https://i.postimg.cc/85Gw5Rhv/Supplya-Logo-Y-BGB.jpg"
                alt="Supplya-Logo-on-GBG"
                style="text-align: left; width: 90px; margin-left: 60px"
              />
            </div>
            <table
              align="center"
              bgcolor="#F4F6F8"
              width="70%"
              style="border-radius: 15px; padding: 0"
            >
              <tr>
                <td>
                  <table
                    align="center"
                    style="padding-left: 32px; padding-right: 32px"
                    border="0"
                    cellspacing="0"
                    cellpadding="0"
                    width="80%"
                  >
                    <tr>
                      <td
                        style="padding: 0; margin-top: 20px; text-align: left"
                      >
                        <table
                          align="center"
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          style="border-collapse: collapse"
                        >
                          <tr>
                            <td style="color: #153643">
                            <p>Hi ${user.firstName},</p>
                              <p>
                                Here is your order summary:
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td style="font-size: 12px; background-color: white; padding: 10px 20px;">
                              <p><strong>Order ID:</strong> ${order.orderId}</p>
                              <p>
                                <strong>Customer Name:</strong> ${
                                  order.user.firstName
                                }  ${order.user.lastName}
                              </p>
                              <p>
                                <strong>Order Status:</strong> ${
                                  order.orderStatus
                                }
                              </p>
                              <p>
                                <strong>Shipping Address:</strong> ${
                                  order.address
                                }, ${order.country}
                              </p>
                              <p>
                                <strong>Phone Number:</strong> ${
                                  order.phone ?? ""
                                }
                              </p>
                              <p>
                                <strong>Email:</strong> ${order.email}
                              </p>
                             
                              <p>
                                <strong>Order Note:</strong> ${
                                  order.orderNote ?? ""
                                }
                              </p>
                              <p>
                                <strong>Total Price:</strong> ₦${
                                  order.totalPrice
                                }
                              </p>
                              <p>
                                <strong>Payment Method:</strong> ${
                                  order.paymentMethod
                                }
                              </p>
                              <p>
                                <strong>Order Date:</strong> ${formattedDate}
                              </p>
                              <h4><strong>Order Items:</strong></h4>
                              <ul>
                                ${order.orderItems
                                  .map(
                                    (item) => `
                                <li>
                                  <p>
                                    <strong>Product Name:</strong>
                                    ${item.product.name}
                                  </p>
                                  <p>
                                    <strong>Quantity:</strong> ${item.quantity}
                                  </p>
                                  <p>
                                    <strong>Price per Unit:</strong>
                                    ₦${item.product.unit_price}
                                  </p>
                                  <p>
                                    <strong>Vendor Name:</strong>
                                    ${item.vendorDetails.firstName} ${
                                      item.vendorDetails.lastName
                                    } 
                                  </p>
                                  <p>
                                    <strong>Supplya store address:</strong>
                                    ${item.vendorDetails.storeUrl ?? ""} 
                                  </p>
                                </li>
                                `
                                  )
                                  .join(", ")}
                              </ul>
                              
                            </td>
                          </tr>
                            <tr>
                          <td style="font-size: 14px; line-height: 16px">
                            <p
                              style="
                                color: #131417;
                                text-align: left;
                                font-weight: 400;
                                line-height: 15px;
                                margin-top: 30px;
                              "
                            >
                              Regards,
                            </p>
                            <p
                              style="
                                color: #131417;
                                text-align: left;
                                font-weight: 400;
                                line-height: 15px;
                              "
                            >
                              Supplya Support.
                            </p>
                          </td>
                        </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center">
            <footer>
              <p style="color: #131417; margin-top: 30px; font-size: 14px">
                Copyright © 2024 Supplya
              </p>
            </footer>
          </td>
        </tr>
      </table>
    </body>
  </html>
</html>
`,
  };

  transporter.sendMail(mailOptions);
};

const sendVendorOrderSummaryMail = async (order, user) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const formattedDate = new Date(order.dateOrdered).toLocaleString();

  const mailOptions = {
    from: {
      name: "Supplya",
      address: process.env.EMAIL_USERNAME,
    },
    to: order.orderItems[0].vendorDetails.email,
    subject: `Order Summary for Order #${order.orderId}`,
    html: `
       <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Vendor Order Summary</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
      rel="stylesheet"
    />
  </head>

  <style>
    a:hover {
      background-color: #02555b;
    }
  </style>

  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>Registration successful</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
        rel="stylesheet"
      />
    </head>

    <style>
      a:hover {
        background-color: #02555b;
      }
    </style>

    <body style="margin: 0; padding: 0; font-family: 'Lato', sans-serif">
      <table
        style="padding: 10px 20px"
        role="presentation"
        border="0"
        cellpadding="0"
        cellspacing="0"
        width="100%"
        bgcolor="#FFFFFF"
      >
        <tr>
          <td>
            <div
              align="center"
              style="
                margin-top: 30px;
                margin-bottom: 30px;
                display: flex;
                margin: 0 auto;
                background-color: #0199a4;
                width: 70%;
              "
            >
              <img
                src="https://i.postimg.cc/85Gw5Rhv/Supplya-Logo-Y-BGB.jpg"
                alt="Supplya-Logo-on-GBG"
                style="text-align: left; width: 90px; margin-left: 60px"
              />
            </div>
            <table
              align="center"
              bgcolor="#F4F6F8"
              width="70%"
              style="border-radius: 15px; padding: 0"
            >
              <tr>
                <td>
                  <table
                    align="center"
                    style="padding-left: 32px; padding-right: 32px"
                    border="0"
                    cellspacing="0"
                    cellpadding="0"
                    width="80%"
                  >
                    <tr>
                      <td
                        style="padding: 0; margin-top: 20px; text-align: left"
                      >
                        <table
                          align="center"
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          style="border-collapse: collapse"
                        >
                          <tr>
                            <td style="color: #153643">
                            <p>Hi ${
                              order.orderItems[0].vendorDetails.firstName
                            },</p>
                              <p>
                                ${
                                  order.user.firstName
                                } just made an order. View the order summary below:
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td style="font-size: 12px; background-color: white; padding: 10px 20px;">
                              <p><strong>Order ID:</strong> ${order.orderId}</p>
                              <p>
                                <strong>Customer Name:</strong> ${
                                  order.user.firstName
                                }  ${order.user.lastName}
                              </p>
                              <p>
                                <strong>Order Status:</strong> ${
                                  order.orderStatus
                                }
                              </p>
                              <p>
                                <strong>Shipping Address:</strong> ${
                                  order.address
                                }, ${order.country}
                              </p>
                              <p>
                                <strong>Phone Number:</strong> ${
                                  order.phone ?? ""
                                }
                              </p>
                              <p>
                                <strong>Email:</strong> ${order.email}
                              </p>
                             
                              <p>
                                <strong>Order Note:</strong> ${
                                  order.orderNote ?? ""
                                }
                              </p>
                              <p>
                                <strong>Total Price:</strong> ₦${
                                  order.totalPrice
                                }
                              </p>
                              <p>
                                <strong>Payment Method:</strong> ${
                                  order.paymentMethod
                                }
                              </p>
                              <p>
                                <strong>Order Date:</strong> ${formattedDate}
                              </p>
                              <h4><strong>Order Items:</strong></h4>
                              <ul>
                                ${order.orderItems
                                  .map(
                                    (item) => `
                                <li>
                                  <p>
                                    <strong>Product Name:</strong>
                                    ${item.product.name}
                                  </p>
                                  <p>
                                    <strong>Quantity:</strong> ${item.quantity}
                                  </p>
                                  <p>
                                    <strong>Price per Unit:</strong>
                                    ₦${item.product.unit_price}
                                  </p>
                                  <p>
                                    <strong>Vendor Name:</strong>
                                    ${item.vendorDetails.firstName} ${
                                      item.vendorDetails.lastName
                                    } 
                                  </p>
                                  <p>
                                    <strong>Supplya store address:</strong>
                                    ${item.vendorDetails.storeUrl ?? ""} 
                                  </p>
                                </li>
                                `
                                  )
                                  .join(", ")}
                              </ul>
                            </td>
                          </tr>
                            <tr>
                          <td style="font-size: 14px; line-height: 16px">
                            <p
                              style="
                                color: #131417;
                                text-align: left;
                                font-weight: 400;
                                line-height: 15px;
                                margin-top: 30px;
                              "
                            >
                              Regards,
                            </p>
                            <p
                              style="
                                color: #131417;
                                text-align: left;
                                font-weight: 400;
                                line-height: 15px;
                              "
                            >
                              Supplya Support.
                            </p>
                          </td>
                        </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center">
            <footer>
              <p style="color: #131417; margin-top: 30px; font-size: 14px">
                Copyright © 2024 Supplya
              </p>
            </footer>
          </td>
        </tr>
      </table>
    </body>
  </html>
</html>
`,
  };

  await transporter.sendMail(mailOptions);
};

const sendCustomerOrderConfirmedMail = async (order, user) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const formattedDate = new Date(order.dateOrdered).toLocaleString();

  const mailOptions = {
    from: {
      name: "Supplya",
      address: process.env.EMAIL_USERNAME,
    },
    to: order.email,
    subject: `Order #${order.orderId} has been confirmed`,
    html: `
       <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Order Confirmed</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
      rel="stylesheet"
    />
  </head>

  <style>
    a:hover {
      background-color: #02555b;
    }
  </style>

  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>Registration successful</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
        rel="stylesheet"
      />
    </head>

    <style>
      a:hover {
        background-color: #02555b;
      }
    </style>

    <body style="margin: 0; padding: 0; font-family: 'Lato', sans-serif">
      <table
        style="padding: 10px 20px"
        role="presentation"
        border="0"
        cellpadding="0"
        cellspacing="0"
        width="100%"
        bgcolor="#FFFFFF"
      >
        <tr>
          <td>
            <div
              align="center"
              style="
                margin-top: 30px;
                margin-bottom: 30px;
                display: flex;
                margin: 0 auto;
                background-color: #0199a4;
                width: 70%;
              "
            >
              <img
                src="https://i.postimg.cc/85Gw5Rhv/Supplya-Logo-Y-BGB.jpg"
                alt="Supplya-Logo-on-GBG"
                style="text-align: left; width: 90px; margin-left: 60px"
              />
            </div>
            <table
              align="center"
              bgcolor="#F4F6F8"
              width="70%"
              style="border-radius: 15px; padding: 0"
            >
              <tr>
                <td>
                  <table
                    align="center"
                    style="padding-left: 32px; padding-right: 32px"
                    border="0"
                    cellspacing="0"
                    cellpadding="0"
                    width="80%"
                  >
                    <tr>
                      <td
                        style="padding: 0; margin-top: 20px; text-align: left"
                      >
                        <table
                          align="center"
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          style="border-collapse: collapse"
                        >
                          <tr>
                            <td style="color: #153643">
                            <p>Hi ${user.firstName},</p>
                              <p>
                                Your supplya order has been marked as ${
                                  order.orderStatus
                                } by ${
      order.orderItems[0].vendorDetails.firstName
    }. View your order details below:
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td style="font-size: 12px; background-color: white; padding: 10px 20px;">
                              <p><strong>Order ID:</strong> ${order.orderId}</p>
                              <p>
                                <strong>Customer Name:</strong> ${
                                  user.firstName
                                }  ${user.lastName}
                              </p>
                              <p>
                                <strong>Order Status:</strong> ${
                                  order.orderStatus
                                }
                              </p>
                              <p>
                                <strong>Delivery Date:</strong> ${
                                  order.deliveryDate
                                }
                              </p>
                              <p>
                                <strong>Shipping Address:</strong> ${
                                  order.address
                                }, ${order.country}
                              </p>
                              <p>
                                <strong>Phone Number:</strong> ${
                                  order.phone ?? ""
                                }
                              </p>
                              <p>
                                <strong>Email:</strong> ${order.email}
                              </p>
                             
                              <p>
                                <strong>Order Note:</strong> ${
                                  order.orderNote ?? ""
                                }
                              </p>
                              <p>
                                <strong>Total Price:</strong> ₦${
                                  order.totalPrice
                                }
                              </p>
                              <p>
                                <strong>Payment Method:</strong> ${
                                  order.paymentMethod
                                }
                              </p>
                              <p>
                                <strong>Payment Status:</strong> ${
                                  order.paymentStatus
                                }
                              </p>
                              <p>
                                <strong>Order Date:</strong> ${formattedDate}
                              </p>
                              <h4><strong>Order Items:</strong></h4>
                              <ul>
                                ${order.orderItems
                                  .map(
                                    (item) => `
                                <li>
                                  <p>
                                    <strong>Product Name:</strong>
                                    ${item.product.name}
                                  </p>
                                  <p>
                                    <strong>Quantity:</strong> ${item.quantity}
                                  </p>
                                  <p>
                                    <strong>Price per Unit:</strong>
                                    ₦${item.product.unit_price}
                                  </p>
                                  <p>
                                    <strong>Vendor Name:</strong>
                                    ${item.vendorDetails.firstName} ${
                                      item.vendorDetails.lastName
                                    } 
                                  </p>
                                  <p>
                                    <strong>Supplya store address:</strong>
                                    ${item.vendorDetails.storeUrl ?? ""} 
                                  </p>
                                </li>
                                `
                                  )
                                  .join(", ")}
                              </ul>
                            </td>
                          </tr>
                            <tr>
                          <td style="font-size: 14px; line-height: 16px">
                            <p
                              style="
                                color: #131417;
                                text-align: left;
                                font-weight: 400;
                                line-height: 15px;
                                margin-top: 30px;
                              "
                            >
                              Regards,
                            </p>
                            <p
                              style="
                                color: #131417;
                                text-align: left;
                                font-weight: 400;
                                line-height: 15px;
                              "
                            >
                              Supplya Support.
                            </p>
                          </td>
                        </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center">
            <footer>
              <p style="color: #131417; margin-top: 30px; font-size: 14px">
                Copyright © 2024 Supplya
              </p>
            </footer>
          </td>
        </tr>
      </table>
    </body>
  </html>
</html>
`,
  };

  await transporter.sendMail(mailOptions);
};

const sendCustomerOrderCancelledMail = async (order, user) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const formattedDate = new Date(order.dateOrdered).toLocaleString();

  const mailOptions = {
    from: {
      name: "Supplya",
      address: process.env.EMAIL_USERNAME,
    },
    to: order.email,
    subject: `Order #${order.orderId} has been cancelled`,
    html: `
       <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Order Cancelled</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
      rel="stylesheet"
    />
  </head>

  <style>
    a:hover {
      background-color: #02555b;
    }
  </style>

  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>Order cancelled</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
        rel="stylesheet"
      />
    </head>

    <style>
      a:hover {
        background-color: #02555b;
      }
    </style>

    <body style="margin: 0; padding: 0; font-family: 'Lato', sans-serif">
      <table
        style="padding: 10px 20px"
        role="presentation"
        border="0"
        cellpadding="0"
        cellspacing="0"
        width="100%"
        bgcolor="#FFFFFF"
      >
        <tr>
          <td>
            <div
              align="center"
              style="
                margin-top: 30px;
                margin-bottom: 30px;
                display: flex;
                margin: 0 auto;
                background-color: #0199a4;
                width: 70%;
              "
            >
              <img
                src="https://i.postimg.cc/85Gw5Rhv/Supplya-Logo-Y-BGB.jpg"
                alt="Supplya-Logo-on-GBG"
                style="text-align: left; width: 90px; margin-left: 60px"
              />
            </div>
            <table
              align="center"
              bgcolor="#F4F6F8"
              width="70%"
              style="border-radius: 15px; padding: 0"
            >
              <tr>
                <td>
                  <table
                    align="center"
                    style="padding-left: 32px; padding-right: 32px"
                    border="0"
                    cellspacing="0"
                    cellpadding="0"
                    width="80%"
                  >
                    <tr>
                      <td
                        style="padding: 0; margin-top: 20px; text-align: left"
                      >
                        <table
                          align="center"
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          style="border-collapse: collapse"
                        >
                          <tr>
                            <td style="color: #153643">
                            <p>Hi ${user.firstName},</p>
                              <p>
                                Your supplya order has been marked as ${
                                  order.orderStatus
                                } by ${
      order.orderItems[0].vendorDetails.firstName
    }. View your order details below:
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td style="font-size: 12px; background-color: white; padding: 10px 20px;">
                              <p><strong>Order ID:</strong> ${order.orderId}</p>
                              <p>
                                <strong>Customer Name:</strong> ${
                                  user.firstName
                                }  ${user.lastName}
                              </p>
                              <p>
                                <strong>Order Status:</strong> ${
                                  order.orderStatus
                                }
                              </p>
                              <p>
                                <strong>Delivery Date:</strong> ${
                                  order.deliveryDate
                                }
                              </p>
                              <p>
                                <strong>Shipping Address:</strong> ${
                                  order.address
                                }, ${order.country}
                              </p>
                              <p>
                                <strong>Phone Number:</strong> ${
                                  order.phone ?? ""
                                }
                              </p>
                              <p>
                                <strong>Email:</strong> ${order.email}
                              </p>
                             
                              <p>
                                <strong>Order Note:</strong> ${
                                  order.orderNote ?? ""
                                }
                              </p>
                              <p>
                                <strong>Total Price:</strong> ₦${
                                  order.totalPrice
                                }
                              </p>
                              <p>
                                <strong>Payment Method:</strong> ${
                                  order.paymentMethod
                                }
                              </p>
                              <p>
                                <strong>Payment Status:</strong> ${
                                  order.paymentStatus
                                }
                              </p>
                              <p>
                                <strong>Order Date:</strong> ${formattedDate}
                              </p>
                              <h4><strong>Order Items:</strong></h4>
                              <ul>
                                ${order.orderItems
                                  .map(
                                    (item) => `
                                <li>
                                  <p>
                                    <strong>Product Name:</strong>
                                    ${item.product.name}
                                  </p>
                                  <p>
                                    <strong>Quantity:</strong> ${item.quantity}
                                  </p>
                                  <p>
                                    <strong>Price per Unit:</strong>
                                    ₦${item.product.unit_price}
                                  </p>
                                  <p>
                                    <strong>Vendor Name:</strong>
                                    ${item.vendorDetails.firstName} ${
                                      item.vendorDetails.lastName
                                    } 
                                  </p>
                                  <p>
                                    <strong>Supplya store address:</strong>
                                    ${item.vendorDetails.storeUrl ?? ""} 
                                  </p>
                                </li>
                                `
                                  )
                                  .join(", ")}
                              </ul>
                            </td>
                          </tr>
                            <tr>
                          <td style="font-size: 14px; line-height: 16px">
                            <p
                              style="
                                color: #131417;
                                text-align: left;
                                font-weight: 400;
                                line-height: 15px;
                                margin-top: 30px;
                              "
                            >
                              Regards,
                            </p>
                            <p
                              style="
                                color: #131417;
                                text-align: left;
                                font-weight: 400;
                                line-height: 15px;
                              "
                            >
                              Supplya Support.
                            </p>
                          </td>
                        </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center">
            <footer>
              <p style="color: #131417; margin-top: 30px; font-size: 14px">
                Copyright © 2024 Supplya
              </p>
            </footer>
          </td>
        </tr>
      </table>
    </body>
  </html>
</html>
`,
  };

  await transporter.sendMail(mailOptions);
};

const sendCustomerOrderShippedMail = async (order, user) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const formattedDate = new Date(order.dateOrdered).toLocaleString();

  const mailOptions = {
    from: {
      name: "Supplya",
      address: process.env.EMAIL_USERNAME,
    },
    to: order.email,
    subject: `Order #${order.orderId} has been shipped`,
    html: `
       <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Order Confirmed</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
      rel="stylesheet"
    />
  </head>

  <style>
    a:hover {
      background-color: #02555b;
    }
  </style>

  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>Order shipped</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
        rel="stylesheet"
      />
    </head>

    <style>
      a:hover {
        background-color: #02555b;
      }
    </style>

    <body style="margin: 0; padding: 0; font-family: 'Lato', sans-serif">
      <table
        style="padding: 10px 20px"
        role="presentation"
        border="0"
        cellpadding="0"
        cellspacing="0"
        width="100%"
        bgcolor="#FFFFFF"
      >
        <tr>
          <td>
            <div
              align="center"
              style="
                margin-top: 30px;
                margin-bottom: 30px;
                display: flex;
                margin: 0 auto;
                background-color: #0199a4;
                width: 70%;
              "
            >
              <img
                src="https://i.postimg.cc/85Gw5Rhv/Supplya-Logo-Y-BGB.jpg"
                alt="Supplya-Logo-on-GBG"
                style="text-align: left; width: 90px; margin-left: 60px"
              />
            </div>
            <table
              align="center"
              bgcolor="#F4F6F8"
              width="70%"
              style="border-radius: 15px; padding: 0"
            >
              <tr>
                <td>
                  <table
                    align="center"
                    style="padding-left: 32px; padding-right: 32px"
                    border="0"
                    cellspacing="0"
                    cellpadding="0"
                    width="80%"
                  >
                    <tr>
                      <td
                        style="padding: 0; margin-top: 20px; text-align: left"
                      >
                        <table
                          align="center"
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          style="border-collapse: collapse"
                        >
                          <tr>
                            <td style="color: #153643">
                            <p>Hi ${user.firstName},</p>
                              <p>
                                Your supplya order has been marked as ${
                                  order.orderStatus
                                } by ${
      order.orderItems[0].vendorDetails.firstName
    }. View your order details below:
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td style="font-size: 12px; background-color: white; padding: 10px 20px;">
                              <p><strong>Order ID:</strong> ${order.orderId}</p>
                              <p>
                                <strong>Customer Name:</strong> ${
                                  user.firstName
                                }  ${user.lastName}
                              </p>
                              <p>
                                <strong>Order Status:</strong> ${
                                  order.orderStatus
                                }
                              </p>
                              <p>
                                <strong>Delivery Date:</strong> ${
                                  order.deliveryDate
                                }
                              </p>
                              <p>
                                <strong>Shipping Address:</strong> ${
                                  order.address
                                }, ${order.country}
                              </p>
                              <p>
                                <strong>Phone Number:</strong> ${
                                  order.phone ?? ""
                                }
                              </p>
                              <p>
                                <strong>Email:</strong> ${order.email}
                              </p>
                             
                              <p>
                                <strong>Order Note:</strong> ${
                                  order.orderNote ?? ""
                                }
                              </p>
                              <p>
                                <strong>Total Price:</strong> ₦${
                                  order.totalPrice
                                }
                              </p>
                              <p>
                                <strong>Payment Method:</strong> ${
                                  order.paymentMethod
                                }
                              </p>
                              <p>
                                <strong>Payment Status:</strong> ${
                                  order.paymentStatus
                                }
                              </p>
                              <p>
                                <strong>Order Date:</strong> ${formattedDate}
                              </p>
                              <h4><strong>Order Items:</strong></h4>
                              <ul>
                                ${order.orderItems
                                  .map(
                                    (item) => `
                                <li>
                                  <p>
                                    <strong>Product Name:</strong>
                                    ${item.product.name}
                                  </p>
                                  <p>
                                    <strong>Quantity:</strong> ${item.quantity}
                                  </p>
                                  <p>
                                    <strong>Price per Unit:</strong>
                                    ₦${item.product.unit_price}
                                  </p>
                                  <p>
                                    <strong>Vendor Name:</strong>
                                    ${item.vendorDetails.firstName} ${
                                      item.vendorDetails.lastName
                                    } 
                                  </p>
                                  <p>
                                    <strong>Supplya store address:</strong>
                                    ${item.vendorDetails.storeUrl ?? ""} 
                                  </p>
                                </li>
                                `
                                  )
                                  .join(", ")}
                              </ul>
                            </td>
                          </tr>
                            <tr>
                          <td style="font-size: 14px; line-height: 16px">
                            <p
                              style="
                                color: #131417;
                                text-align: left;
                                font-weight: 400;
                                line-height: 15px;
                                margin-top: 30px;
                              "
                            >
                              Regards,
                            </p>
                            <p
                              style="
                                color: #131417;
                                text-align: left;
                                font-weight: 400;
                                line-height: 15px;
                              "
                            >
                              Supplya Support.
                            </p>
                          </td>
                        </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center">
            <footer>
              <p style="color: #131417; margin-top: 30px; font-size: 14px">
                Copyright © 2024 Supplya
              </p>
            </footer>
          </td>
        </tr>
      </table>
    </body>
  </html>
</html>
`,
  };

  await transporter.sendMail(mailOptions);
};

const sendCustomerOrderDeliveredMail = async (order, user) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const formattedDate = new Date(order.dateOrdered).toLocaleString();

  const mailOptions = {
    from: {
      name: "Supplya",
      address: process.env.EMAIL_USERNAME,
    },
    to: order.email,
    subject: `Order #${order.orderId} has been delivered`,
    html: `
       <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Customer Order Delivered</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
      rel="stylesheet"
    />
  </head>

  <style>
    a:hover {
      background-color: #02555b;
    }
  </style>

  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>Order Delivered</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
        rel="stylesheet"
      />
    </head>

    <style>
      a:hover {
        background-color: #02555b;
      }
    </style>

    <body style="margin: 0; padding: 0; font-family: 'Lato', sans-serif">
      <table
        style="padding: 10px 20px"
        role="presentation"
        border="0"
        cellpadding="0"
        cellspacing="0"
        width="100%"
        bgcolor="#FFFFFF"
      >
        <tr>
          <td>
            <div
              align="center"
              style="
                margin-top: 30px;
                margin-bottom: 30px;
                display: flex;
                margin: 0 auto;
                background-color: #0199a4;
                width: 70%;
              "
            >
              <img
                src="https://i.postimg.cc/85Gw5Rhv/Supplya-Logo-Y-BGB.jpg"
                alt="Supplya-Logo-on-GBG"
                style="text-align: left; width: 90px; margin-left: 60px"
              />
            </div>
            <table
              align="center"
              bgcolor="#F4F6F8"
              width="70%"
              style="border-radius: 15px; padding: 0"
            >
              <tr>
                <td>
                  <table
                    align="center"
                    style="padding-left: 32px; padding-right: 32px"
                    border="0"
                    cellspacing="0"
                    cellpadding="0"
                    width="80%"
                  >
                    <tr>
                      <td
                        style="padding: 0; margin-top: 20px; text-align: left"
                      >
                        <table
                          align="center"
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          style="border-collapse: collapse"
                        >
                          <tr>
                            <td style="color: #153643">
                            <p>Hi ${order.user.firstName},</p>
                              <p>
                                Your order has been ${
                                  order.orderStatus
                                }. View order details below:
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td style="font-size: 12px; background-color: white; padding: 10px 20px;">
                              <p><strong>Order ID:</strong> ${order.orderId}</p>
                              <p>
                                <strong>Customer Name:</strong> ${
                                  order.user.firstName
                                }  ${order.user.lastName}
                              </p>
                              <p>
                                <strong>Order Status:</strong> ${
                                  order.orderStatus
                                }
                              </p>
                              <p>
                                <strong>Delivery Date:</strong> ${
                                  order.deliveryDate ?? ""
                                }
                              </p>
                              <p>
                                <strong>Shipping Address:</strong> ${
                                  order.address
                                }, ${order.country}
                              </p>
                              <p>
                                <strong>Phone Number:</strong> ${
                                  order.phone ?? ""
                                }
                              </p>
                              <p>
                                <strong>Email:</strong> ${order.email}
                              </p>
                             
                              <p>
                                <strong>Order Note:</strong> ${
                                  order.orderNote ?? ""
                                }
                              </p>
                              <p>
                                <strong>Total Price:</strong> ₦${
                                  order.totalPrice
                                }
                              </p>
                              <p>
                                <strong>Payment Method:</strong> ${
                                  order.paymentMethod
                                }
                              </p>
                              <p>
                                <strong>Payment Status:</strong> ${
                                  order.paymentStatus
                                }
                              </p>
                              <p>
                                <strong>Order Date:</strong> ${formattedDate}
                              </p>
                              <h4><strong>Order Items:</strong></h4>
                              <ul>
                                ${order.orderItems
                                  .map(
                                    (item) => `
                                <li>
                                  <p>
                                    <strong>Product Name:</strong>
                                    ${item.product.name}
                                  </p>
                                  <p>
                                    <strong>Quantity:</strong> ${item.quantity}
                                  </p>
                                  <p>
                                    <strong>Price per Unit:</strong>
                                    ₦${item.product.unit_price}
                                  </p>
                                  <p>
                                    <strong>Vendor Name:</strong>
                                    ${item.vendorDetails.firstName} ${
                                      item.vendorDetails.lastName
                                    } 
                                  </p>
                                  <p>
                                    <strong>Supplya store address:</strong>
                                    ${item.vendorDetails.storeUrl ?? ""} 
                                  </p>
                                </li>
                                `
                                  )
                                  .join(", ")}
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td style="color: #153643">
                            <p>Thank you for shopping with Supplya!</p> 
                            <p>If you experienced any issues with your order, please contact <span style="color: #0199a4;">hi@supplya.shop.</span></p> 
                            </td>
                          </tr>
                            <tr>
                          <td style="font-size: 14px; line-height: 16px">
                            <p
                              style="
                                color: #131417;
                                text-align: left;
                                font-weight: 400;
                                line-height: 15px;
                                margin-top: 30px;
                              "
                            >
                              Regards,
                            </p>
                            <p
                              style="
                                color: #131417;
                                text-align: left;
                                font-weight: 400;
                                line-height: 15px;
                              "
                            >
                              Supplya Support.
                            </p>
                          </td>
                        </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center">
            <footer>
              <p style="color: #131417; margin-top: 30px; font-size: 14px">
                Copyright © 2024 Supplya
              </p>
            </footer>
          </td>
        </tr>
      </table>
    </body>
  </html>
</html>
`,
  };

  await transporter.sendMail(mailOptions);
};

const sendVendorOrderDeliveredMail = async (order, user) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const formattedDate = new Date(order.dateOrdered).toLocaleString();

  const mailOptions = {
    from: {
      name: "Supplya",
      address: process.env.EMAIL_USERNAME,
    },
    to: order.orderItems[0].vendorDetails.email,
    subject: `Order #${order.orderId} marked as delivered`,
    html: `
       <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Order Delivered</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
      rel="stylesheet"
    />
  </head>

  <style>
    a:hover {
      background-color: #02555b;
    }
  </style>

  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>Registration successful</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
        rel="stylesheet"
      />
    </head>

    <style>
      a:hover {
        background-color: #02555b;
      }
    </style>

    <body style="margin: 0; padding: 0; font-family: 'Lato', sans-serif">
      <table
        style="padding: 10px 20px"
        role="presentation"
        border="0"
        cellpadding="0"
        cellspacing="0"
        width="100%"
        bgcolor="#FFFFFF"
      >
        <tr>
          <td>
            <div
              align="center"
              style="
                margin-top: 30px;
                margin-bottom: 30px;
                display: flex;
                margin: 0 auto;
                background-color: #0199a4;
                width: 70%;
              "
            >
              <img
                src="https://i.postimg.cc/85Gw5Rhv/Supplya-Logo-Y-BGB.jpg"
                alt="Supplya-Logo-on-GBG"
                style="text-align: left; width: 90px; margin-left: 60px"
              />
            </div>
            <table
              align="center"
              bgcolor="#F4F6F8"
              width="70%"
              style="border-radius: 15px; padding: 0"
            >
              <tr>
                <td>
                  <table
                    align="center"
                    style="padding-left: 32px; padding-right: 32px"
                    border="0"
                    cellspacing="0"
                    cellpadding="0"
                    width="80%"
                  >
                    <tr>
                      <td
                        style="padding: 0; margin-top: 20px; text-align: left"
                      >
                        <table
                          align="center"
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          style="border-collapse: collapse"
                        >
                          <tr>
                            <td style="color: #153643">
                            <p>Hi ${
                              order.orderItems[0].vendorDetails.firstName
                            },</p>
                              <p>
                                Your order ${order.orderId} has been ${
      order.orderStatus
    }. View order details below:
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td style="font-size: 12px; background-color: white; padding: 10px 20px;">
                              <p><strong>Order ID:</strong> ${order.orderId}</p>
                              <p>
                                <strong>Customer Name:</strong> ${
                                  order.user.firstName
                                }  ${order.user.lastName}
                              </p>
                              <p>
                                <strong>Order Status:</strong> ${
                                  order.orderStatus
                                }
                              </p>
                              <p>
                                <strong>Delivery Date:</strong> ${
                                  order.deliveryDate ?? ""
                                }
                              </p>
                              <p>
                                <strong>Shipping Address:</strong> ${
                                  order.address
                                }, ${order.country}
                              </p>
                              <p>
                                <strong>Phone Number:</strong> ${
                                  order.phone ?? ""
                                }
                              </p>
                              <p>
                                <strong>Email:</strong> ${order.email}
                              </p>
                             
                              <p>
                                <strong>Order Note:</strong> ${
                                  order.orderNote ?? ""
                                }
                              </p>
                              <p>
                                <strong>Total Price:</strong> ₦${
                                  order.totalPrice
                                }
                              </p>
                              <p>
                                <strong>Payment Method:</strong> ${
                                  order.paymentMethod
                                }
                              </p>
                              <p>
                                <strong>Payment Status:</strong> ${
                                  order.paymentStatus
                                }
                              </p>
                              <p>
                                <strong>Order Date:</strong> ${formattedDate}
                              </p>
                              <h4><strong>Order Items:</strong></h4>
                              <ul>
                                ${order.orderItems
                                  .map(
                                    (item) => `
                                <li>
                                  <p>
                                    <strong>Product Name:</strong>
                                    ${item.product.name}
                                  </p>
                                  <p>
                                    <strong>Quantity:</strong> ${item.quantity}
                                  </p>
                                  <p>
                                    <strong>Price per Unit:</strong>
                                    ₦${item.product.unit_price}
                                  </p>
                                  <p>
                                    <strong>Vendor Name:</strong>
                                    ${item.vendorDetails.firstName} ${
                                      item.vendorDetails.lastName
                                    } 
                                  </p>
                                  <p>
                                    <strong>Supplya store address:</strong>
                                    ${item.vendorDetails.storeUrl ?? ""} 
                                  </p>
                                </li>
                                `
                                  )
                                  .join(", ")}
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td style="color: #153643">
                            <p>Thank you for being a valuable part of Supplya.</p> 
                            <p>If you experienced any issues with this order, please contact <span style="color: #0199a4;">hi@supplya.shop.</span> We're always ready to offer support.</p> 
                            </td>
                          </tr>
                            <tr>
                          <td style="font-size: 14px; line-height: 16px">
                            <p
                              style="
                                color: #131417;
                                text-align: left;
                                font-weight: 400;
                                line-height: 15px;
                                margin-top: 30px;
                              "
                            >
                              Best regards,
                            </p>
                            <p
                              style="
                                color: #131417;
                                text-align: left;
                                font-weight: 400;
                                line-height: 15px;
                              "
                            >
                              Supplya Support.
                            </p>
                          </td>
                        </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center">
            <footer>
              <p style="color: #131417; margin-top: 30px; font-size: 14px">
                Copyright © 2024 Supplya
              </p>
            </footer>
          </td>
        </tr>
      </table>
    </body>
  </html>
</html>
`,
  };

  await transporter.sendMail(mailOptions);
};

const sendReferralRewardNotification = async (referringUser, reward) => {
  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: referringUser.email,
    subject: "You Earned a Referral Reward!",
    html: `
      <p>Hi ${referringUser.firstName},</p>
      <p>Congratulations! You earned a reward of ₦${reward.toFixed(
        2
      )} for referring a user who successfully completed an order.</p>
      <p>Your reward has been credited to your wallet. Keep referring more friends to earn even more!</p>
      <p>Thank you for your continued support.</p>
      <p>Best regards,<br>Supplya Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const approveProductMail = async (vendorName, productName) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: {
      name: "Supplya",
      address: process.env.EMAIL_USERNAME,
    },
    to: process.env.EMAIL_USERNAME,
    subject: "Product Pending Approval",
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Approve product</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
      rel="stylesheet"
    />
  </head>

  <style>
    a:hover {
      background-color: #02555b;
    }
  </style>

  <body style="margin: 0; padding: 0; font-family: 'Lato', sans-serif">
    <table
      style="padding: 10px 20px"
      role="presentation"
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="100%"
      bgcolor="#FFFFFF"
    >
      <tr>
        <td>
          <div
            align="center"
            style="
              margin-top: 30px;
              margin-bottom: 30px;
              display: flex;
              margin: 0 auto;
              background-color: #0199a4;
              width: 70%;
            "
          >
            <img
              src="https://i.postimg.cc/85Gw5Rhv/Supplya-Logo-Y-BGB.jpg"
              alt="Supplya-Logo-on-GBG"
              style="text-align: left; width: 90px; margin-left: 70px"
            />
          </div>
          <table
            align="center"
            bgcolor="#F4F6F8"
            width="70%"
            style="border-radius: 15px; padding: 0"
          >
            <tr>
              <td>
                <table
                  align="center"
                  style="padding-left: 32px; padding-right: 32px"
                  border="0"
                  cellspacing="0"
                  cellpadding="0"
                  width="80%"
                >
                  <tr>
                    <td style="padding: 0; margin-top: 20px; text-align: left">
                      <table
                        align="center"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="border-collapse: collapse"
                      >
                        <tr>
                          <td style="color: #153643">
                            <p
                              style="
                                font-size: 14px;
                                font-weight: 600;
                                margin-top: 40px;
                                text-align: left;
                                font-size: 18px;
                                color: #131417;
                              "
                            >
                              New Product Pending Approval 
                            </p>
                            <p
                              style="
                                font-size: 14px;
                                text-align: left;
                                color: #131417;
                                margin-bottom: 30px;
                                line-height: 20px;
                              "
                            >
                              Vendor <strong><em>${vendorName}</em></strong> has added a new product (${productName}) awaiting your approval.
                              Follow the link below to approve the product.
                            </p>

                            <a
                              style="
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                text-decoration: none;
                                background-color: #0199a4;
                                color: white;
                                border-radius: 6px;
                                padding: 10px 25px;
                                width: fit-content;
                                margin: 0 auto;
                                cursor: pointer;
                              "
                              href="https://supplya.shop/#/auth/sign-in"
                              >Approve Product</a
                            >
                          </td>
                        </tr>

                        <tr>
                          <td style="font-size: 14px; line-height: 16px">
                            <p
                              style="
                                color: #131417;
                                text-align: left;
                                font-weight: 400;
                                line-height: 15px;
                              "
                            >
                              Supplya.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center">
          <footer>
            <p style="color: #131417; margin-top: 30px; font-size: 14px">
              Copyright © 2024 Supplya
            </p>
          </footer>
        </td>
      </tr>
    </table>
  </body>
</html>
`,
  };

  await transporter.sendMail(mailOptions);
};

const sendMigratedCustomersMail = async (
  firstName,
  phoneNumber,
  email,
  password
) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: {
      name: "Supplya",
      address: process.env.EMAIL_USERNAME,
    },
    to: email,
    subject: "Migration Notification",
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Migration notification</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
      rel="stylesheet"
    />
  </head>

  <body style="margin: 0; padding: 0; font-family: 'Lato', sans-serif">
    <table
      style="padding: 10px 20px"
      role="presentation"
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="100%"
      bgcolor="#FFFFFF"
    >
      <tr>
        <td>
          <div
            align="center"
            style="
              margin-top: 30px;
              margin-bottom: 30px;
              display: flex;
              margin: 0 auto;
              background-color: #0199a4;
              width: 70%;
            "
          >
            <img
              src="https://i.postimg.cc/85Gw5Rhv/Supplya-Logo-Y-BGB.jpg"
              alt="Supplya-Logo-on-GBG"
              style="text-align: left; width: 90px; margin-left: 70px"
            />
          </div>
          <table
            align="center"
            bgcolor="#F4F6F8"
            width="70%"
            style="border-radius: 15px; padding: 0"
          >
            <tr>
              <td>
                <table
                  align="center"
                  style="padding-left: 32px; padding-right: 32px"
                  border="0"
                  cellspacing="0"
                  cellpadding="0"
                  width="80%"
                >
                  <tr>
                    <td style="padding: 0; margin-top: 20px; text-align: left">
                      <table
                        align="center"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="border-collapse: collapse"
                      >
                        <tr>
                          <td style="color: #153643">
                            <p
                              style="
                                font-size: 14px;
                                font-weight: 600;
                                margin-top: 40px;
                                text-align: left;
                                font-size: 18px;
                                color: #131417;
                              "
                            >
                              Migration notification
                            </p>
                            <p>Hello ${firstName},</p>
                            <p>
                              We're pleased to announce that we have
                              successfully migrated you to our new and improved web app
                              <a
                                style="cursor: pointer"
                                href="https://supplya.shop"
                                >supplya.shop</a
                              >
                              🥳.
                              <p>You may sign in with your email or phone number ${phoneNumber} and temporary password: ${password}
                              <br />
                            </p>

                            <p>
                              Please ensure you reset your
                              password using the following link
                              <a
                                href="https://supplya.shop/#/auth/forget-password"
                                >Reset Password</a
                              >
                            </p>
                            <p>
                              If you experience any issues signing in, please
                              contact
                              <a href="https://supplya.shop/#/contact-us"
                                >support</a
                              >
                              immediately.
                              <br />
                              <br />
                            </p>

                            <p style="font-size: 12px">
                              <span style="color: red">*</span>Note: If you
                              already created an account on the new platform
                              please ignore this notification.
                            </p>
                          </td>
                        </tr>

                        <tr>
                          <td style="font-size: 14px; line-height: 16px">
                            <p
                              style="
                                color: #131417;
                                text-align: left;
                                font-weight: 400;
                                line-height: 15px;
                              "
                            >
                              Supplya Team.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center">
          <footer>
            <p style="color: #131417; margin-top: 30px; font-size: 14px">
              Copyright © 2024 Supplya
            </p>
          </footer>
        </td>
      </tr>
    </table>
  </body>
</html>
`,
  };

  await transporter.sendMail(mailOptions);
};

const contactMail = async (name, email, phone, subject, message) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: {
      name,
      address: process.env.EMAIL_USERNAME,
    },
    to: process.env.EMAIL_USERNAME,
    subject: `Contact us: ${subject}`,
    html: `
       <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Contact Us</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
      rel="stylesheet"
    />
  </head>

  <style>
    a:hover {
      background-color: #02555b;
    }
  </style>

  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>Admin Order Summary</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
        rel="stylesheet"
      />
    </head>

    <style>
      a:hover {
        background-color: #02555b;
      }
    </style>

    <body style="margin: 0; padding: 0; font-family: 'Lato', sans-serif">
      <table
        style="padding: 10px 20px"
        role="presentation"
        border="0"
        cellpadding="0"
        cellspacing="0"
        width="100%"
        bgcolor="#FFFFFF"
      >
        <tr>
          <td>
            <div
              align="center"
              style="
                margin-top: 30px;
                margin-bottom: 30px;
                display: flex;
                margin: 0 auto;
                background-color: #0199a4;
                width: 70%;
              "
            >
            <img src="https://i.postimg.cc/85Gw5Rhv/Supplya-Logo-Y-BGB.jpg" alt="Supplya-Logo-on-GBG"
            style="position: absolute; top: 30px; left: 110px; width: 90px"/>
            </div>
            <table
              align="center"
              bgcolor="#F4F6F8"
              width="70%"
              style="border-radius: 15px; padding: 0"
            >
              <tr>
                <td>
                  <table
                    align="center"
                    style="padding-left: 32px; padding-right: 32px"
                    border="0"
                    cellspacing="0"
                    cellpadding="0"
                    width="80%"
                  >
                    <tr>
                      <td
                        style="padding: 0; margin-top: 20px; text-align: left"
                      >
                        <table
                          align="center"
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          style="border-collapse: collapse"
                        >
                          <tr>
                            <td style="color: #153643">
                            <p>Hi, </p>
                              <p>
                                ${name} has contacted you requesting some help. Please send a response to the email or phone number provided below:
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td style="font-size: 12px; background-color: white; padding: 10px 20px;">
                              <p><strong>Name:</strong> ${name}</p>
                              <p>
                                <strong>Email:</strong> ${email}
                              </p>
                              <p>
                                <strong>Phone Number:</strong> +${phone}
                              </p>
                              <p>
                                <strong>Subject:</strong> ${subject}
                              </p>
                              <p>
                                <strong>Message:</strong> ${message}
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center">
            <footer>
              <p style="color: #131417; margin-top: 30px; font-size: 14px">
                Copyright © 2024 Supplya
              </p>
            </footer>
          </td>
        </tr>
      </table>
    </body>
  </html>
</html>
`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  generateOTP,
  sendOTPMail,
  resendOTPMail,
  sendConfirmationMail,
  sendOrderSummaryMail,
  sendCustomerOrderConfirmedMail,
  sendCustomerOrderShippedMail,
  sendCustomerOrderDeliveredMail,
  sendCustomerOrderSummaryMail,
  sendVendorOrderSummaryMail,
  sendVendorOrderDeliveredMail,
  sendCustomerOrderCancelledMail,
  newUserSignUpMail,
  newVendorSignUpMail,
  forgotPasswordMail,
  resetPasswordMail,
  approveProductMail,
  contactMail,
  sendMigratedCustomersMail,
  sendReferralRewardNotification,
};
