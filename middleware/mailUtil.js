const nodemailer = require("nodemailer");

const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  const expiration = new Date();
  expiration.setTime(expiration.getTime() + 30 * 60 * 1000);
  return { otp, expiration };
};

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
    <title>OTP</title>
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
              src="https://i.postimg.cc/4HKm5g4g/Supplya-Logo-on-GBG.png"
              alt="Supplya-Logo-on-GBG"
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
      name: "Supplya",
      address: process.env.EMAIL_USERNAME,
    },
    to: email,
    subject: "Supplya Registration Complete",
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
                              on <span style="font-weight: 600"> Supplya</span>.
                              We're glad to have you on board. Click the link below to login and experience a
                              new world of buying and selling now!
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
                            <p
                              style="
                                color: #131417;
                                text-align: left;
                                font-weight: 400;
                                line-height: 15px;
                                margin-top: 30px;
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

const newUserSignUpMail = async (email) => {
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
                              A new user <span style="font-weight: 600"> ${email} </span>
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

  await transporter.sendMail(mailOptions);
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
    subject: `Order Summary for [Order ID: ${order.id}]`,
    html: `
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
                            <td style="font-size: 12px">
                              <p><strong>Order ID:</strong> ${order.id}</p>
                              <p>
                                <strong>Order Status:</strong> ${
                                  order.orderStatus
                                }
                              </p>
                              <p>
                                <strong>Shipping Address:</strong> ${
                                  order.address
                                }, ${order.city}, ${order.zip}, ${order.country}
                              </p>
                              <p>
                                <strong>Customer Phone Number:</strong> ${
                                  order.phone
                                }
                              </p>
                              <p>
                                <strong>Customer email:</strong> ${order.email}
                              </p>
                             
                              <p>
                                <strong>Order Note:</strong> ${order.orderNote}
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
const sendCustomerOrderSummaryMail = async (order) => {
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
    subject: `Order Summary for [Order ID: ${order.id}]`,
    html: `
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
                            <td style="font-size: 12px">
                              <p><strong>Order ID:</strong> ${order.id}</p>
                              <p>
                                <strong>Order Status:</strong> ${
                                  order.orderStatus
                                }
                              </p>
                              <p>
                                <strong>Shipping Address:</strong> ${
                                  order.address
                                }, ${order.city}, ${order.zip}, ${order.country}
                              </p>
                              <p>
                                <strong>Customer Phone Number:</strong> ${
                                  order.phone
                                }
                              </p>
                              <p>
                                <strong>Customer email:</strong> ${order.email}
                              </p>
                             
                              <p>
                                <strong>Order Note:</strong> ${order.orderNote}
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
                              href="https://supplya-web.vercel.app/auth/sign-in"
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

module.exports = {
  generateOTP,
  sendOTPMail,
  resendOTPMail,
  sendConfirmationMail,
  sendOrderSummaryMail,
  sendCustomerOrderSummaryMail,
  newUserSignUpMail,
  forgotPasswordMail,
  resetPasswordMail,
  approveProductMail,
};
