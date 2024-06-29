const Credential = require("../models/Credential");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const crypto = require("crypto");
require("dotenv").config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;

const encrypt = (text) => {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY, "hex"),
      iv
    );
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  } catch (error) {
    throw new Error("Encryption failed: " + error.message);
  }
};

const decrypt = (text) => {
  try {
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift(), "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY, "hex"),
      iv
    );
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    throw new Error("Decryption failed: " + error.message);
  }
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
      try {
        const decryptedValue = decrypt(credential.value);
        return {
          ...credential.toObject(),
          value: decryptedValue,
        };
      } catch (error) {
        console.error(
          `Error decrypting credential ${credential.name}: ${error.message}`
        );
        console.error("Stored value:", credential.value);
        return {
          ...credential.toObject(),
          value: "Decryption error",
        };
      }
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
