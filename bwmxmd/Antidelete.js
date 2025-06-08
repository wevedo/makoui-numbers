const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { createContext } = require('../Ibrahim/helper');
const fs = require('fs');
const path = require('path');
const stream = require('stream');
const util = require('util');
const pipeline = util.promisify(stream.pipeline);

module.exports = {
    setup: async (adams, { config, logger }) => {
        if (!adams || !config) {
            logger.error('Anti-Delete: Missing adams or config');
            return;
        }

        const botJid = `${adams.user?.id.split(':')[0]}@s.whatsapp.net`;
        const botOwnerJid = `${config.OWNER_NUMBER}@s.whatsapp.net`;
        let store = { chats: {} };

        adams.ev.on("messages.upsert", async (m) => {
            try {
                const { messages } = m;
                const ms = messages[0];
                
                if (!ms?.message) return;

                const messageKey = ms.key;
                if (!messageKey?.remoteJid) return;

                const remoteJid = messageKey.remoteJid;
                const senderJid = messageKey.participant || messageKey.remoteJid;

                // Skip status updates, messages from self, and messages from owner
                if (remoteJid === "status@broadcast" || 
                    senderJid === botJid || 
                    senderJid === botOwnerJid || 
                    messageKey.fromMe) {
                    return;
                }

                // Skip if not a group message (unless configured otherwise)
                if (!remoteJid.endsWith('@g.us') && !config.ANTIDELETE_PM) {
                    return;
                }

                if (!store.chats[remoteJid]) {
                    store.chats[remoteJid] = [];
                }

                store.chats[remoteJid].push(ms);

                if (ms.message?.protocolMessage?.type === 0) {
                    const protocolMsg = ms.message.protocolMessage;
                    if (!protocolMsg?.key?.id) return;

                    const deletedKey = protocolMsg.key;
                    const chatMessages = store.chats[remoteJid] || [];
                    const deletedMessage = chatMessages.find(msg => msg?.key?.id === deletedKey.id);

                    if (!deletedMessage?.message) return;

                    const participant = deletedMessage.key?.participant || deletedMessage.key?.remoteJid;
                    if (!participant) return;

                    // Skip if the deleted message was from bot or owner
                    if (participant === botJid || participant === botOwnerJid) {
                        return;
                    }

                    const notification = `♻️ *BWM-XMD Anti-Delete Alert* ♻️\n\n` +
                                       `🛑 Message deleted by @${participant.split("@")[0]}`;

                    const context = createContext(participant, {
                        title: "Anti-Delete Protection",
                        body: "Deleted message recovered",
                        thumbnail: "https://files.catbox.moe/sd49da.jpg"
                    });

                    const sendMessage = async (jid, content) => {
                        try {
                            await adams.sendMessage(jid, {
                                ...content,
                                ...context
                            });
                        } catch (sendError) {
                            logger.error('Failed to send message:', sendError);
                        }
                    };

                    try {
                        let messageContent = { 
                            text: notification, 
                            mentions: [participant] 
                        };

                        if (deletedMessage.message?.conversation) {
                            messageContent.text += `\n\n📝 *Content:* ${deletedMessage.message.conversation}`;
                        } 
                        else if (deletedMessage.message?.extendedTextMessage?.text) {
                            messageContent.text += `\n\n📝 *Content:* ${deletedMessage.message.extendedTextMessage.text}`;
                        } 
                        else {
                            let mediaType, mediaInfo;
                            
                            if (deletedMessage.message?.imageMessage) {
                                mediaType = 'image';
                                mediaInfo = deletedMessage.message.imageMessage;
                            } else if (deletedMessage.message?.videoMessage) {
                                mediaType = 'video';
                                mediaInfo = deletedMessage.message.videoMessage;
                            } else if (deletedMessage.message?.audioMessage) {
                                mediaType = 'audio';
                                mediaInfo = deletedMessage.message.audioMessage;
                            } else if (deletedMessage.message?.stickerMessage) {
                                mediaType = 'sticker';
                                mediaInfo = deletedMessage.message.stickerMessage;
                            } else if (deletedMessage.message?.documentMessage) {
                                mediaType = 'document';
                                mediaInfo = deletedMessage.message.documentMessage;
                            }

                            if (mediaType && mediaInfo) {
                                try {
                                    const mediaStream = await downloadMediaMessage(deletedMessage, { logger });
                                    
                                    let ext;
                                    switch (mediaType) {
                                        case 'image': ext = 'jpg'; break;
                                        case 'video': ext = 'mp4'; break;
                                        case 'audio': ext = 'ogg'; break;
                                        case 'sticker': ext = 'webp'; break;
                                        case 'document': 
                                            ext = mediaInfo.fileName?.split('.').pop() || 'bin';
                                            break;
                                        default: ext = 'bin';
                                    }
                                    
                                    const tempPath = path.join(__dirname, `temp_media.${ext}`);
                                    const writeStream = fs.createWriteStream(tempPath);
                                    
                                    await pipeline(mediaStream, writeStream);
                                    
                                    const caption = mediaInfo.caption || '';
                                    messageContent = {
                                        [mediaType]: { url: tempPath },
                                        ...(mediaType !== 'audio' && mediaType !== 'sticker' ? { 
                                            caption: `${notification}\n${caption}`.trim() 
                                        } : {}),
                                        mentions: [participant],
                                        ...context,
                                        ...(mediaType === 'document' ? {
                                            mimetype: mediaInfo.mimetype,
                                            fileName: mediaInfo.fileName
                                        } : {}),
                                        ...(mediaType === 'audio' ? {
                                            ptt: mediaInfo.ptt,
                                            mimetype: 'audio/ogg; codecs=opus'
                                        } : {})
                                    };
                                    
                                    if (config.ANTIDELETE1 === "yes") {
                                        await sendMessage(botOwnerJid, messageContent);
                                    }

                                    if (config.ANTIDELETE2 === "yes") {
                                        await sendMessage(remoteJid, messageContent);
                                    }
                                    
                                    fs.unlinkSync(tempPath);
                                    return;
                                    
                                } catch (mediaError) {
                                    logger.error(`Failed to process ${mediaType}:`, mediaError);
                                    throw new Error(`Failed to process ${mediaType}`);
                                }
                            }
                        }

                        if (config.ANTIDELETE1 === "yes") {
                            await sendMessage(botOwnerJid, messageContent);
                        }

                        if (config.ANTIDELETE2 === "yes") {
                            await sendMessage(remoteJid, messageContent);
                        }

                    } catch (error) {
                        logger.error('Error handling deleted message:', error);
                        try {
                            const fallbackContent = {
                                text: `⚠️ A message was deleted but couldn't be recovered`,
                                mentions: participant ? [participant] : [],
                                ...context
                            };
                            if (config.ANTIDELETE1 === "yes") {
                                await adams.sendMessage(botOwnerJid, fallbackContent);
                            }
                            if (config.ANTIDELETE2 === "yes") {
                                await adams.sendMessage(remoteJid, fallbackContent);
                            }
                        } catch (err) {
                            logger.error('Fallback message failed:', err);
                        }
                    }
                }
            } catch (outerError) {
                logger.error('Outer error in message processing:', outerError);
            }
        });
    }
};
