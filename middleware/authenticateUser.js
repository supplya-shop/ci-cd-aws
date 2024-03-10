const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const { UnauthenticatedError } = require("../errors");
const User = require("../models/User");

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthenticatedError("Invalid Authentication");
    }
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = extractUserFields(decoded);

    // Add role-based authorization check
    if (req.user.role !== "admin" && req.originalUrl.startsWith("/admin")) {
      throw new ForbiddenError(
        "You don't have permission to access this resource"
      );
    }

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .send({ msg: "Unauthorized: Please log in" });
    } else {
      res.status(StatusCodes.FORBIDDEN).send({ msg: error.message });
    }
  }
};

const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      console.log("Unauthorized");
      res.status(StatusCodes.UNAUTHORIZED).send("Unauthorized");
    } else {
      next();
    }
  };
};

const extractUserFields = (decoded) => {
  const userFields = [
    "userid",
    "firstName",
    "lastName",
    "country",
    "state",
    "address",
    "city",
    "postalCode",
    "dateOfBirth",
    "gender",
    "isSoleProprietor",
    "description",
    "businessName",
    "googleId",
    "phoneNumber",
    "uniqueKey",
    "email",
    "accountNumber",
    "bank",
    "role",
    "createdAt",
    "dob",
  ];

  return userFields.reduce((user, field) => {
    if (decoded[field] !== undefined) {
      user[field] = decoded[field];
    }
    return user;
  }, {});
};

const currentUser = async (req, res, next) => {
  if (req.isAuthenticated()) {
    try {
      const user = await User.findById(req.user._id);
      req.currentUser = user;
    } catch (error) {
      console.error("Error fetching user:", error);
      req.currentUser = null;
    }
  } else {
    // If the user is not authenticated, set currentUser to null
    req.currentUser = null;
  }
  next();
};

module.exports = { authenticateUser, roleMiddleware };
