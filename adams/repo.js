const moment = require("moment-timezone");
const { adams } = require(__dirname + "/../Ibrahim/adams");
const axios = require("axios");

const repository = "ibrahimadams254/BWM-XMD-QUANTUM";
const imageUrl = "https://files.catbox.moe/2kcb4s.jpeg";

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
    return null;
  }
};

const commands = ["git", "repo", "script", "sc"];

commands.forEach((command) => {
  adams({ nomCom: command, categorie: "🚀 GitHub" }, async (dest, zk, commandeOptions) => {
    let { repondre, ms } = commandeOptions;
    const repoDetails = await fetchRepoDetails();

    if (!repoDetails) {
      repondre("❌ Failed to fetch GitHub repository information.");
      return;
    }

    const { stars, forks } = repoDetails;
    const currentTime = moment().tz("Africa/Nairobi").format("DD/MM/YYYY HH:mm:ss");

    const infoMessage = `╭━===========================
┃  📌 BWM XMD QUANTUM REPO INFO 📌
┃ ⭐ Total Stars: ${formatNumber(stars)}
┃ 🍴 Total Forks: ${formatNumber(forks)}
┃ 👤 Owner: Sir Ibrahim Adams
┃ 🕰 Updated: ${currentTime}
╰━===========================

🔹 Tap a button below to choose an action
`;

    try {
      const buttons = [
        {
          buttonId: 'github_repo',
          buttonText: { displayText: '🌍 GitHub Repo' },
          type: 1
        },
        {
          buttonId: 'whatsapp_channel',
          buttonText: { displayText: '📢 WhatsApp Channel' },
          type: 1
        },
        {
          buttonId: 'ping_bot',
          buttonText: { displayText: '📡 Ping Bot' },
          type: 1
        },
        {
          buttonId: 'repo_audio',
          buttonText: { displayText: '🔊 Repo Alive Audio' },
          type: 1
        }
      ];

      const sentMessage = await zk.sendMessage(dest, {
        image: { url: imageUrl },
        text: infoMessage,
        footer: "BWM XMD Quantum Repository",
        buttons: buttons,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          externalAdReply: {
            title: "🚀 Explore BWM-XMD-QUANTUM Updates!",
            body: "Tap buttons below to interact",
            thumbnailUrl: imageUrl,
            mediaType: 1,
            renderLargerThumbnail: true,
            showAdAttribution: true,
            mediaUrl: "https://github.com/ibrahimadams254/BWM-XMD-QUANTUM",
            sourceUrl: "https://github.com/ibrahimadams254/BWM-XMD-QUANTUM",
          },
        },
      }, { quoted: ms });

      // Button handler
      const buttonHandler = async (update) => {
        const message = update.messages[0];
        if (!message.message?.buttonsResponseMessage) return;
        if (message.message.buttonsResponseMessage.contextInfo?.stanzaId !== sentMessage.key.id) return;

        const buttonId = message.message.buttonsResponseMessage.selectedButtonId;
        const userJid = message.key.participant || message.key.remoteJid;

        try {
          if (buttonId === 'github_repo') {
            await zk.sendMessage(dest, { 
              text: `🌍 *GitHub Repository*\n\ngithub.com/${repository}`,
              mentions: [userJid]
            }, { quoted: message });
          } 
          else if (buttonId === 'whatsapp_channel') {
            await zk.sendMessage(dest, {
              text: "📢 *WhatsApp Channel*\n\nJoin our official channel:\nwhatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
              mentions: [userJid]
            }, { quoted: message });
          }
          else if (buttonId === 'ping_bot') {
            const randomPong = Math.floor(Math.random() * 900000) + 100000;
            await zk.sendMessage(dest, { 
              text: `📡 *Ping Testing...*\n\nPong! ${randomPong} ✅`,
              mentions: [userJid]
            }, { quoted: message });
          }
          else if (buttonId === 'repo_audio') {
            const randomAudioFile = audioFiles[Math.floor(Math.random() * audioFiles.length)];
            const audioUrl = `${githubRawBaseUrl}/${randomAudioFile}`;
            await zk.sendMessage(dest, {
              audio: { url: audioUrl },
              mimetype: "audio/mpeg",
              ptt: true,
              contextInfo: {
                mentionedJid: [userJid],
                externalAdReply: {
                  title: "🎵 Bwm Quantum Repo Alive Audio",
                  body: "Enjoy this random alive audio!",
                  thumbnailUrl: imageUrl,
                  mediaType: 1,
                  showAdAttribution: true,
                },
              },
            }, { quoted: message });
          }
        } catch (error) {
          console.error("Button action error:", error);
          await zk.sendMessage(dest, {
            text: "❌ Error processing your request. Please try again.",
            mentions: [userJid]
          }, { quoted: message });
        }
      };

      // Add event listener
      zk.ev.on('messages.upsert', buttonHandler);

      // Remove listener after 5 minutes
      setTimeout(() => {
        zk.ev.off('messages.upsert', buttonHandler);
      }, 300000);

    } catch (e) {
      console.error("❌ Error sending GitHub info:", e);
      repondre("❌ Error sending GitHub info: " + e.message);
    }
  });
});
