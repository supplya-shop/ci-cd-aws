const express = require("express");
const router = express.Router();
const {
  createCredential,
  fetchCredentialByName,
  fetchCredentials,
  updateCredential,
  deleteCredential,
} = require("../controllers/credential");
const {
  authenticateUser,
  rolesAllowed,
} = require("../middleware/authenticateUser");

router.post("/create", authenticateUser, createCredential);
router.get("/fetch/:name", authenticateUser, fetchCredentialByName);
router.get("/", authenticateUser, fetchCredentials);
router.put("/:name", authenticateUser, updateCredential);
router.delete("/:name", authenticateUser, deleteCredential);

module.exports = router;
