const { adams } = require("../Ibrahim/adams");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const fs = require("fs-extra");
const path = require("path");
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dptzpfgtm',
  api_key: process.env.CLOUDINARY_API_KEY || '247319227263335',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'OzNSWLPujncaia9d_XG9sWtMkxo',
  secure: true
});

// Utility function to download media
async function downloadMedia(mediaMessage, mediaType) {
    const stream = await downloadContentFromMessage(mediaMessage, mediaType);
    const buffer = await streamToBuffer(stream);

    // Convert all audio to MP3 before uploading
    const extension = mediaType === "audio" ? "mp3" : mediaMessage.mimetype.split("/")[1] || "bin";
    const filePath = path.join(__dirname, `temp_${Date.now()}.${extension}`);

    await fs.writeFile(filePath, buffer);
    return filePath;
}

// Convert stream to buffer
async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
    });
}

// Upload file to Cloudinary and return URL without protocol
async function uploadToCloudinary(filePath, mediaType) {
    try {
        const options = {
            resource_type: mediaType === "video" ? "video" : "auto",
            folder: "whatsapp_uploads"
        };

        const result = await cloudinary.uploader.upload(filePath, options);
        // Remove https:// from the URL
        return result.secure_url.replace(/^https?:\/\//, '');
    } catch (err) {
        throw new Error("Cloudinary Upload Error: " + err.message);
    }
}

// Command logic
adams({ nomCom: "url2", categorie: "General", reaction: "🌐" }, async (origineMessage, zk, commandeOptions) => {
    const { msgRepondu, repondre } = commandeOptions;

    if (!msgRepondu) {
        repondre("📌 Reply to an image, video, audio, or document to get a URL.");
        return;
    }

    let mediaPath, mediaType;

    try {
        if (msgRepondu.videoMessage) {
            const videoSize = msgRepondu.videoMessage.fileLength;
            if (videoSize > 50 * 1024 * 1024) {
                repondre("🚨 The video is too large (max 50MB). Please send a smaller one.");
                return;
            }
            mediaPath = await downloadMedia(msgRepondu.videoMessage, "video");
            mediaType = "video";

        } else if (msgRepondu.imageMessage) {
            mediaPath = await downloadMedia(msgRepondu.imageMessage, "image");
            mediaType = "image";

        } else if (msgRepondu.audioMessage) {
            mediaPath = await downloadMedia(msgRepondu.audioMessage, "audio");
            mediaType = "audio";

        } else if (msgRepondu.documentMessage) {
            mediaPath = await downloadMedia(msgRepondu.documentMessage, "document");
            mediaType = "document";

        } else {
            repondre("⚠ Unsupported media type. Reply with an image, video, audio, or document.");
            return;
        }

        // Upload and get URL without protocol
        const cloudinaryUrl = await uploadToCloudinary(mediaPath, mediaType);
        fs.unlinkSync(mediaPath); // Cleanup after upload

        // Reply with the correct type
        const responses = {
            image: `🖼️ Image URL:\n${cloudinaryUrl}`,
            video: `🎥 Video URL:\n${cloudinaryUrl}`,
            audio: `🔊 Audio URL (MP3):\n${cloudinaryUrl}`,
            document: `📄 Document URL:\n${cloudinaryUrl}`
        };

        repondre(responses[mediaType] || `✅ File URL:\n${cloudinaryUrl}`);

    } catch (error) {
        console.error("Error in url2 command:", error);
        if (mediaPath && fs.existsSync(mediaPath)) {
            fs.unlinkSync(mediaPath);
        }
        repondre("❌ Error processing media. Please try again.");
    }
});
