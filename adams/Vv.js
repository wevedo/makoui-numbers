const { adams } = require('../Ibrahim/adams');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { createContext } = require('../Ibrahim/helper');

// Define bot JID
const botJid = `${adams.user?.id.split(':')[0]}@s.whatsapp.net`;

// Common download function
async function downloadMedia(mediaMessage, mediaType) {
    const stream = await downloadContentFromMessage(mediaMessage, mediaType);
    const buffer = await streamToBuffer(stream);
    return buffer;
}

// Stream to buffer helper
async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

// Download1 - Recover in conversation
adams({ 
    nomCom: "vv", 
    categorie: "Media", 
    reaction: "💾",
    description: "Recover media in current conversation"
}, async (origineMessage, zk, commandeOptions) => {
    const { ms, repondre, msgRepondu } = commandeOptions;
    
    if (!msgRepondu) {
        return repondre({
            text: "❌ Please reply to a media message",
            ...createContext(origineMessage, {
                title: "Usage Error",
                body: "Reply to media with !download1"
            })
        }, { quoted: ms });
    }

    const mediaMessage = getMediaMessage(msgRepondu);
    if (!mediaMessage) {
        return repondre({
            text: "❌ Unsupported media type",
            ...createContext(origineMessage, {
                title: "Media Error",
                body: "Images/videos/audio/documents only"
            })
        }, { quoted: ms });
    }

    try {
        const { mediaType, mimeType } = detectMediaType(msgRepondu);
        const buffer = await downloadMedia(mediaMessage, mediaType);
        
        await sendMedia(zk, origineMessage, buffer, mediaType, mimeType, ms);

    } catch (error) {
        console.error('Download1 error:', error);
        repondre({
            text: `❌ Recovery failed: ${error.message}`,
            ...createContext(origineMessage, {
                title: "Error",
                body: "Try again later"
            })
        }, { quoted: ms });
    }
});

adams({ 
    nomCom: "sent", 
    categorie: "Media", 
    reaction: "💾",
    description: "Recover media in current conversation"
}, async (origineMessage, zk, commandeOptions) => {
    const { ms, repondre, msgRepondu } = commandeOptions;
    
    if (!msgRepondu) {
        return repondre({
            text: "❌ Please reply to a media message",
            ...createContext(origineMessage, {
                title: "Usage Error",
                body: "Reply to media with !download1"
            })
        }, { quoted: ms });
    }

    const mediaMessage = getMediaMessage(msgRepondu);
    if (!mediaMessage) {
        return repondre({
            text: "❌ Unsupported media type",
            ...createContext(origineMessage, {
                title: "Media Error",
                body: "Images/videos/audio/documents only"
            })
        }, { quoted: ms });
    }

    try {
        const { mediaType, mimeType } = detectMediaType(msgRepondu);
        const buffer = await downloadMedia(mediaMessage, mediaType);
        
        await sendMedia(zk, origineMessage, buffer, mediaType, mimeType, ms);

    } catch (error) {
        console.error('Download1 error:', error);
        repondre({
            text: `❌ Recovery failed: ${error.message}`,
            ...createContext(origineMessage, {
                title: "Error",
                body: "Try again later"
            })
        }, { quoted: ms });
    }
});

// Download2 - Send in DM
adams({ 
    nomCom: "vv2", 
    categorie: "Media", 
    reaction: "📩",
    description: "Send media to your DM"
}, async (origineMessage, zk, commandeOptions) => {
    const { ms, repondre, msgRepondu, auteurMessage } = commandeOptions;
    
    if (!msgRepondu) {
        return repondre({
            text: "❌ Please reply to a media message",
            ...createContext(origineMessage, {
                title: "Usage Error",
                body: "Reply to media with !download2"
            })
        }, { quoted: ms });
    }

    const mediaMessage = getMediaMessage(msgRepondu);
    if (!mediaMessage) {
        return repondre({
            text: "❌ Unsupported media type",
            ...createContext(origineMessage, {
                title: "Media Error",
                body: "Images/videos/audio/documents only"
            })
        }, { quoted: ms });
    }

    try {
        const { mediaType, mimeType } = detectMediaType(msgRepondu);
        const buffer = await downloadMedia(mediaMessage, mediaType);
        
        // Send to user's DM
        await sendMedia(zk, auteurMessage, buffer, mediaType, mimeType, ms);
        
        // Confirm in group
        if (origineMessage.endsWith('@g.us')) {
            await repondre({
                text: "✅ Media sent to your DM",
                ...createContext(origineMessage, {
                    title: "Check Your Inbox",
                    body: "Media delivered privately"
                })
            }, { quoted: ms });
        }

    } catch (error) {
        console.error('Download2 error:', error);
        repondre({
            text: `❌ DM send failed: ${error.message}`,
            ...createContext(origineMessage, {
                title: "Error",
                body: "Try again later"
            })
        }, { quoted: ms });
    }
});
adams({ 
    nomCom: "save", 
    categorie: "Media", 
    reaction: "📩",
    description: "Send media to your DM"
}, async (origineMessage, zk, commandeOptions) => {
    const { ms, repondre, msgRepondu, auteurMessage } = commandeOptions;
    
    if (!msgRepondu) {
        return repondre({
            text: "❌ Please reply to a media message",
            ...createContext(origineMessage, {
                title: "Usage Error",
                body: "Reply to media with !download2"
            })
        }, { quoted: ms });
    }

    const mediaMessage = getMediaMessage(msgRepondu);
    if (!mediaMessage) {
        return repondre({
            text: "❌ Unsupported media type",
            ...createContext(origineMessage, {
                title: "Media Error",
                body: "Images/videos/audio/documents only"
            })
        }, { quoted: ms });
    }

    try {
        const { mediaType, mimeType } = detectMediaType(msgRepondu);
        const buffer = await downloadMedia(mediaMessage, mediaType);
        
        // Send to user's DM
        await sendMedia(zk, auteurMessage, buffer, mediaType, mimeType, ms);
        
        // Confirm in group
        if (origineMessage.endsWith('@g.us')) {
            await repondre({
                text: "✅ Media sent to your DM",
                ...createContext(origineMessage, {
                    title: "Check Your Inbox",
                    body: "Media delivered privately"
                })
            }, { quoted: ms });
        }

    } catch (error) {
        console.error('Download2 error:', error);
        repondre({
            text: `❌ DM send failed: ${error.message}`,
            ...createContext(origineMessage, {
                title: "Error",
                body: "Try again later"
            })
        }, { quoted: ms });
    }
});
// Helper functions
function getMediaMessage(msg) {
    return msg.imageMessage || msg.videoMessage || 
           msg.audioMessage || msg.stickerMessage || 
           msg.documentMessage;
}

function detectMediaType(msg) {
    if (msg.imageMessage) return { mediaType: 'image', mimeType: msg.imageMessage.mimetype };
    if (msg.videoMessage) return { mediaType: 'video', mimeType: msg.videoMessage.mimetype };
    if (msg.audioMessage) return { mediaType: 'audio', mimeType: 'audio/mpeg' };
    if (msg.stickerMessage) return { mediaType: 'sticker', mimeType: msg.stickerMessage.mimetype };
    if (msg.documentMessage) return { mediaType: 'document', mimeType: msg.documentMessage.mimetype };
    return { mediaType: null, mimeType: null };
}

async function sendMedia(zk, destination, buffer, mediaType, mimeType, quotedMsg) {
    const messageOptions = {
        mimetype: mimeType,
        ...createContext(destination, {
            title: `Recovered ${mediaType}`,
            body: "Saved from conversation"
        })
    };

    // Special handling for audio
    if (mediaType === 'audio') {
        messageOptions.ptt = false;
        messageOptions.waveform = new Uint8Array(100).fill(128);
    }

    await zk.sendMessage(destination, {
        [mediaType]: buffer,
        ...messageOptions
    }, { quoted: quotedMsg });
}
