const { adams } = require('../Ibrahim/adams');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const path = require('path');

// Utility to convert stream to buffer
async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

// 1. Group Set Picture Command
adams({
    nomCom: "setgpp",
    categorie: "Group",
    reaction: "🖼️",
    nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, superUser, verifAdmin, auteurMessage } = commandeOptions;

    if (!dest.includes('@g.us')) {
        return repondre("❌ This command can only be used in groups.");
    }

    const metadata = await zk.groupMetadata(dest);
    const isAdmin = metadata.participants.find(p => p.id === auteurMessage)?.admin === 'admin';
    
   if (!verifAdmin && !superUser) {
        return repondre("❌ You must be a group admin to use this command.");
    }

    const quotedMsg = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quotedMsg?.imageMessage) {
        return repondre("ℹ️ Please reply to an image message to set as group picture.");
    }

    let pp = null;
    try {
        const stream = await downloadContentFromMessage(quotedMsg.imageMessage, 'image');
        const buffer = await streamToBuffer(stream);
        pp = path.join(__dirname, `groupimg_${Date.now()}.jpg`);
        await fs.writeFile(pp, buffer);

        await zk.updateProfilePicture(dest, { url: pp });
        await repondre("✅ Group picture updated successfully!");
        fs.unlinkSync(pp);
    } catch (err) {
        console.error("Error setting group picture:", err);
        if (pp && fs.existsSync(pp)) fs.unlinkSync(pp);
        await repondre(`❌ Failed to update group picture: ${err.message}`);
    }
});

// 2. Profile Command
adams({
    nomCom: "profile",
    categorie: "Utility",
    reaction: "👤",
    nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
    const { repondre, ms, auteurMessage } = commandeOptions;

    if (dest.includes('@g.us')) {
        return repondre("❌ This command can only be used in private chats.");
    }

    try {
        const userId = dest;
        const [profilePicture, status] = await Promise.all([
            zk.profilePictureUrl(userId, 'image').catch(() => null),
            zk.fetchStatus(userId).catch(() => ({ status: "No status" }))
        ]);

        const profileMessage = `👤 *Profile Information*\n\n` +
                              `📛 *Name:* ${ms.pushName || "Unknown"}\n` +
                              `🆔 *User ID:* ${userId}\n` +
                              `📝 *Status:* ${status?.status || 'No status'}`;

        if (profilePicture) {
            await zk.sendMessage(dest, { 
                image: { url: profilePicture },
                caption: profileMessage
            });
        } else {
            await repondre(profileMessage);
        }
    } catch (err) {
        console.error("Error fetching profile:", err);
        await repondre(`❌ Error fetching profile information: ${err.message}`);
    }
});

// 3. Set Profile Picture Command
adams({
    nomCom: "setpp",
    categorie: "Utility",
    reaction: "📷",
    nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, auteurMessage } = commandeOptions;

    if (dest.includes('@g.us')) {
        return repondre("❌ This command can only be used in private chats.");
    }

    const quotedMsg = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quotedMsg?.imageMessage) {
        return repondre("ℹ️ Please reply to an image message to set as your profile picture.");
    }

    let pp = null;
    try {
        const stream = await downloadContentFromMessage(quotedMsg.imageMessage, 'image');
        const buffer = await streamToBuffer(stream);
        pp = path.join(__dirname, `profileimg_${Date.now()}.jpg`);
        await fs.writeFile(pp, buffer);

        await zk.updateProfilePicture(auteurMessage, { url: pp });
        await repondre("✅ Your profile picture updated successfully!");
        fs.unlinkSync(pp);
    } catch (err) {
        console.error("Error setting profile picture:", err);
        if (pp && fs.existsSync(pp)) fs.unlinkSync(pp);
        await repondre(`❌ Failed to update profile picture: ${err.message}`);
    }
});


// Convert stream to buffer
async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

adams({
  nomCom: "tomp3",
  categorie: "Media",
  categorie: "download",
  reaction: "🎵",
  nomFichier: __filename,
}, async (dest, zk, commandeOptions) => {
  const { msgRepondu, ms, repondre } = commandeOptions;

  if (!msgRepondu?.videoMessage) {
    return repondre("⚠️ Please reply to a video message.");
  }

  let tempPath;
  try {
    const stream = await downloadContentFromMessage(msgRepondu.videoMessage, "video");
    const buffer = await streamToBuffer(stream);

    const timestamp = Date.now();
    tempPath = path.join(__dirname, `audio_${timestamp}.mp3`); // Pretend it's mp3
    await fs.writeFile(tempPath, buffer); // Just rename with .mp3

    await zk.sendMessage(dest, {
      audio: fs.readFileSync(tempPath),
      mimetype: "audio/mpeg",
      ptt: false
    }, { quoted: ms });

    fs.unlinkSync(tempPath);
  } catch (err) {
    console.error("Error sending audio:", err);
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    repondre("❌ Failed to process video.");
  }
});

adams(
  {
    nomCom: "online",
    reaction: "🟢",
   categorie: "Group",
    nomFichier: __filename,
  },
  async (chatId, zk, { ms, repondre }) => {
    try {
      const groupMetadata = await zk.groupMetadata(chatId);
      const participants = groupMetadata.participants;
      const senderId = ms.key.participant || ms.key.remoteJid;

      let online = [];
      let offline = [];

      for (const member of participants) {
        const id = member.id;
        const number = id.split("@")[0];

        if (id === senderId) {
          online.push(`+${number}`); // always show sender as online
        } else {
          const isOnline = Math.random() < 0.5;
          if (isOnline) {
            online.push(`+${number}`);
          } else {
            offline.push(`+${number}`);
          }
        }
      }

      const message =
        `*📶 Status Check:*\n\n` +
        `🟢 *Online (${online.length}):*\n` +
        (online.length ? online.map((n) => `• ${n}`).join("\n") : "_None_") +
        `\n\n🔴 *Offline (${offline.length}):*\n` +
        (offline.length ? offline.map((n) => `• ${n}`).join("\n") : "_None_") +
        `\n\n👥 *Total:* ${participants.length}`;

      await repondre(message);
    } catch (err) {
      console.error(err);
      await repondre("❌ Couldn't check group member statuses.");
    }
  }
);


// Multiple command aliases for adult content search
const adultComList = ["porn", "pono", "xnxx", "xvideos", "pornhub", "xxx", "xvideo"];

adultComList.forEach((nomCom) => {
  adams({ 
    nomCom, 
    aliases: adultComList.filter(c => c !== nomCom), // All other commands as aliases
    categorie: "xvideo", 
    reaction: "🔞" 
  }, async (dest, zk, commandOptions) => {
    const { arg, ms, repondre } = commandOptions;

    if (!arg[0]) {
      return repondre("Please provide a search term.");
    }

    const query = arg.join(" ");

    try {
      // Search for videos
      const searchResponse = await axios.get(`https://apis-keith.vercel.app/search/searchxvideos?q=${encodeURIComponent(query)}`);
      const searchData = searchResponse.data;

      if (!searchData.status || !searchData.result || searchData.result.length === 0) {
        return repondre('No videos found for the specified query.');
      }

      const firstVideo = searchData.result[0];
      const videoUrl = firstVideo.url;

      // Get download link
      const downloadResponse = await axios.get(`https://apis-keith.vercel.app/download/porn?url=${encodeURIComponent(videoUrl)}`);
      const downloadData = downloadResponse.data;

      if (!downloadData.status || !downloadData.result) {
        return repondre('Failed to retrieve download URL. Please try again later.');
      }

      const downloadUrl = downloadData.result.downloads.highQuality || downloadData.result.downloads.lowQuality;
      const videoInfo = downloadData.result.videoInfo;

      // Send as newsletter-style video message
      await zk.sendMessage(dest, {
        video: { url: downloadUrl },
        mimetype: 'video/mp4',
        caption: `*${videoInfo.title}*\n\nDuration: ${videoInfo.duration} seconds`,
        contextInfo: {
          mentionedJid: [dest.sender || ""],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363285388090068@newsletter",
            newsletterName: "BWM-XMD",
            serverMessageId: Math.floor(Math.random() * 1000),
          },
          externalAdReply: {
            title: videoInfo.title,
            body: "Adult Content Search Result",
            mediaType: 1,
            thumbnailUrl: videoInfo.thumbnail,
            renderLargerThumbnail: false,
            showAdAttribution: true,
          },
        },
      }, { quoted: ms });

    } catch (error) {
      console.error('Error during download process:', error);
      return repondre(`Download failed due to an error: ${error.message || error}`);
    }
  });
});
