const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    setup: async (adams, { config, logger }) => {
        if (!adams || !config || config.AUTO_REACT_STATUS !== "yes") return;

        let lastReactionTime = 0;

        adams.ev.on("messages.upsert", async (m) => {
            const { messages } = m;
            
            // Get emojis from config with defaults
            const reactionEmojis = (config.STATUS_REACT_EMOJIS || "🚀,🌎,♻️").split(",").map(e => e.trim());

            for (const message of messages) {
                if (message.key && message.key.remoteJid === "status@broadcast") {
                    const now = Date.now();
                    if (now - lastReactionTime < 5000) continue; // 5-second cooldown

                    const botJid = adams.user?.id ? `${adams.user.id.split(':')[0]}@s.whatsapp.net` : null;
                    if (!botJid) continue;

                    try {
                        const randomEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];

                        await adams.sendMessage(message.key.remoteJid, {
                            react: {
                                key: message.key,
                                text: randomEmoji,
                            },
                        }, {
                            statusJidList: [message.key.participant, botJid],
                        });

                        lastReactionTime = Date.now();
                        await delay(2000);
                    } catch (error) {
                        logger.error(`Status reaction failed: ${error.message}`);
                    }
                }
            }
        });
    }
};
