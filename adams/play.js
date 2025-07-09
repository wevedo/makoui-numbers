const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const ytSearch = require("yt-search");

// Shared API configurations
const apiKey = 'gifted_api_6kuv56877d';

const audioApis = [
    // David Cyril APIs first for faster MP3
    `https://apis.davidcyriltech.my.id/download/ytmp3?url=`,
    `https://apis.davidcyriltech.my.id/youtube/mp3?url=`,
    // GiftedTech APIs
    `https://api.giftedtech.web.id/api/download/ytmp3?apikey=${apiKey}&url=`,
    `https://api.giftedtech.web.id/api/download/ytmusic?apikey=${apiKey}&url=`,
    // Other APIs
    `https://api.giftedtech.web.id/api/download/ytdlv2?apikey=${apiKey}&url=`,
    `https://api.giftedtech.web.id/api/download/ytdl?apikey=${apiKey}&url=`,
    `https://api.giftedtech.web.id/api/download/ytaudio?apikey=${apiKey}&format=128kbps&url=`,
    `https://api.giftedtech.web.id/api/download/yta?apikey=${apiKey}&url=`
];

const videoApis = [
    `https://api.giftedtech.web.id/api/download/ytmp4?apikey=${apiKey}&url=`,
    `https://apis.davidcyriltech.my.id/download/ytmp4?url=`,
    `https://api.giftedtech.web.id/api/download/ytv?apikey=${apiKey}&url=`,
    `https://apis.davidcyriltech.my.id/youtube/mp4?url=`,
    `https://api.giftedtech.web.id/api/download/ytvideo?apikey=${apiKey}&url=`
];

// Store active download sessions
const downloadSessions = new Map();

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

_Reply with any number above to proceed_
_This menu stays active - you can use it multiple times_`;

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

        // Store session data
        const sessionId = sentMessage.key.id;
        downloadSessions.set(sessionId, {
            videoUrl: videoUrl,
            videoTitle: video.title,
            videoThumbnail: video.thumbnail,
            dest: dest,
            createdAt: Date.now()
        });

        // Set up persistent event listener if not already exists
        if (!zk.downloadHandler) {
            zk.downloadHandler = async (update) => {
                const message = update.messages[0];
                if (!message?.message) return;

                // Check if this is a reply to any download session
                const stanzaId = message.message.extendedTextMessage?.contextInfo?.stanzaId;
                if (!stanzaId || !downloadSessions.has(stanzaId)) return;

                const responseText = message.message.extendedTextMessage?.text?.trim() || 
                                   message.message.conversation?.trim();
                
                if (!responseText) return;

                const selectedOption = parseInt(responseText);
                const userJid = message.key.participant || message.key.remoteJid;
                const session = downloadSessions.get(stanzaId);

                try {
                    switch (selectedOption) {
                        case 1:
                            // Download Audio
                            await zk.sendMessage(session.dest, { 
                                text: "🔄 Just amin we download your audio...",
                                mentions: [userJid]
                            }, { quoted: message });
                            
                            await handleDownload('audio', session.videoUrl, session.dest, zk, message);
                            break;

                        case 2:
                            // Download Video
                            await zk.sendMessage(session.dest, { 
                                text: "🔄 Just amin we download your video...",
                                mentions: [userJid]
                            }, { quoted: message });
                            
                            await handleDownload('video', session.videoUrl, session.dest, zk, message);
                            break;

                        case 3:
                            // Our Channel
                            await zk.sendMessage(session.dest, {
                                text: "📢 *Our Official Channel*\n\nJoin our WhatsApp channel for updates:\nwhatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y\n\nYugo app by bwm xmd:\ngo.bwmxmd.online",
                                mentions: [userJid]
                            }, { quoted: message });
                            break;

                        default:
                            await zk.sendMessage(session.dest, {
                                text: "*❌ Invalid option. Please reply with 1, 2, or 3.*\n\n*Available options:*\n*1.* 🎵 Download Audio\n*2.* 🎥 Download Video\n*3.* 📢 Our Channel",
                                mentions: [userJid]
                            }, { quoted: message });
                            break;
                    }
                } catch (error) {
                    console.error("Download reply handler error:", error);
                    await zk.sendMessage(session.dest, { 
                        text: "❌ Error processing your request. Please try again.",
                        mentions: [userJid]
                    }, { quoted: message });
                }
            };

            // Add the persistent event listener
            zk.ev.on("messages.upsert", zk.downloadHandler);
        }

        // Clean up old sessions (older than 1 hour) to prevent memory leaks
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        for (const [sessionId, session] of downloadSessions.entries()) {
            if (session.createdAt < oneHourAgo) {
                downloadSessions.delete(sessionId);
            }
        }

    } catch (error) {
        console.error("Search error:", error);
        return repondre("Error searching for the video.");
    }
});

// EXACT SAME DOWNLOAD FUNCTION FROM YOUR WORKING BUTTON CODE
async function handleDownload(type, videoUrl, dest, zk, originalMsg) {
    try {
        const apis = type === 'audio' ? audioApis : videoApis;
        const encodedUrl = encodeURIComponent(videoUrl);
        
        let downloadUrl = null;
        
        // Try each API until successful
        for (const api of apis) {
            try {
                const response = await axios.get(`${api}${encodedUrl}`);
           if (
    response.data?.result?.download_url || 
    response.data?.url || 
    response.data?.audio_url || 
    response.data?.video_url
) {
    downloadUrl = 
        response.data.result?.download_url || 
        response.data.url || 
        response.data.audio_url || 
        response.data.video_url;
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

        // Send the downloaded file - EXACT SAME AS YOUR BUTTON CODE
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

