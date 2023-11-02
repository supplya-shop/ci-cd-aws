const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const {BadRequestError, UnauthenticatedError} = require('../errors')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const passport = require('passport')
const axios = require('axios')

// EMAIL AND PASSWORD REGISTER AND LOGIN

const registerUser = async (req, res) => {
    try {
      if (req.body.uniqueKey === 1212 ) {
        req.body.role = "admin"
      } else {
        req.body.role = "user"
      }
        req.body.createdAt = Date.now()
        const user = await User.create({...req.body})
        const token = user.createJWT()
        res.status(StatusCodes.CREATED).json({user: {name: user.name, role: user.role, email:user.email,  createdAt:user.createdAt, phoneNumber:user.phoneNumber}, token})
        
    } catch (error) {
       res.status(400).send('Email Already Exists') 
    }
    
}   


const login = async (req, res) => {
  try {
    const { password, email } = req.body;
    
    if (!email || !password) {
      throw new BadRequestError("Please provide your email and password");
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new UnauthenticatedError("Invalid email or password");
    }
    
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      throw new UnauthenticatedError("Invalid email or password");
    }
    
    const token = user.createJWT();
    
    res.status(StatusCodes.OK).json({ _id:user._id , token });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ msg: error.message });
  }
};






//GOOGLE OAUTH 2 REGISTER AND LOGIN































  const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
    
        if (!email) {
          throw new UnauthenticatedError('Please provide your email');
        }
    
        const user = await User.findOne({ email });
    
        if (!user) {
          throw new UnauthenticatedError('Invalid Email');
        }
    
        const resetToken = jwt.sign(
          { userId: user._id },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
    
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
        await user.save();
    
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
        

        const mailOptions = {
          from: 'foresightagencies@gmail.com',
          to: user.email,
          subject: 'Password Reset Request',
          html: `
            <p>You are receiving this email because you (or someone else) has requested a password reset for your account.</p>
            <p>Please click the following link to reset your password:</p>
            <a href="https://localhost3000/auth/reset-password?token=${resetToken}">Reset Password</a
            <p>If you did not request a password reset, please ignore this email.</p>
          `,
        };
    
        await transporter.sendMail(mailOptions);
    
        res.status(200).json({ message: 'Password reset link sent to your email' });
      } catch (error) {
        //res.status(error.statusCode).send(error)
        res.status(400).json({ message: error.message });
      }

    }

      const resetPassword = async (req, res) => {
        try {
          const { resetToken, newPassword } = req.body;
      
          // Find the user with the given reset token
          const user = await User.findOne({ resetPasswordToken: resetToken });
      
          if (!user) {
            throw new Error('Invalid reset token');
          }
      
          // Update the user's password and clear the reset token
          user.password = newPassword;
          user.resetToken = null;
          await user.save();
      
          res.status(200).json({ message: 'Password reset successfully' });
        } catch (error) {
          res.status(400).json({ message: error.message });
        }
      };

      
const getBanks = async (req, res) => {
  const url = 'https://api.flutterwave.com/v3/banks/NG';
  const headers = {
      'Authorization': `Bearer ${process.env.SECRET_KEY}`,
      'Content-Type': 'application/json',
  }

  try {
      const response = await axios.get(url, { headers })
      const banks = response.data.data
      let bankNames = banks.map(bank => bank.name)
      bankNames.sort() // Sort the bank names alphabetically
      res.status(StatusCodes.OK).json({ bankNames })
  } catch (error) {
      console.error('An error occurred:', error.message)
  }
}

      





module.exports = {
    login,
    registerUser,
    getBanks,
    forgotPassword,
    resetPassword
}