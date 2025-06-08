const { createContext } = require('../Ibrahim/helper');
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
    setup: async (adams, { config, logger }) => {
        if (!adams || !config) return;

        const botJid = `${adams.user?.id.split('@')[0]}@s.whatsapp.net`;
        const businessLink = 'https://business.bwmxmd.online/';
        const infoLink = 'https://ibrahimadams.site/';

        // ==================== AUTO READ ====================
        if (config.AUTO_READ === "yes") {
            logger.info("[Read] Auto-read enabled for chats");
            
            adams.ev.on("messages.upsert", async (m) => {
                try {
                    const unread = m.messages.filter(
                        msg => !msg.key.fromMe && msg.key.remoteJid !== "status@broadcast"
                    );
                    if (unread.length > 0) {
                        await adams.readMessages(unread.map(msg => msg.key));
                    }
                } catch (err) {
                    logger.error("[Read] Error:", err);
                }
            });
        }

        // ==================== STATUS READ ====================
        // Auto-read status updates (always enabled if AUTO_READ_STATUS is yes)
if (config.AUTO_READ_STATUS === "yes") {
    logger.info("[Status] Auto-read enabled for status updates");
    
    adams.ev.on("messages.upsert", async (m) => {
        try {
            const statusUpdates = m.messages.filter(
                msg => msg.key?.remoteJid === "status@broadcast"
            );
            if (statusUpdates.length > 0) {
                await adams.readMessages(statusUpdates.map(msg => msg.key));
            }
        } catch (err) {
            logger.error("[Status] Read error:", err);
        }
    });
}
// Auto-read status updates (always enabled if AUTO_READ_STATUS is yes)
if (config.AUTO_READ_STATUS === "yes") {
    logger.info("[Status] Auto-read enabled for status updates");
    
    adams.ev.on("messages.upsert", async (m) => {
        try {
            const statusUpdates = m.messages.filter(
                msg => msg.key?.remoteJid === "status@broadcast" && 
                      !msg.key.participant?.includes(adams.user.id.split(':')[0])
            );
            if (statusUpdates.length > 0) {
                await adams.readMessages(statusUpdates.map(msg => msg.key));
            }
        } catch (err) {
            logger.error("[Status] Read error:", err);
        }
    });
}

// Status viewed notification (only if AUTO_REPLY_STATUS is yes)
if (config.AUTO_REPLY_STATUS === "yes") {
    logger.info("[Status] Auto-reply enabled for status views");
    
    // Track last notification time to prevent spamming
    const lastNotified = new Map();
    
    adams.ev.on("messages.upsert", async (m) => {
        try {
            const statusUpdates = m.messages.filter(
                msg => msg.key?.remoteJid === "status@broadcast" && 
                      !msg.key.participant?.includes(adams.user.id.split(':')[0])
            );
            
            if (statusUpdates.length > 0) {
                const statusSender = statusUpdates[0].key.participant;
                
                // Skip if it's your own status
                if (!statusSender || statusSender.includes(adams.user.id.split(':')[0])) return;
                
                // Check if we recently notified this sender
                const now = Date.now();
                const lastNotification = lastNotified.get(statusSender) || 0;
                
                // Only notify if at least 5 minutes passed since last notification
                if (now - lastNotification > 300000) {
                    lastNotified.set(statusSender, now);
                    
                    await adams.sendMessage(statusSender, {
                        text: `${config.REPLY_STATUS_TEXT || "*ʏᴏᴜʀ sᴛᴀᴛᴜs ʜᴀᴠᴇ ʙᴇᴇɴ ᴠɪᴇᴡᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ ✅*"}${' '}
> ǫᴜᴀɴᴛᴜᴍ ᴠɪᴇᴡᴇʀ`,
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: "120363285388090068@newsletter",
                                newsletterName: "BWM-XMD",
                                serverMessageId: Math.floor(100000 + Math.random() * 900000),
                            },
                        }
                    });
                }
            }
        } catch (err) {
            logger.error("[Status] Reply error:", err);
        }
    });
}
        // ==================== AUTO REACT TO MESSAGES ====================
        if (config.AUTO_REACT === "yes") {
            logger.info("[React] Auto-react to messages enabled");
            
            const emojiMap = {
                "hello": ["👋", "🙂", "😊"],
                "hi": ["👋", "😄", "🤗"],
                "good morning": ["🌞", "☀️", "🌻"],
                "good night": ["🌙", "🌠", "💤"],
                "thanks": ["🙏", "❤️", "😊"],
                "welcome": ["😊", "🤗", "👌"],
                "congrats": ["🎉", "👏", "🥳"],
                "sorry": ["😔", "🙏", "🥺"]
            };
                       
            const fallbackEmojis = [
    // Positive Feedback
    "👍", "👌", "💯", "✨", "🌟", "🏆", "🎯", "✅",
    
    // Appreciation
    "🙏", "❤️", "💖", "💝", "💐", "🌹",
    
    // Neutral Positive
    "😊", "🙂", "👋", "🤝", "🫱🏻‍🫲🏽",
    
    // Celebration
    "🎉", "🎊", "🥂", "🍾", "🎈", "🎁",
    
    // Time/Seasons
    "🌞", "☀️", "🌙", "⭐", "🌈", "☕",
    
    // Nature/Travel
    "🌍", "✈️", "🗺️", "🌻", "🌸", "🌊",
    
    // Professional/Creative
    "📚", "🎨", "📝", "🔍", "💡", "⚙️",
    
    // Objects/Symbols
    "📌", "📍", "🕰️", "⏳", "📊", "📈"];

            let lastReactTime = 0;

            adams.ev.on("messages.upsert", async (m) => {
                try {
                    const { messages } = m;
                    const now = Date.now();

                    for (const message of messages) {
                        if (!message.key || message.key.fromMe || 
                            message.key.remoteJid === "status@broadcast" ||
                            now - lastReactTime < 2000) continue;

                        const msgText = (
                            message.message?.conversation || 
                            message.message?.extendedTextMessage?.text || ""
                        ).toLowerCase();

                        let emoji;
                        for (const [keyword, emojis] of Object.entries(emojiMap)) {
                            if (msgText.includes(keyword)) {
                                emoji = emojis[Math.floor(Math.random() * emojis.length)];
                                break;
                            }
                        }

                        emoji = emoji || fallbackEmojis[Math.floor(Math.random() * fallbackEmojis.length)];

                        await adams.sendMessage(message.key.remoteJid, {
                            react: {
                                text: emoji,
                                key: message.key
                            }
                        });

                        lastReactTime = now;
                        logger.info(`[React] Sent ${emoji} to ${message.key.remoteJid}`);
                        await delay(1000);
                    }
                } catch (err) {
                    logger.error("[React] Error:", err);
                }
            });
        }
    }
};
