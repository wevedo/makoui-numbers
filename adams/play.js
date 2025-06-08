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

        // Create buttons
        const buttons = [
            {
                buttonId: `play_audio ${videoUrl}`,
                buttonText: { displayText: "🎵 Download Audio" },
                type: 1
            },
            {
                buttonId: `play_video ${videoUrl}`,
                buttonText: { displayText: "🎥 Download Video" },
                type: 1
            },
            {
                buttonId: "play_channel",
                buttonText: { displayText: "📢 Our Channel" },
                type: 1
            }
        ];

        // Send result with buttons
        const sentMessage = await zk.sendMessage(dest, {
            image: { url: video.thumbnail },
            caption: `*${video.title}*\n\n🎬 *Channel:* ${video.author.name}\n⏱️ *Duration:* ${video.timestamp}\n👀 *Views:* ${video.views}\n\n*Select download option:*`,
            footer: "BWM XMD Downloader",
            buttons: buttons,
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

        // Define the button handler function
        const buttonHandler = async (update) => {
            const message = update.messages[0];
            if (!message.message || !message.message.buttonsResponseMessage) return;

            // Check if this is a response to our message
            if (message.message.buttonsResponseMessage.contextInfo &&
                message.message.buttonsResponseMessage.contextInfo.stanzaId === sentMessage.key.id) {
                
                const buttonId = message.message.buttonsResponseMessage.selectedButtonId;
                const userJid = message.key.participant || message.key.remoteJid;

                // Auto-reply to acknowledge the button tap
                await zk.sendMessage(dest, { 
                    text: "🔄 Processing your request...",
                    mentions: [userJid]
                }, { quoted: message });

                try {
                    if (buttonId.startsWith('play_audio')) {
                        const videoUrl = buttonId.split(' ').slice(1).join(' ');
                        await handleDownload('audio', videoUrl, dest, zk, message);
                    } 
                    else if (buttonId.startsWith('play_video')) {
                        const videoUrl = buttonId.split(' ').slice(1).join(' ');
                        await handleDownload('video', videoUrl, dest, zk, message);
                    }
                    else if (buttonId === 'play_channel') {
                        await zk.sendMessage(dest, {
                            text: "📢 *Our Official Channel*\n\nJoin our WhatsApp channel for updates:\nwhatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y\n\nYugo app by bwm xmd:\ngo.bwmxmd.online"
                        }, { quoted: message });
                    }
                } catch (error) {
                    console.error("Button handler error:", error);
                    await zk.sendMessage(dest, { 
                        text: "❌ Error processing your request. Please try again.",
                        mentions: [userJid]
                    }, { quoted: message });
                }
            }
        };

        // Add the event listener
        zk.ev.on("messages.upsert", buttonHandler);

        // Remove listener after 5 minutes to prevent memory leaks
        setTimeout(() => {
            zk.ev.off("messages.upsert", buttonHandler);
        }, 300000);

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
