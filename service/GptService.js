// const { OpenAI } = require("openai");

// class GptService {
//   constructor(apiKey) {
//     this.openai = new OpenAI({ apiKey: process.env.OPENAI_SECRET_KEY });
//   }

//   async generateResponse(userPrompt) {
//     try {
//       if (!userPrompt) {
//         throw new Error("Prompt is required.");
//       }
//       const response = await this.openai.chat.completions.create({
//         messages: [{ role: "system", content: "You are a helpful assistant." }],
//         model: "gpt-3.5-turbo",
//       });

//       const generatedText = response.data.choices[0].text.trim();

//       return generatedText;
//     } catch (error) {
//       console.error(error);
//       throw new Error("Internal Server Error");
//     }
//   }
// }

// module.exports = GptService;
