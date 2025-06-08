"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { adams } = require("../Ibrahim/adams");
const axios = require("axios");

const githubRawBaseUrl =
  "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic";

const audioFiles = Array.from({ length: 100 }, (_, i) => `sound${i + 1}.mp3`);

const images = [
  "https://bwm-xmd-files.vercel.app/bwmxmd_lzgu8w.jpeg",
  "https://bwm-xmd-files.vercel.app/bwmxmd_9s9jr8.jpeg",
  "https://bwm-xmd-files.vercel.app/bwmxmd_psaclm.jpeg",
  "https://bwm-xmd-files.vercel.app/bwmxmd_1tksj5.jpeg",
  "https://bwm-xmd-files.vercel.app/bwmxmd_v4jirh.jpeg",
  "https://bwm-xmd-files.vercel.app/bwmxmd_d8cv2v.png",
  "https://files.catbox.moe/jwwjd3.jpeg",
  "https://files.catbox.moe/3k35q4.jpeg",
  "https://files.catbox.moe/sgl022.jpeg",
  "https://files.catbox.moe/xx6ags.jpeg",
];

adams(
  { nomCom: "alive", reaction: "🪄", nomFichier: __filename },
  async (dest, zk, commandeOptions) => {
    console.log("Alive command triggered!");

    const contactName = commandeOptions?.ms?.pushName || "Unknown Contact";

    // Get accurate time in Kenya (EAT - UTC+3)
    const timeZone = "Africa/Nairobi";
    const localTime = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      hour12: false,
    }).format(new Date());

    const hour = parseInt(localTime, 10);

    // Precise greeting based on time
    let greeting;
    if (hour >= 5 && hour < 12) {
      greeting = "Good Morning 🌅";
    } else if (hour >= 12 && hour < 16) {
      greeting = "Good Afternoon ☀️";
    } else if (hour >= 16 && hour < 20) {
      greeting = "Good Evening 🌠";
    } else {
      greeting = "Good Night 🌙";
    }

    try {
      // Randomly pick an audio file and image
      const randomAudioFile = audioFiles[Math.floor(Math.random() * audioFiles.length)];
      const randomImage = images[Math.floor(Math.random() * images.length)];
      const audioUrl = `${githubRawBaseUrl}/${randomAudioFile}`;

      // Verify if the audio file exists
      const audioResponse = await axios.head(audioUrl);
      if (audioResponse.status !== 200) {
        throw new Error("Audio file not found!");
      }

      // Generate dynamic emojis based on contact name
      const emojis = contactName
        .split("")
        .map((char) => String.fromCodePoint(0x1f600 + (char.charCodeAt(0) % 80)))
        .join("");

      // ExternalAdReply for newsletter context
      const externalAdReply = {
        title: `${greeting}, ${contactName} 🚀`,
        body: "🚀 Always Active 🚀",
        thumbnailUrl: randomImage,
        mediaType: 1,
        renderLargerThumbnail: true,
      };

      // Send the custom message
      await zk.sendMessage(dest, {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        ptt: true,
        contextInfo: {
          mentionedJid: [dest.sender || ""],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363285388090068@newsletter",
            newsletterName: "BWM-XMD",
            serverMessageId: 143,
          },
          externalAdReply, // Ensuring image is part of the newsletter
        },
      });

      console.log("Alive message sent successfully with newsletter integration.");
    } catch (error) {
      console.error("Error sending Alive message:", error.message);
    }
  }
);

//console.log("WhatsApp bot is ready!");

adams(
  { nomCom: "test", reaction: "🪄", nomFichier: __filename },
  async (dest, zk, commandeOptions) => {
    console.log("Alive command triggered!");

    const contactName = commandeOptions?.ms?.pushName || "Unknown Contact";

    // Get accurate time in Kenya (EAT - UTC+3)
    const timeZone = "Africa/Nairobi";
    const localTime = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      hour12: false,
    }).format(new Date());

    const hour = parseInt(localTime, 10);

    // Precise greeting based on time
    let greeting;
    if (hour >= 5 && hour < 12) {
      greeting = "Good Morning 🌅";
    } else if (hour >= 12 && hour < 16) {
      greeting = "Good Afternoon ☀️";
    } else if (hour >= 16 && hour < 20) {
      greeting = "Good Evening 🌠";
    } else {
      greeting = "Good Night 🌙";
    }

    try {
      // Randomly pick an audio file and image
      const randomAudioFile = audioFiles[Math.floor(Math.random() * audioFiles.length)];
      const randomImage = images[Math.floor(Math.random() * images.length)];
      const audioUrl = `${githubRawBaseUrl}/${randomAudioFile}`;

      // Verify if the audio file exists
      const audioResponse = await axios.head(audioUrl);
      if (audioResponse.status !== 200) {
        throw new Error("Audio file not found!");
      }

      // Generate dynamic emojis based on contact name
      const emojis = contactName
        .split("")
        .map((char) => String.fromCodePoint(0x1f600 + (char.charCodeAt(0) % 80)))
        .join("");

      // ExternalAdReply for newsletter context
      const externalAdReply = {
        title: `${greeting}, ${contactName} 🚀`,
        body: "🚀 Always Active 🚀",
        thumbnailUrl: randomImage,
        mediaType: 1,
        renderLargerThumbnail: true,
      };

      // Send the custom message
      await zk.sendMessage(dest, {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        ptt: true,
        contextInfo: {
          mentionedJid: [dest.sender || ""],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363285388090068@newsletter",
            newsletterName: "BWM-XMD",
            serverMessageId: 143,
          },
          externalAdReply, // Ensuring image is part of the newsletter
        },
      });

      console.log("Alive message sent successfully with newsletter integration.");
    } catch (error) {
      console.error("Error sending Alive message:", error.message);
    }
  }
);

//console.log("WhatsApp bot is ready!");



