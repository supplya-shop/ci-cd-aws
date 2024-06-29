const Credential = require("../models/Credential");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const createCredential = async (req, res) => {
  const { name, value, description } = req.body;

  try {
    const existingCredential = await Credential.findOne({ name });
    if (existingCredential) {
      return res
        .status(400)
        .json({ status: false, message: "Credential already exists." });
    }

    const credential = new Credential({ name, value, description });
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
        .status(404)
        .json({ status: false, message: "Credential not found." });
    }

    return res.status(200).json({ status: true, data: credential });
  } catch (error) {
    return res.status(500).json({
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

    return res.status(200).json({
      status: true,
      message: "Credentials fetched successfully",
      data: credentials,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal Server Error: " + error.message,
    });
  }
};

module.exports = { createCredential, fetchCredentialByName, fetchCredentials };
