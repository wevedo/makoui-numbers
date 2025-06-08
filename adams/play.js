const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const ytSearch = require("yt-search");

// Shared API configurations
const apiKey = 'gifted_api_6kuv56877d';
const audioApis = [
    `https://api.giftedtech.my.id/api/download/ytmusic?apikey=${apiKey}&url=`,
    `https://apis.davidcyriltech.my.id/download/ytmp3?url=`,
    `https://apis.davidcyriltech.my.id/youtube/mp3?url=`
];

const videoApis = [
    `https://api.giftedtech.my.id/api/download/ytmp4?apikey=${apiKey}&url=`,
    `https://apis.davidcyriltech.my.id/download/ytmp4?url=`,
    `https://api.giftedtech.my.id/api/download/ytv?apikey=${apiKey}&url=`,
    `https://apis.davidcyriltech.my.id/youtube/mp4?url=`,
    `https://api.giftedtech.my.id/api/download/ytvideo?apikey=${apiKey}&url=`
];

adams({
    nomCom: "play",
    aliases: ["song", "video", "music", "yt"],
    categorie: "Download",
    reaction: "🎵"
}, async (dest, zk, commandOptions) => {
    const { arg, ms, repondre } = commandOptions;

    if (!arg[0]) {
        return repondre("Please provide a song/video name.");
    }

    const query = arg.join(" ");

    try {
        // Search YouTube
        const searchResults = await ytSearch(query);
        if (!searchResults.videos.length) {
            return repondre("No results found for your search.");
        }

        const video = searchResults.videos[0];
        const videoUrl = video.url;

        // Create numbered options
        const downloadOptions = `
*📥 DOWNLOAD OPTIONS - Reply with number:*

*1.* 🎵 Download Audio
*2.* 🎥 Download Video  
*3.* 📢 Our Channel

_Reply with any number above to proceed_`;

        // Send result with numbered options
        const sentMessage = await zk.sendMessage(dest, {
            image: { url: video.thumbnail },
            caption: `*${video.title}*\n\n🎬 *Channel:* ${video.author.name}\n⏱️ *Duration:* ${video.timestamp}\n👀 *Views:* ${video.views}\n\n${downloadOptions}`,
            contextInfo: {
                externalAdReply: {
                    title: video.title,
                    body: "Available on YouTube",
                    mediaType: 2,
                    thumbnailUrl: video.thumbnail,
                    mediaUrl: video.url,
                    sourceUrl: video.url
                }
            }
        }, { quoted: ms });

        // Handle number replies
        const cleanup = () => {
            zk.ev.off("messages.upsert", handleReply);
        };

        const handleReply = async (update) => {
            const message = update.messages[0];
            if (!message?.message) return;

            // Check if this is a reply to our message
            const isReply = message.message.extendedTextMessage?.contextInfo?.stanzaId === sentMessage.key.id;
            if (!isReply) return;

            const responseText = message.message.extendedTextMessage?.text?.trim() || 
                               message.message.conversation?.trim();
            
            if (!responseText) return;

            const selectedOption = parseInt(responseText);
            const userJid = message.key.participant || message.key.remoteJid;

            try {
                switch (selectedOption) {
                    case 1:
                        // Download Audio
                        await zk.sendMessage(dest, { 
                            text: "🔄 Processing audio download...",
                            mentions: [userJid]
                        }, { quoted: message });
                        
                        await handleDownload('audio', videoUrl, dest, zk, message);
                        cleanup();
                        break;

                    case 2:
                        // Download Video
                        await zk.sendMessage(dest, { 
                            text: "🔄 Processing video download...",
                            mentions: [userJid]
                        }, { quoted: message });
                        
                        await handleDownload('video', videoUrl, dest, zk, message);
                        cleanup();
                        break;

                    case 3:
                        // Our Channel
                        await zk.sendMessage(dest, {
                            text: "📢 *Our Official Channel*\n\nJoin our WhatsApp channel for updates:\nwhatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y\n\nYugo app by bwm xmd:\ngo.bwmxmd.online",
                            mentions: [userJid]
                        }, { quoted: message });
                        cleanup();
                        break;

                    default:
                        await zk.sendMessage(dest, {
                            text: "*❌ Invalid option. Please reply with 1, 2, or 3.*",
                            mentions: [userJid]
                        }, { quoted: message });
                        break;
                }
            } catch (error) {
                console.error("Reply handler error:", error);
                await zk.sendMessage(dest, { 
                    text: "❌ Error processing your request. Please try again.",
                    mentions: [userJid]
                }, { quoted: message });
            }
        };

        // Listen for replies
        zk.ev.on("messages.upsert", handleReply);

        // Auto cleanup after 5 minutes
        setTimeout(cleanup, 300000);

    } catch (error) {
        console.error("Search error:", error);
        return repondre("Error searching for the video.");
    }
});

async function handleDownload(type, videoUrl, dest, zk, originalMsg) {
    try {
        const apis = type === 'audio' ? audioApis : videoApis;
        const encodedUrl = encodeURIComponent(videoUrl);
        
        let downloadUrl = null;
        
        // Try each API until successful
        for (const api of apis) {
            try {
                const response = await axios.get(`${api}${encodedUrl}`);
                if (response.data?.result?.download_url || response.data?.url) {
                    downloadUrl = response.data.result?.download_url || response.data.url;
                    break;
                }
            } catch (e) {
                console.log(`API ${api} failed, trying next...`);
            }
        }

        if (!downloadUrl) {
            return await zk.sendMessage(dest, { 
                text: `❌ Failed to download ${type}. Try again later.` 
            }, { quoted: originalMsg });
        }

        // Send the downloaded file
        if (type === 'audio') {
            const audioResponse = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
            const audioBuffer = Buffer.from(audioResponse.data, 'binary');
            
            await zk.sendMessage(dest, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                contextInfo: {
                    externalAdReply: {
                        title: "Your Audio Download",
                        body: "BWM XMD Downloader",
                        mediaType: 2,
                        thumbnailUrl: "https://files.catbox.moe/sd49da.jpg",
                        mediaUrl: downloadUrl,
                        sourceUrl: downloadUrl
                    }
                }
            }, { quoted: originalMsg });
        } else {
            const videoResponse = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
            const videoBuffer = Buffer.from(videoResponse.data, 'binary');
            
            await zk.sendMessage(dest, {
                video: videoBuffer,
                mimetype: 'video/mp4',
                caption: "Here's your video download",
                contextInfo: {
                    externalAdReply: {
                        title: "Your Video Download",
                        body: "BWM XMD Downloader",
                        mediaType: 2,
                        thumbnailUrl: "https://files.catbox.moe/sd49da.jpg",
                        mediaUrl: downloadUrl,
                        sourceUrl: downloadUrl
                    }
                }
            }, { quoted: originalMsg });
        }

    } catch (error) {
        console.error("Download error:", error);
        await zk.sendMessage(dest, { 
            text: `❌ Error during ${type} download.` 
        }, { quoted: originalMsg });
    }
}
