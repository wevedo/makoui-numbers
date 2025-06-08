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
                                text: `🔄 Processing audio download for: *${session.videoTitle}*`,
                                mentions: [userJid]
                            }, { quoted: message });
                            
                            await handleDownload('audio', session.videoUrl, session.dest, zk, message, session);
                            break;

                        case 2:
                            // Download Video
                            await zk.sendMessage(session.dest, { 
                                text: `🔄 Processing video download for: *${session.videoTitle}*`,
                                mentions: [userJid]
                            }, { quoted: message });
                            
                            await handleDownload('video', session.videoUrl, session.dest, zk, message, session);
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

async function handleDownload(type, videoUrl, dest, zk, originalMsg, session) {
    try {
        const apis = type === 'audio' ? audioApis : videoApis;
        const encodedUrl = encodeURIComponent(videoUrl);
        
        let downloadUrl = null;
        
        // Try each API until successful
        for (const api of apis) {
            try {
                const response = await axios.get(`${api}${encodedUrl}`, { timeout: 15000 });
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
                text: `❌ Failed to download ${type}. Try again later.\n\n_You can still use the menu above to try other options._` 
            }, { quoted: originalMsg });
        }

        // Send the downloaded file
        if (type === 'audio') {
            const audioResponse = await axios.get(downloadUrl, { 
                responseType: 'arraybuffer',
                timeout: 30000 
            });
            const audioBuffer = Buffer.from(audioResponse.data, 'binary');
            
            await zk.sendMessage(dest, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                caption: `🎵 *${session.videoTitle}*\n\n_Menu above is still active for more downloads_`,
                contextInfo: {
                    externalAdReply: {
                        title: session.videoTitle,
                        body: "BWM XMD Audio Download",
                        mediaType: 2,
                        thumbnailUrl: session.videoThumbnail,
                        mediaUrl: downloadUrl,
                        sourceUrl: downloadUrl
                    }
                }
            }, { quoted: originalMsg });
        } else {
            const videoResponse = await axios.get(downloadUrl, { 
                responseType: 'arraybuffer',
                timeout: 60000 
            });
            const videoBuffer = Buffer.from(videoResponse.data, 'binary');
            
            await zk.sendMessage(dest, {
                video: videoBuffer,
                mimetype: 'video/mp4',
                caption: `🎥 *${session.videoTitle}*\n\n_Menu above is still active for more downloads_`,
                contextInfo: {
                    externalAdReply: {
                        title: session.videoTitle,
                        body: "BWM XMD Video Download",
                        mediaType: 2,
                        thumbnailUrl: session.videoThumbnail,
                        mediaUrl: downloadUrl,
                        sourceUrl: downloadUrl
                    }
                }
            }, { quoted: originalMsg });
        }

        // Success message
        await zk.sendMessage(dest, {
            text: `✅ ${type === 'audio' ? 'Audio' : 'Video'} download completed!\n\n_The menu above is still active - you can download the other format or try different options._`
        }, { quoted: originalMsg });

    } catch (error) {
        console.error("Download error:", error);
        await zk.sendMessage(dest, { 
            text: `❌ Error during ${type} download.\n\n_You can try again using the menu above._` 
        }, { quoted: originalMsg });
    }
}
