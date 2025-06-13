const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const ytSearch = require("yt-search");

// Shared API configurations
const apiKey = 'gifted_api_6kuv56877d';

const audioApis = [
  `https://api.giftedtech.web.id/api/download/ytmp3?apikey=${apiKey}&url=`,
  `https://apis.davidcyriltech.web.id/download/ytmp3?url=${encodedUrl}&url=`,
  `https://api.giftedtech.web.id/api/download/ytmusic?apikey=${apiKey}&url=`,
  `https://apis.davidcyriltech.web.id/youtube/mp3?url=${encodedUrl}&url=`,
  `https://api.giftedtech.web.id/api/download/ytmp3?apikey=${apiKey}&url=`
];

const videoApis = [
  `https://api.giftedtech.web.id/api/download/ytmp4?apikey=${apiKey}&url=`,
  `https://apis.davidcyriltech.web.id/download/ytmp4?url=${encodedUrl}&url=`,
  `https://api.giftedtech.web.id/api/download/ytv?apikey=${apiKey}&url=`,
  `https://apis.davidcyriltech.web.id/youtube/mp4?url=${encodedUrl}&url=`,
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

*1.* 🎵 Download Audio (Fast)
*2.* 🎥 Download Video (Fast)  
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
                            await zk.sendMessage(session.dest, { 
                                text: "⚡ Getting your audio...", 
                                mentions: [userJid] 
                            }, { quoted: message });
                            await handleDownload('audio', session.videoUrl, session.dest, zk, message);
                            break;

                        case 2:
                            await zk.sendMessage(session.dest, { 
                                text: "⚡ Getting your video...", 
                                mentions: [userJid] 
                            }, { quoted: message });
                            await handleDownload('video', session.videoUrl, session.dest, zk, message);
                            break;

                        case 3:
                            await zk.sendMessage(session.dest, {
                                text: "📢 *Our Official Channel*\n\nwhatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
                                mentions: [userJid]
                            }, { quoted: message });
                            break;

                        default:
                            await zk.sendMessage(session.dest, {
                                text: "*❌ Invalid option. Reply with 1, 2, or 3*",
                                mentions: [userJid]
                            }, { quoted: message });
                            break;
                    }
                } catch (error) {
                    console.error("Error:", error);
                    await zk.sendMessage(session.dest, { 
                        text: "❌ Failed to process. Try again later.", 
                        mentions: [userJid] 
                    }, { quoted: message });
                }
            };

            zk.ev.on("messages.upsert", zk.downloadHandler);
        }

        // Clean up old sessions
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        for (const [sessionId, session] of downloadSessions.entries()) {
            if (session.createdAt < oneHourAgo) {
                downloadSessions.delete(sessionId);
            }
        }

    } catch (error) {
        console.error("Search error:", error);
        return repondre("Error searching. Try again.");
    }
});

// Optimized download function for fast media sending
async function handleDownload(type, videoUrl, dest, zk, originalMsg) {
    try {
        const apis = type === 'audio' ? audioApis : videoApis;
        const encodedUrl = encodeURIComponent(videoUrl);
        
        let downloadUrl = null;
        
        // Try each API until successful
        for (const api of apis) {
            try {
                const response = await axios.get(`${api}${encodedUrl}`, { timeout: 8000 });
                
                // Check for direct URL in response
                if (response.data?.url) {
                    downloadUrl = response.data.url;
                    break;
                }
                if (response.data?.result?.url) {
                    downloadUrl = response.data.result.url;
                    break;
                }
                if (type === 'audio' && response.data?.audio_url) {
                    downloadUrl = response.data.audio_url;
                    break;
                }
                if (type === 'video' && response.data?.video_url) {
                    downloadUrl = response.data.video_url;
                    break;
                }
                if (response.data?.download_url) {
                    downloadUrl = response.data.download_url;
                    break;
                }
            } catch (e) {
                console.log(`API ${api} failed, trying next...`);
                continue;
            }
        }

        if (!downloadUrl) {
            return await zk.sendMessage(dest, { 
                text: `❌ Couldn't get download link. Try again later.` 
            }, { quoted: originalMsg });
        }

        // Send media directly from URL
        if (type === 'audio') {
            await zk.sendMessage(dest, {
                audio: { url: downloadUrl },
                mimetype: 'audio/mpeg',
                ptt: false,
                contextInfo: {
                    externalAdReply: {
                        title: "Audio Download",
                        body: "Here's your audio",
                        mediaType: 2,
                        thumbnailUrl: "https://files.catbox.moe/sd49da.jpg",
                        mediaUrl: downloadUrl,
                        sourceUrl: downloadUrl
                    }
                }
            }, { quoted: originalMsg });
        } else {
            await zk.sendMessage(dest, {
                video: { url: downloadUrl },
                mimetype: 'video/mp4',
                caption: "Here's your video",
                contextInfo: {
                    externalAdReply: {
                        title: "Video Download",
                        body: "Here's your video",
                        mediaType: 2,
                        thumbnailUrl: "https://files.catbox.moe/sd49da.jpg",
                        mediaUrl: downloadUrl,
                        sourceUrl: downloadUrl
                    }
                }
          }, { quoted: hhhhhhoriginalMsg });
        }

    } catch (error) {
        console.error("Download error:", error);
        await zk.sendMessage(dest, { 
            text: `❌ Failed to send ${type}. The file might be too large.` 
        }, { quoted: originalMsg });
    }
}















                                                               











/*

const axios = require("axios");
const ytSearch = require("yt-search");

// Shared API configurations
const apiKey = 'gifted_api_6kuv56877d';

const audioApis = [
  `https://api.giftedtech.web.id/api/download/ytmp3?apikey=${apiKey}&url=${encodedUrl}`,
  `https://apis.davidcyriltech.web.id/download/ytmp3?url=${encodedUrl}`,
  `https://api.giftedtech.web.id/api/download/ytmusic?apikey=${apiKey}&url=${encodedUrl}`,
  `https://apis.davidcyriltech.web.id/youtube/mp3?url=${encodedUrl}`,
  `https://api.giftedtech.web.id/api/download/ytmp3?apikey=${apiKey}&url=${encodedUrl}`
];
  `https://api.giftedtech.web.id/api/download/ytmp4?apikey=${apiKey}&url=${encodedUrl}`,
  `https://apis.davidcyriltech.web.id/download/ytmp4?url=${encodedUrl}`,
  `https://api.giftedtech.web.id/api/download/ytv?apikey=${apiKey}&url=${encodedUrl}`,
  `https://apis.davidcyriltech.web.id/youtube/mp4?url=${encodedUrl}`,
  `https://api.giftedtech.web.id/api/download/ytvideo?apikey=${apiKey}&url=${encodedUrl}`
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

*1.* 🎵 Download Audio (Fast)
*2.* 🎥 Download Video (Fast)  
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
                            await zk.sendMessage(session.dest, { 
                                text: "⚡ Getting your audio...", 
                                mentions: [userJid] 
                            }, { quoted: message });
                            await handleDownload('audio', session.videoUrl, session.dest, zk, message);
                            break;

                        case 2:
                            await zk.sendMessage(session.dest, { 
                                text: "⚡ Getting your video...", 
                                mentions: [userJid] 
                            }, { quoted: message });
                            await handleDownload('video', session.videoUrl, session.dest, zk, message);
                            break;

                        case 3:
                            await zk.sendMessage(session.dest, {
                                text: "📢 *Our Official Channel*\n\nwhatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
                                mentions: [userJid]
                            }, { quoted: message });
                            break;

                        default:
                            await zk.sendMessage(session.dest, {
                                text: "*❌ Invalid option. Reply with 1, 2, or 3*",
                                mentions: [userJid]
                            }, { quoted: message });
                            break;
                    }
                } catch (error) {
                    console.error("Error:", error);
                    await zk.sendMessage(session.dest, { 
                        text: "❌ Failed to process. Try again later.", 
                        mentions: [userJid] 
                    }, { quoted: message });
                }
            };

            zk.ev.on("messages.upsert", zk.downloadHandler);
        }

        // Clean up old sessions
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        for (const [sessionId, session] of downloadSessions.entries()) {
            if (session.createdAt < oneHourAgo) {
                downloadSessions.delete(sessionId);
            }
        }

    } catch (error) {
        console.error("Search error:", error);
        return repondre("Error searching. Try again.");
    }
});

// Optimized download function to handle API responses with audio_url/video_url
async function handleDownload(type, videoUrl, dest, zk, originalMsg) {
    try {
        const apis = type === 'audio' ? audioApis : videoApis;
        const encodedUrl = encodeURIComponent(videoUrl);
        
        let mediaUrl = null;
        
        // Try each API until successful
        for (const api of apis) {
            try {
                const response = await axios.get(`${api}${encodedUrl}`, { timeout: 8000 });
                
                // Check for different response structures
                if (response.data) {
                    // For GiftedTech API structure
                    if (response.data.result) {
                        if (type === 'audio' && response.data.result.audio_url) {
                            mediaUrl = response.data.result.audio_url;
                            break;
                        }
                        if (type === 'video' && response.data.result.video_url) {
                            mediaUrl = response.data.result.video_url;
                            break;
                        }
                        if (response.data.result.download_url) {
                            mediaUrl = response.data.result.download_url;
                            break;
                        }
                        if (response.data.result.url) {
                            mediaUrl = response.data.result.url;
                            break;
                        }
                    }
                    
                    // For other API structures
                    if (type === 'audio' && response.data.audio_url) {
                        mediaUrl = response.data.audio_url;
                        break;
                    }
                    if (type === 'video' && response.data.video_url) {
                        mediaUrl = response.data.video_url;
                        break;
                    }
                    if (response.data.download_url) {
                        mediaUrl = response.data.download_url;
                        break;
                    }
                    if (response.data.url) {
                        mediaUrl = response.data.url;
                        break;
                    }
                }
            } catch (e) {
                console.log(`API ${api} failed, trying next...`);
                continue;
            }
        }

        if (!mediaUrl) {
            return await zk.sendMessage(dest, { 
                text: `❌ Couldn't get download link. Try again later.` 
            }, { quoted: originalMsg });
        }

        // Send media directly from URL
        if (type === 'audio') {
            await zk.sendMessage(dest, {
                audio: { url: mediaUrl },
                mimetype: 'audio/mpeg',
                ptt: false,
                contextInfo: {
                    externalAdReply: {
                        title: "Audio Download",
                        body: "Here's your audio",
                        mediaType: 2,
                        thumbnailUrl: "https://files.catbox.moe/sd49da.jpg",
                        mediaUrl: "go.bwmxmd.online",
                        sourceUrl: "go.bwmxmd.online"
                    }
                }
            }, { quoted: originalMsg });
        } else {
            await zk.sendMessage(dest, {
                video: { url: mediaUrl },
                mimetype: 'video/mp4',
                caption: "Here's your video",
                contextInfo: {
                    externalAdReply: {
                        title: "Video Download",
                        body: "Here's your video",
                        mediaType: 2,
                        thumbnailUrl: "https://files.catbox.moe/sd49da.jpg",
                        mediaUrl: "go.bwmxmd.online",
                        sourceUrl: "go.bwmxmd.online"
                    }
                }
            }, { quoted: originalMsg });
        }

    } catch (error) {
        console.error("Download error:", error);
        await zk.sendMessage(dest, { 
            text: `❌ Failed to send ${type}. The file might be too large or the link expired.` 
        }, { quoted: originalMsg });
    }
}*/
