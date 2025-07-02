const moment = require("moment-timezone");
const { adams } = require(__dirname + "/../Ibrahim/adams");
const axios = require("axios");
const s = require(__dirname + "/../config");

// Configurable elements from config.js
const {
    BOT: BOT_NAME = 'BWM XMD',
    BOT_URL: MEDIA_URLS = [],
    FOOTER = `\nFor more info visit: bwmxmd.online\n\n®2025 ʙᴡᴍ xᴍᴅ 🔥`
} = s;

const repository = "ibrahimadams254/BWM-XMD-QUANTUM";
const githubRawBaseUrl = "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic";
const audioFiles = Array.from({ length: 100 }, (_, i) => `sound${i + 1}.mp3`);

const formatNumber = (num) => num.toLocaleString();

const fetchRepoDetails = async () => {
  try {
    const response = await axios.get(`https://api.github.com/repos/${repository}`);
    const { stargazers_count, forks_count } = response.data;

    return {
      stars: stargazers_count * 2,
      forks: forks_count * 2,
    };
  } catch (error) {
    console.error("Error fetching GitHub repository details:", error);
    return {
      stars: Math.floor(Math.random() * 1000) + 500,
      forks: Math.floor(Math.random() * 500) + 250
    };
  }
};

// Get random media from config
const randomMedia = () => {
    if (MEDIA_URLS.length === 0) return null;
    const url = MEDIA_URLS[Math.floor(Math.random() * MEDIA_URLS.length)].trim();
    return url.startsWith('http') ? url : null;
};

const commands = ["git", "repo", "script", "sc"];

commands.forEach((command) => {
  adams({ nomCom: command, categorie: "🚀 GitHub" }, async (dest, zk, commandeOptions) => {
    let { repondre } = commandeOptions;
    const repoDetails = await fetchRepoDetails();
    const currentTime = moment().tz("Africa/Nairobi").format("DD/MM/YYYY HH:mm:ss");

    const infoMessage = `╭━===========================
┃  📌 ${BOT_NAME} REPO INFO 📌
┃ ⭐ Total Stars: ${formatNumber(repoDetails.stars)}
┃ 🍴 Total Forks: ${formatNumber(repoDetails.forks)}
┃ 🕰 Updated: ${currentTime}
╰━===========================
${FOOTER}

Reply with 1 for random audio 🔊

`;

    try {
        // Select random media (image or video)
        const selectedMedia = randomMedia();
        let mediaMessage = {
            text: infoMessage,
            contextInfo: {
                forwardingScore: 1, // Very high forwarding score
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363285388090068@newsletter",
                    newsletterName: ` ${BOT_NAME}`,
                    serverMessageId: Math.floor(100000 + Math.random() * 900000),
                }
            }
        };

        if (selectedMedia) {
            try {
                if (selectedMedia.match(/\.(mp4|gif)$/i)) {
                    mediaMessage = {
                        video: { url: selectedMedia },
                        gifPlayback: true,
                        caption: infoMessage,
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: "120363285388090068@newsletter",
                                newsletterName: `${BOT_NAME}`,
                                serverMessageId: Math.floor(100000 + Math.random() * 900000),
                            }
                        }
                    };
                } else if (selectedMedia.match(/\.(jpg|jpeg|png)$/i)) {
                    mediaMessage = {
                        image: { url: selectedMedia },
                        caption: infoMessage,
                        contextInfo: {
                            forwardingScore: 999999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: "120363285388090068@newsletter",
                                newsletterName: ` ${BOT_NAME}`,
                                serverMessageId: Math.floor(100000 + Math.random() * 900000),
                            }
                        }
                    };
                }
            } catch (error) {
                console.error("Error processing media:", error);
            }
        }

        const sentMessage = await zk.sendMessage(dest, mediaMessage);

        // Listen for Reply
        zk.ev.on("messages.upsert", async (update) => {
            const message = update.messages[0];
            if (!message.message || !message.message.extendedTextMessage) return;

            const responseText = message.message.extendedTextMessage.text.trim();
            if (
                message.message.extendedTextMessage.contextInfo &&
                message.message.extendedTextMessage.contextInfo.stanzaId === sentMessage.key.id
            ) {
                if (responseText === "1") {
                    const randomAudioFile = audioFiles[Math.floor(Math.random() * audioFiles.length)];
                    const audioUrl = `${githubRawBaseUrl}/${randomAudioFile}`;
                    await zk.sendMessage(dest, {
                        audio: { url: audioUrl },
                        mimetype: "audio/mpeg",
                        ptt: true,
                        contextInfo: {
                            forwardingScore: 999999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: "120363285388090068@newsletter",
                                newsletterName: ` ${BOT_NAME}`,
                                serverMessageId: Math.floor(100000 + Math.random() * 900000),
                            }
                        }
                    });
                } else {
                    await zk.sendMessage(dest, { 
                        text: "❌ Invalid choice. Please reply with '1' for random audio.",
                        contextInfo: {
                            forwardingScore: 999999,
                            isForwarded: true
                        }
                    });
                }
            }
        });

    } catch (e) {
        console.error("❌ Error sending GitHub info:", e);
        repondre("❌ Error sending GitHub info: " + e.message);
    }
  });
});
