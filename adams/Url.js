const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const fs = require("fs-extra");
const path = require("path");

// GitHub configuration
const token = "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";
const username = "omlugha";
const repo = "Bwm-xmd-urls";
const baseUrl = "url.bwmxmd.online";
let commitCounter = 1;

// Utility function to download media
async function downloadMedia(mediaMessage, mediaType) {
    const stream = await downloadContentFromMessage(mediaMessage, mediaType);
    const buffer = await streamToBuffer(stream);

    // Convert all audio to MP3 before uploading
    const extension = mediaType === "audio" ? "mp3" : mediaMessage.mimetype.split("/")[1] || "bin";
    const filePath = path.join(__dirname, `temp_${Date.now()}.${extension}`;

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

// Generate random filename with extension
function generateRandomName(extension) {
    const randomStr = Math.random().toString(36).substr(2, 8);
    return `${randomStr}.${extension}`;
}

// Generate sequential commit message
function generateCommitMessage() {
    return `BWM XMD URLS ✅ ${commitCounter++}`;
}

// Upload file to GitHub and return URL
async function uploadToGitHub(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error("File does not exist");
    }

    try {
        const fileExtension = path.extname(filePath).substring(1);
        const fileName = generateRandomName(fileExtension);
        const commitMessage = generateCommitMessage();
        
        // Read file content as base64
        const fileContent = await fs.readFile(filePath);
        const contentBase64 = fileContent.toString('base64');

        const url = `https://api.github.com/repos/${username}/${repo}/contents/${fileName}`;
        const headers = {
            "Authorization": `token ${token}`,
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json"
        };

        // Check if file exists to get SHA
        let sha = null;
        try {
            const getResponse = await axios.get(url, { headers });
            if (getResponse.status === 200) {
                sha = getResponse.data.sha;
            }
        } catch (e) { /* Ignore if file doesn't exist */ }

        // Upload file
        const body = {
            message: commitMessage,
            content: contentBase64,
            sha: sha
        };

        const response = await axios.put(url, body, { headers });
        
        if (response.status === 200 || response.status === 201) {
            return `${baseUrl}/${fileName}`;
        } else {
            throw new Error("Upload failed");
        }
    } catch (err) {
        throw new Error("Upload Error: " + err.message);
    }
}

// Command logic
adams({ nomCom: "url", categorie: "General", reaction: "🌐" }, async (origineMessage, zk, commandeOptions) => {
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
                repondre("🚨 The video is too large. Please send a smaller one.");
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

        // Upload to GitHub and get URL
        const fileUrl = await uploadToGitHub(mediaPath);
        fs.unlinkSync(mediaPath); // Cleanup after upload

        // Reply with the correct type
        switch (mediaType) {
            case "image":
                repondre(`🖼 Image URL:\n${fileUrl}`);
                break;
            case "video":
                repondre(`🎬 Video URL:\n${fileUrl}`);
                break;
            case "audio":
                repondre(`🔉 Audio URL (MP3):\n${fileUrl}`);
                break;
            case "document":
                repondre(`📃 Document URL:\n${fileUrl}`);
                break;
            default:
                repondre(`📎 File URL:\n${fileUrl}`);
                break;
        }
    } catch (error) {
        console.error("Error in url command:", error);
        if (mediaPath && fs.existsSync(mediaPath)) {
            fs.unlinkSync(mediaPath);
        }
        repondre("❌ Error processing media. Please try again.");
    }
});



/*
const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const fs = require("fs-extra");
const { Catbox } = require("node-catbox");
const path = require("path");

const catbox = new Catbox();

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

// Upload file to Catbox and return URL without https://
async function uploadToCatbox(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error("File does not exist");
    }

    try {
        const response = await catbox.uploadFile({ path: filePath });
        // Remove https:// from the URL if present
        return response ? response.replace(/^https?:\/\//, '') : "Upload failed";
    } catch (err) {
        throw new Error("Upload Error: " + err);
    }
}

// Command logic
adams({ nomCom: "url", categorie: "General", reaction: "🌐" }, async (origineMessage, zk, commandeOptions) => {
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
                repondre("🚨 The video is too large. Please send a smaller one.");
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

        // Upload and get URL without https://
        const catboxUrl = await uploadToCatbox(mediaPath);
        fs.unlinkSync(mediaPath); // Cleanup after upload

        // Reply with the correct type
        switch (mediaType) {
            case "image":
                repondre(`🖼 Image URL:\n${catboxUrl}`);
                break;
            case "video":
                repondre(`🎬 Video URL:\n${catboxUrl}`);
                break;
            case "audio":
                repondre(`🔉 Audio URL (MP3):\n${catboxUrl}`);
                break;
            case "document":
                repondre(`📃 Document URL:\n${catboxUrl}`);
                break;
            default:
                repondre(`📎 File URL:\n${catboxUrl}`);
                break;
        }
    } catch (error) {
        console.error("Error in url command:", error);
        if (mediaPath && fs.existsSync(mediaPath)) {
            fs.unlinkSync(mediaPath);
        }
        repondre("❌ Error processing media. Please try again.");
    }
});
*/
