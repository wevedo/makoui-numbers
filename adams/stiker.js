const { adams } = require('../Ibrahim/adams');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const path = require('path');
const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');

// Utility to convert stream to buffer
async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}


// 2. Image to Sticker Command
adams({
    nomCom: "sticker",
    categorie: "Media",
    reaction: "🖼️➡️🎀",
    nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg } = commandeOptions;
    const quotedMsg = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quotedMsg?.imageMessage && !ms.message?.imageMessage) {
        return repondre("ℹ️ Please send or reply to an image to convert to sticker");
    }

    const imageMsg = quotedMsg?.imageMessage || ms.message?.imageMessage;
    let packName = arg.join(" ") || "Bwm xmd";
    let authorName = "By Ibrahim Adams";

    try {
        const stream = await downloadContentFromMessage(imageMsg, 'image');
        const buffer = await streamToBuffer(stream);
        
        const sticker = new Sticker(buffer, {
            pack: packName,
            author: authorName,
            type: StickerTypes.FULL,
            categories: ['🤩', '🎉'],
            id: '12345',
            quality: 70,
            background: 'transparent'
        });

        await zk.sendMessage(dest, await sticker.toMessage(), { quoted: ms });
    } catch (err) {
        console.error("Error creating sticker:", err);
        await repondre(`❌ Failed to create sticker: ${err.message}`);
    }
});

// 3. Sticker to Image Command
adams({
    nomCom: "toimage",
    categorie: "Media",
    reaction: "🎀➡️🖼️",
    nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre } = commandeOptions;
    const quotedMsg = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quotedMsg?.stickerMessage) {
        return repondre("ℹ️ Please reply to a sticker to convert to image");
    }

    try {
        const stream = await downloadContentFromMessage(quotedMsg.stickerMessage, 'image');
        const buffer = await streamToBuffer(stream);
        
        await zk.sendMessage(dest, {
            image: buffer,
            caption: "Here's your image from sticker"
        }, { quoted: ms });
    } catch (err) {
        console.error("Error converting sticker to image:", err);
        await repondre(`❌ Failed to convert sticker to image: ${err.message}`);
    }
});

// 4. Animated Sticker to Video Command
adams({
    nomCom: "tovideo",
    categorie: "Media",
    reaction: "🎀➡️🎥",
    nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre } = commandeOptions;
    const quotedMsg = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quotedMsg?.stickerMessage || !quotedMsg.stickerMessage.isAnimated) {
        return repondre("ℹ️ Please reply to an animated sticker to convert to video");
    }

    try {
        const stream = await downloadContentFromMessage(quotedMsg.stickerMessage, 'video');
        const buffer = await streamToBuffer(stream);
        
        await zk.sendMessage(dest, {
            video: buffer,
            caption: "Here's your video from animated sticker"
        }, { quoted: ms });
    } catch (err) {
        console.error("Error converting sticker to video:", err);
        await repondre(`❌ Failed to convert animated sticker to video: ${err.message}`);
    }
});
