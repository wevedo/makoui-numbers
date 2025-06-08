const { createContext } = require('../Ibrahim/helper');

const isAnyLink = (message) => {
    const linkPattern = /https?:\/\/[^\s]+/;
    return linkPattern.test(message);
};

module.exports = {
    setup: async (adams, { config, logger }) => {
        if (!adams || !config) return;

        const botJid = `${adams.user?.id.split('@')[0]}@s.whatsapp.net`;
        const businessLink = 'https://business.bwmxmd.online/';
        const infoLink = 'https://ibrahimadams.site/';
        const whitelistedLinks = [
            businessLink,
            infoLink,
            ...(config.WHITELISTED_LINKS || [])
        ];

        // Only listen to messages (not group participant updates)
        adams.ev.on('messages.upsert', async (msg) => {
            try {
                if (!config.GROUP_ANTILINK && !config.GROUP_ANTILINK2) return;

                const { messages } = msg;
                const message = messages[0];
                if (!message?.message) return;

                const from = message.key.remoteJid;
                const sender = message.key.participant || from;
                
                // Skip if: from bot, from me, or not a group
                if (!from?.endsWith('@g.us') || 
                    sender === botJid || 
                    message.key.fromMe) {
                    return;
                }

                // Get group metadata and check admin/superuser status
                const groupMetadata = await adams.groupMetadata(from);
                const participant = groupMetadata.participants.find(p => p.id === sender);
                const isAdmin = participant?.admin;
                const isSuperUser = sender === config.OWNER_NUMBER + '@s.whatsapp.net';
                
                if (isAdmin || isSuperUser) return;

                // Extract message text
                const msgObj = message.message;
                const body = msgObj.conversation || 
                            msgObj.extendedTextMessage?.text || 
                            Object.values(msgObj)[0]?.text || '';

                // Only proceed if link is detected
                if (!isAnyLink(body)) return;

                // Check if link is whitelisted
                const containsWhitelistedLink = whitelistedLinks.some(link => 
                    body.includes(link)
                );
                if (containsWhitelistedLink) return;

                // Create newsletter context
                const context = createContext(sender, {
                    title: "BWM-XMD Security Action",
                    body: "Link Policy Enforcement",
                    thumbnail: "https://files.catbox.moe/sd49da.jpg"
                });

                // Strict mode (delete + remove)
                if (config.GROUP_ANTILINK === 'yes') {
                    await adams.sendMessage(from, { delete: message.key });
                    await adams.groupParticipantsUpdate(from, [sender], 'remove');
                    await adams.sendMessage(from, {
                        text: `⚠️ @${sender.split('@')[0]} removed for sending links\n\n` +
                              `🔗 ${businessLink}\n` +
                              `ℹ️ ${infoLink}`,
                        mentions: [sender],
                        ...context
                    });
                } 
                // Warning mode (delete only)
                else if (config.GROUP_ANTILINK2 === 'yes') {
                    await adams.sendMessage(from, { delete: message.key });
                    await adams.sendMessage(from, {
                        text: `⚠️ @${sender.split('@')[0]}, links prohibited!\n\n` +
                              `🔗 ${businessLink}\n` +
                              `ℹ️ ${infoLink}`,
                        mentions: [sender],
                        ...context
                    });
                }

            } catch (err) {
                logger.error('Anti-link error:', err);
            }
        });
    }
};

