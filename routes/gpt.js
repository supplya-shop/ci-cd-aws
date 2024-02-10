// const express = require("express");
// const router = express.Router();
// const { StatusCodes } = require("http-status-codes");
// const GptService = require("../service/GptService");

// const gptService = new GptService(process.env.OPENAI_SECRET_KEY);

// router.post("/generate-response", async (req, res) => {
//   try {
//     const userPrompt = req.body.prompt;
//     const generatedText = await gptService.generateResponse(userPrompt);
//     res.json({ generatedText });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;
