const Credential = require("../models/Credential");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const crypto = require("crypto");
require("dotenv").config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // AES block size

const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

// Helper function to decrypt the credential value
const decrypt = (text) => {
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

const createCredential = async (req, res) => {
  const { name, value, description } = req.body;

  try {
    const existingCredential = await Credential.findOne({ name });
    if (existingCredential) {
      return res
        .status(400)
        .json({ status: false, message: "Credential already exists." });
    }

    const encryptedValue = encrypt(value);
    const credential = new Credential({
      name,
      value: encryptedValue,
      description,
    });
    await credential.save();

    return res
      .status(201)
      .json({ status: true, message: "Credential stored successfully." });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal Server Error: " + error.message,
    });
  }
};

const fetchCredentialByName = async (req, res) => {
  const { name } = req.params;

  try {
    const credential = await Credential.findOne({ name });
    if (!credential) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: false, message: "Credential not found." });
    }

    const decryptedValue = decrypt(credential.value);
    credential.value = decryptedValue;

    return res.status(StatusCodes.OK).json({ status: true, data: credential });
  } catch (error) {
    console.error("Error fetching credential:", error); // Log securely
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal Server Error: " + error.message,
    });
  }
};

const fetchCredentials = async (req, res) => {
  try {
    const credentials = await Credential.find({});
    if (!credentials) {
      return res
        .status(404)
        .json({ status: false, message: "Credentials not found." });
    }

    const decryptedCredentials = credentials.map((credential) => {
      return {
        ...credential.toObject(),
        value: decrypt(credential.value),
      };
    });

    return res.status(200).json({
      status: true,
      message: "Credentials fetched successfully",
      data: decryptedCredentials,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal Server Error: " + error.message,
    });
  }
};

const updateCredential = async (req, res) => {
  const { name } = req.params;
  const { value, description } = req.body;

  try {
    const credential = await Credential.findOne({ name });
    if (!credential) {
      return res
        .status(404)
        .json({ status: false, message: "Credential not found." });
    }

    if (value) {
      credential.value = encrypt(value);
    }

    if (description) {
      credential.description = description;
    }

    await credential.save();

    return res
      .status(200)
      .json({ status: true, message: "Credential updated successfully." });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal Server Error: " + error.message,
    });
  }
};

const deleteCredential = async (req, res) => {
  const { name } = req.params;

  try {
    const credential = await Credential.findOneAndDelete({ name });
    if (!credential) {
      return res
        .status(404)
        .json({ status: false, message: "Credential not found." });
    }

    return res
      .status(200)
      .json({ status: true, message: "Credential deleted successfully." });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal Server Error: " + error.message,
    });
  }
};

module.exports = {
  createCredential,
  fetchCredentialByName,
  fetchCredentials,
  updateCredential,
  deleteCredential,
};
