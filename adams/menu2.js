const { adams } = require("../Ibrahim/adams");
const moment = require("moment-timezone");
const s = require(__dirname + "/../config");
const axios = require("axios");
const readMore = String.fromCharCode(8206).repeat(4000); 
const PREFIX = s.PREFIX;

// Configurable elements from config.js
const {
    BOT: BOT_NAME = 'BWM XMD',
    BOT_URL: MEDIA_URLS = [],
    MENU_TOP_LEFT = "┌─❖",
    MENU_BOT_NAME_LINE = "│ ",
    MENU_BOTTOM_LEFT = "└┬❖",
    MENU_GREETING_LINE = "┌┤ ",
    MENU_DIVIDER = "│└────────┈⳹",
    MENU_USER_LINE = "│🕵️ ",
    MENU_DATE_LINE = "│📅 ",
    MENU_TIME_LINE = "│⏰ ",
    MENU_STATS_LINE = "│⭐ ",
    MENU_BOTTOM_DIVIDER = "└─────────────┈⳹",
    FOOTER = `\n\n©Sir Ibrahim Adams\n\n╭━========================\n┃  ᴛᴏ sᴇᴇ ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅs ᴛᴏɢᴇᴛʜᴇʀ ᴜsᴇ \n┃ *${PREFIX} Cmds*\n┃ *${PREFIX} Help*\n┃ *${PREFIX} list*\n┃ *${PREFIX} Commands* \n╰━========================\n\n*For business use this*\nbusiness.bwmxmd.online\n\n®2025 ʙᴡᴍ xᴍᴅ 🔥`,
    WEB = 'ibrahimadams.site',
    GURL = 'whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y'
} = s;

// Get random media from config (supports both images and videos)
const randomMedia = () => {
    if (MEDIA_URLS.length === 0) return null;
    const url = MEDIA_URLS[Math.floor(Math.random() * MEDIA_URLS.length)].trim();
    return url.startsWith('http') ? url : null;
};

// Audio files
const githubRawBaseUrl = "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic";
const audioFiles = Array.from({ length: 100 }, (_, i) => `sound${i + 1}.mp3`);
const getRandomAudio = () => audioFiles[Math.floor(Math.random() * audioFiles.length)];

// Command categories
const categories = {
    "1. 🤖 AI MENU": ["AI", "TTS", "NEWS"],
    "2. ⚽ SPORTS MENU": ["FOOTBALL", "GAMES"],
    "3. 📥 DOWNLOAD MENU": ["NEWS", "SEARCH", "IMAGES", "DOWNLOAD"],
    "4. 🛠️ HEROKU MENU": ["CONTROL", "STICKCMD", "TOOLS"],
    "5. 💬 CONVERSATION MENU": ["CONVERSION", "LOGO", "MEDIA", "WEEB", "SCREENSHOTS", "IMG", "AUDIO-EDIT", "MPESA"],
    "6. 😂 FUN MENU": ["HENTAI", "FUN", "REACTION"],
    "7. 🌍 GENERAL MENU": ["GENERAL", "MODS", "UTILITY", "MEDIA", "TRADE"],
    "8. 👨‍👨‍👦‍👦 GROUP MENU": ["GROUP"],
    "9. 💻 BOT_INFO MENU": ["GITHUB", "USER", "PAIR", "NEW"],
    "10. 🔞 ADULT MENU": ["XVIDEO"]
};

// GitHub repo stats
const fetchGitHubStats = async () => {
    try {
        const owner = "ibrahimadams254";
        const repo = "BWM-XMD-QUANTUM";
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
                'User-Agent': 'BWM-XMD-Bot'
            }
        });
        const forks = response.data.forks_count || 0;
        const stars = response.data.stargazers_count || 0;
        return (forks * 2) + (stars * 2);
    } catch (error) {
        console.error("Error fetching GitHub stats:", error.message);
        return Math.floor(Math.random() * 1000) + 500;
    }
};

adams({ nomCom: "menu", categorie: "General" }, async (dest, zk, commandeOptions) => {
    const contactName = commandeOptions?.ms?.pushName || "Unknown Contact";
    const sender = commandeOptions?.sender || (commandeOptions?.ms?.key?.remoteJid || "").replace(/@.+/, '');
    let { ms, repondre } = commandeOptions;
    let { cm } = require(__dirname + "/../Ibrahim/adams");

    // Contact message for quoted replies
    const contactMsg = {
        key: { fromMe: false, participant: `0@s.whatsapp.net`, remoteJid: 'status@broadcast' },
        message: {
            contactMessage: {
                displayName: contactName,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;a,;;;\nFN:${contactName}\nitem1.TEL;waid=${sender}:${sender}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
            },
        },
    };

    // Store commands properly
    const commandList = {};
    cm.forEach((com) => {
        const categoryUpper = com.categorie.toUpperCase();
        if (!commandList[categoryUpper]) commandList[categoryUpper] = [];
        commandList[categoryUpper].push(`• ${com.nomCom}`);
    });

    // Get time and date
    moment.tz.setDefault(s.TZ || "Africa/Nairobi");
    const date = moment().format("DD/MM/YYYY");
    const time = moment().format("HH:mm:ss");

    // Get GitHub stats
    const githubStats = await fetchGitHubStats();

    // Dynamic greeting
    const hour = moment().hour();
    let greeting = "🌙 Good Night 😴";
    if (hour >= 5 && hour < 12) greeting = "🌅 Good Morning 🤗";
    else if (hour >= 12 && hour < 18) greeting = "☀️ Good Afternoon 😊";
    else if (hour >= 18 && hour < 22) greeting = "🌆 Good Evening 🤠";

    // Context info with mentionedJid and forwarding details
    const contextInfo = {
    mentionedJid: [sender ? `${sender}@s.whatsapp.net` : undefined].filter(Boolean),
    forwardingScore: 1, // Shows as "Forwarded" not "Forwarded many times"
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: "120363285388090068@newsletter",
        newsletterName: `${contactName}`, // Uses sender's name
        serverMessageId: Math.floor(100000 + Math.random() * 900000),
    },
};

    // Create numbered menu options
    const menuOptions = `
*📋 MENU OPTIONS*

*1.* 🌐 OUR WEB

*2.* 🎵 RANDOM SONG

*3.* 📢 UPDATES

*4.* 🤖 AI MENU

*5.* ⚽ SPORTS MENU

*6.* 📥 DOWNLOAD MENU

*7.* 🛠️ HEROKU MENU

*8.* 💬 CONVERSATION MENU

*9.* 😂 FUN MENU

*10.* 🌍 GENERAL MENU

*11.* 👨‍👨‍👦‍👦 GROUP MENU

*12.* 💻 BOT_INFO MENU

*13.* 🔞 ADULT MENU

_Reply with any number above to access that menu section_`;

    // Build menu header using configurable symbols
    const menuHeader = `
${MENU_TOP_LEFT}
${MENU_BOT_NAME_LINE}${BOT_NAME}    
${MENU_BOTTOM_LEFT}  
${MENU_GREETING_LINE}${greeting}
${MENU_DIVIDER}  
${MENU_USER_LINE}ᴜsᴇʀ ɴᴀᴍᴇ: ${contactName}
${MENU_DATE_LINE}ᴅᴀᴛᴇ: ${date}
${MENU_TIME_LINE}ᴛɪᴍᴇ: ${time}       
${MENU_STATS_LINE}ᴜsᴇʀs: ${githubStats}       
${MENU_BOTTOM_DIVIDER}`;

    // Select random media (image or video)
    const selectedMedia = randomMedia();
    let mediaMessage = {
        text: `${menuHeader}\n\n${readMore}\n${menuOptions}\n${FOOTER}`,
        contextInfo: contextInfo
    };

    if (selectedMedia) {
        try {
            if (selectedMedia.match(/\.(mp4|gif)$/i)) {
                mediaMessage = {
                    video: { url: selectedMedia },
                    gifPlayback: true,
                    caption: `${menuHeader}\n\n${readMore}\n${menuOptions}\n${FOOTER}`,
                    contextInfo: contextInfo
                };
            } else if (selectedMedia.match(/\.(jpg|jpeg|png)$/i)) {
                mediaMessage = {
                    image: { url: selectedMedia },
                    caption: `${menuHeader}\n\n${readMore}\n${menuOptions}\n${FOOTER}`,
                    contextInfo: contextInfo
                };
            }
        } catch (error) {
            console.error("Error processing media:", error);
        }
    }

    // Send main menu
    const sentMessage = await zk.sendMessage(dest, mediaMessage, { quoted: contactMsg });

    // Handle replies to this message
    const cleanup = () => {
        zk.ev.off("messages.upsert", handleReply);
    };

    const handleReply = async (update) => {
        const message = update.messages[0];
        if (!message?.message) return;

        // Check if this is a reply to our menu message
        const isReply = message.message.extendedTextMessage?.contextInfo?.stanzaId === sentMessage.key.id;
        if (!isReply) return;

        const responseText = message.message.extendedTextMessage?.text?.trim() || 
                           message.message.conversation?.trim();
        
        if (!responseText) return;

        const selectedIndex = parseInt(responseText);
        const dest = message.key.remoteJid;

        try {
            switch (selectedIndex) {
                case 1:
                    // WEB APP
                    await zk.sendMessage(dest, {
                        text: `🌐 *${BOT_NAME} WEB APP*\n\nVisit our official website here:\n${WEB}\n\n${FOOTER}`,
                        contextInfo: contextInfo
                    }, { quoted: message });
                    break;

                case 2:
                    // RANDOM SONG
                    const randomAudio = getRandomAudio();
                    await zk.sendMessage(dest, {
                        audio: { url: `${githubRawBaseUrl}/${randomAudio}` },
                        mimetype: 'audio/mp4',
                        ptt: true,
                        contextInfo: contextInfo
                    }, { quoted: message });
                    break;

                case 3:
                    // UPDATES
                    await zk.sendMessage(dest, {
                        text: `📢 *${BOT_NAME} UPDATES CHANNEL*\n\nJoin our official updates channel:\n${GURL}\n\n${FOOTER}`,
                        contextInfo: contextInfo
                    }, { quoted: message });
                    break;

                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12:
                case 13:
                    // Category menus (4-13)
                    const catIndex = selectedIndex - 4;
                    const categoryNames = Object.keys(categories);
                    const categoryName = categoryNames[catIndex];
                    
                    if (categoryName) {
                        const catKeys = categories[categoryName] || [];
                        let commands = [];
                        catKeys.forEach(key => {
                            if (commandList[key]) {
                                commands = commands.concat(commandList[key]);
                            }
                        });

                        if (commands.length > 0) {
                            await zk.sendMessage(dest, {
                                text: `📋 *${categoryName} COMMANDS*\n\n${commands.join('\n')}\n\n${FOOTER}`,
                                contextInfo: contextInfo
                            }, { quoted: message });
                        } else {
                            await zk.sendMessage(dest, {
                                text: `📋 *${categoryName} COMMANDS*\n\nNo commands available in this category\n\n${FOOTER}`,
                                contextInfo: contextInfo
                            }, { quoted: message });
                        }
                    }
                    break;

                default:
                    await zk.sendMessage(dest, {
                        text: `*❌ Invalid number. Please select between 1-13.*\n\n${FOOTER}`,
                        contextInfo: contextInfo
                    }, { quoted: message });
                    break;
            }
        } catch (error) {
            console.error("Menu reply error:", error);
            await zk.sendMessage(dest, {
                text: `*❌ An error occurred. Please try again.*\n\n${FOOTER}`,
                contextInfo: contextInfo
            }, { quoted: message });
        }

        // Clean up after 5 minutes
        setTimeout(cleanup, 300000);
    };

    // Listen for replies
    zk.ev.on("messages.upsert", handleReply);

    // Auto cleanup after 5 minutes
    setTimeout(cleanup, 300000);
});
