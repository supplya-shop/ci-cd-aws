const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const { UnauthenticatedError, ForbiddenError } = require("../errors");
const User = require("../models/User");
// const logger = require("./logging/logger");

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthenticatedError("Invalid Authentication");
    }
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);
    req.user = extractUserFields(decoded);

    next();
  } catch (error) {
    // logger.error(error.message);
    console.log("Authentication Error:", error);
    console.log("Unauthorized");
    if (error instanceof jwt.JsonWebTokenError) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send({ msg: "Unauthorized: Please log in" });
    } else {
      return res.status(StatusCodes.FORBIDDEN).send({ msg: error.message });
    }
  }
};

const rolesAllowed = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      console.log("Unauthorized");
      throw new ForbiddenError(
        "Forbidden: You don't have permission to access this resource"
      );
    } else {
      next();
    }
    // Add role-based authorization check
    if (req.user.role !== "admin" && req.originalUrl.startsWith("/admin")) {
      throw new ForbiddenError(
        "Forbidden: You don't have permission to access this resource"
      );
    }
  };
};

const extractUserFields = (decoded) => {
  const userFields = [
    "userid",
    "firstName",
    "lastName",
    "blocked",
    "phoneNumber",
    "email",
    "role",
    "createdAt",
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
    req.currentUser = null;
  }
  next();
};

module.exports = { authenticateUser, rolesAllowed, currentUser };
