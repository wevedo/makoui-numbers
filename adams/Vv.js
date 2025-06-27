const { adams } = require('../Ibrahim/adams');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { createContext } = require('../Ibrahim/helper');

// Define bot JID
const botJid = `${adams.user?.id.split(':')[0]}@s.whatsapp.net`;

// Command lists
const mediaRecoveryCommands = ["vv", "sent"];
const dmMediaCommands = ["vv2", "save"];

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

// Enhanced media detection for iOS compatibility
function getMediaMessage(msg) {
    // Check for standard message types
    if (msg.imageMessage || msg.videoMessage || 
        msg.audioMessage || msg.stickerMessage || 
        msg.documentMessage) {
        return msg.imageMessage || msg.videoMessage || 
               msg.audioMessage || msg.stickerMessage || 
               msg.documentMessage;
    }
    
    // iOS fallback - check for extended media message format
    if (msg?.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;
        return quoted.imageMessage || quoted.videoMessage || 
               quoted.audioMessage || quoted.stickerMessage || 
               quoted.documentMessage;
    }
    
    return null;
}

// Unified media download command
async function handleMediaDownload(origineMessage, zk, commandeOptions, sendToDM = false) {
    const { ms, repondre, msgRepondu, auteurMessage } = commandeOptions;
    
    if (!msgRepondu) {
        return repondre({
            text: "❌ Please reply to a media message",
            ...createContext(origineMessage, {
                title: "Usage Error",
                body: "Reply to media with this command"
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
        
        // Determine destination
        const destination = sendToDM ? auteurMessage : origineMessage;
        
        // Send with additional iOS compatibility options
        await sendMedia(zk, destination, buffer, mediaType, mimeType, ms, sendToDM);
        
        // Only send confirmation if in group and sending to DM
        if (sendToDM && origineMessage.endsWith('@g.us')) {
            await repondre({
                text: "✅ Media sent to your DM",
                ...createContext(origineMessage, {
                    title: "Check Your Inbox",
                    body: "Media delivered privately"
                })
            }, { quoted: ms });
        }

    } catch (error) {
        console.error('Media download error:', error);
        repondre({
            text: `❌ Operation failed: ${error.message}`,
            ...createContext(origineMessage, {
                title: "Error",
                body: "Try again later"
            })
        }, { quoted: ms });
    }
}

// Media recovery commands (same conversation)
mediaRecoveryCommands.forEach(cmd => {
    adams({ 
        nomCom: cmd, 
        categorie: "Media", 
        reaction: "💾",
        description: "Recover media in current conversation"
    }, async (origineMessage, zk, commandeOptions) => {
        await handleMediaDownload(origineMessage, zk, commandeOptions, false);
    });
});

// DM media commands
dmMediaCommands.forEach(cmd => {
    adams({ 
        nomCom: cmd, 
        categorie: "Media", 
        reaction: "📩",
        description: "Send media to your DM"
    }, async (origineMessage, zk, commandeOptions) => {
        await handleMediaDownload(origineMessage, zk, commandeOptions, true);
    });
});

// Enhanced media type detection
function detectMediaType(msg) {
    // First try standard message detection
    if (msg.imageMessage) return { mediaType: 'image', mimeType: msg.imageMessage.mimetype };
    if (msg.videoMessage) return { mediaType: 'video', mimeType: msg.videoMessage.mimetype };
    if (msg.audioMessage) return { mediaType: 'audio', mimeType: 'audio/mpeg' };
    if (msg.stickerMessage) return { mediaType: 'sticker', mimeType: msg.stickerMessage.mimetype };
    if (msg.documentMessage) return { mediaType: 'document', mimeType: msg.documentMessage.mimetype };
    
    // iOS fallback - check extended message format
    if (msg?.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;
        if (quoted.imageMessage) return { mediaType: 'image', mimeType: quoted.imageMessage.mimetype };
        if (quoted.videoMessage) return { mediaType: 'video', mimeType: quoted.videoMessage.mimetype };
        if (quoted.audioMessage) return { mediaType: 'audio', mimeType: 'audio/mpeg' };
        if (quoted.stickerMessage) return { mediaType: 'sticker', mimeType: quoted.stickerMessage.mimetype };
        if (quoted.documentMessage) return { mediaType: 'document', mimeType: quoted.documentMessage.mimetype };
    }
    
    return { mediaType: null, mimeType: null };
}

// Enhanced media sending with iOS support
async function sendMedia(zk, destination, buffer, mediaType, mimeType, quotedMsg, isDM = false) {
    const messageOptions = {
        mimetype: mimeType,
        ...createContext(destination, {
            title: `Recovered ${mediaType}`,
            body: isDM ? "Sent to your DM" : "Saved from conversation"
        })
    };

    // Special handling for audio
    if (mediaType === 'audio') {
        messageOptions.ptt = false;
        messageOptions.waveform = new Uint8Array(100).fill(128);
    }
    
    // iOS compatibility - ensure proper message structure
    const messagePayload = {
        [mediaType]: buffer,
        ...messageOptions
    };
    
    // Additional context info for iOS
    if (quotedMsg?.key) {
        messagePayload.contextInfo = {
            stanzaId: quotedMsg.key.id,
            participant: quotedMsg.key.participant || quotedMsg.key.remoteJid,
            quotedMessage: {
                conversation: "Media recovery"
            }
        };
    }

    await zk.sendMessage(destination, messagePayload, { quoted: quotedMsg });
}
