const express = require("express");
const router = express.Router();
const {
  createCredential,
  fetchCredentialByName,
  fetchCredentials,
} = require("../controllers/credential");
const {
  authenticateUser,
  rolesAllowed,
} = require("../middleware/authenticateUser");

router.post("/create", authenticateUser, createCredential);
router.get("/fetch/:name", authenticateUser, fetchCredentialByName);
router.get("/", authenticateUser, fetchCredentials);

module.exports = router;
