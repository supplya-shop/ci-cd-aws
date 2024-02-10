const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const { UnauthenticatedError } = require("../errors");

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
    if (
      error instanceof UnauthenticatedError ||
      error instanceof ForbiddenError
    ) {
      res.status(StatusCodes.UNAUTHORIZED).send({ msg: error.message });
    } else {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ msg: "Internal Server Error" });
    }
  }
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

module.exports = authenticateUser;
