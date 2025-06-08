const { adams } = require("../Ibrahim/adams");
const axios = require("axios"); // Using axios for API requests

// Function to get TTS audio URL
async function getTTS(text, lang) {
  try {
    const response = await axios.get(`https://api.maskser.me/api/soundoftext`, {
      params: { text, lang },
    });

    if (response.data && response.data.result) {
      return response.data.result; // API returns the direct audio URL
    }
    return null;
  } catch (error) {
    console.error("TTS API Error:", error);
    return null;
  }
}

// Define TTS commands
const ttsCommands = [
  { name: "dit", lang: "fr", response: "👄" },
  { name: "itta", lang: "ja", response: "👄" },
  { name: "say", lang: "en-US", response: "👄" }, // Using en-US for better accuracy
];

// Generate commands dynamically
ttsCommands.forEach(({ name, lang, response }) => {
  adams(
    {
      nomCom: name,
      categorie: "tts",
      reaction: response,
    },
    async (dest, zk, commandeOptions) => {
      const { ms, arg, repondre } = commandeOptions;
      if (!arg[0]) {
        repondre("Insert a word");
        return;
      }
      const mots = arg.join(" ");

      const audioUrl = await getTTS(mots, lang);
      if (!audioUrl) {
        repondre("TTS conversion failed. Try again later.");
        return;
      }

      console.log(audioUrl);
      zk.sendMessage(
        dest,
        { audio: { url: audioUrl }, mimetype: "audio/mpeg" }, // API provides MP3
        { quoted: ms, ptt: true }
      );
    }
  );
});
