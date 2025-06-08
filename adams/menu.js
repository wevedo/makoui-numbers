const { adams } = require("../Ibrahim/adams");
const moment = require("moment-timezone");
const s = require(__dirname + "/../config");
const axios = require("axios");
const readMore = String.fromCharCode(8206).repeat(4000); 
const PREFIX = s.PREFIX;

// Menu images
const menuImages = [
    "https://res.cloudinary.com/dptzpfgtm/image/upload/v1748879883/whatsapp_uploads/e3eprzkzxhwfx7pmemr5.jpg",
    "https://res.cloudinary.com/dptzpfgtm/image/upload/v1748879901/whatsapp_uploads/hqagxk84idvf899rhpfj.jpg",
    "https://res.cloudinary.com/dptzpfgtm/image/upload/v1748879921/whatsapp_uploads/bms318aehnllm6sfdgql.jpg"
];
const randomImage = () => menuImages[Math.floor(Math.random() * menuImages.length)];

// Audio files
const githubRawBaseUrl = "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic";
const audioFiles = Array.from({ length: 100 }, (_, i) => `sound${i + 1}.mp3`);
const getRandomAudio = () => audioFiles[Math.floor(Math.random() * audioFiles.length)];

const footer = `\n\n©Sir Ibrahim Adams\n\n╭━========================\n┃  ᴛᴏ sᴇᴇ ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅs ᴛᴏɢᴇᴛʜᴇʀ ᴜsᴇ \n┃ *${PREFIX} Cmds*\n┃ *${PREFIX} Help*\n┃ *${PREFIX} list*\n┃ *${PREFIX} Commands* \n╰━========================\n\n*For business use this*\nbusiness.bwmxmd.online\n\n®2025 ʙᴡᴍ xᴍᴅ 🔥`;

// Command categories
const categories = {
    "🤖 AI MENU": ["AI", "TTS", "NEWS"],
        "⚽ SPORTS MENU": ["FOOTBALL", "GAMES"],
        "📥 DOWNLOAD MENU": ["NEWS", "SEARCH", "IMAGES", "DOWNLOAD"],
        "🛠️ HEROKU MENU": ["CONTROL", "STICKCMD", "TOOLS"],
        "💬 CONVERSATION MENU": ["CONVERSION", "LOGO", "MEDIA", "WEEB", "SCREENSHOTS", "IMG", "AUDIO-EDIT", "MPESA"],
        "😂 FUN MENU": ["HENTAI", "FUN", "REACTION"],
        "🌍 GENERAL MENU": ["GENERAL", "MODS", "UTILITY", "MEDIA", "TRADE"],
        "👨‍👨‍👦‍👦 GROUP MENU": ["GROUP"],
        "💻 BOT_INFO MENU": ["GITHUB", "USER", "PAIR"],
        "🔞 ADULT MENU": ["XVIDEO"]
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

    // Store commands
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
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363285388090068@newsletter",
            newsletterName: "BWM-XMD",
            serverMessageId: Math.floor(100000 + Math.random() * 900000),
        },
    };

    // Send main menu
    await zk.sendMessage(dest, {
        image: { url: randomImage() },
        caption: `
┌─❖
│ 𝐁𝐖𝐌 𝐗𝐌𝐃    
└┬❖  
┌┤ ${greeting}
│└────────┈⳹  
│🕵️ ᴜsᴇʀ ɴᴀᴍᴇ: ${contactName}
│📅 ᴅᴀᴛᴇ: ${date}
│⏰ ᴛɪᴍᴇ: ${time}       
│⭐ ʙᴡᴍ xᴍᴅ ᴜsᴇʀs: ${githubStats}       
└─────────────┈⳹ 

> ©Ibrahim Adams

${readMore}

📜 *Tap one of the buttons below*

${footer}`,
        footer: "BWM XMD - Quantum Version",
        buttons: [
            { buttonId: 'list_menu', buttonText: { displayText: '📋 INBOX MENU' }, type: 1 },
            { buttonId: 'button_menu', buttonText: { displayText: '🗂️ GROUP MENU' }, type: 1 },
            { buttonId: 'web_app', buttonText: { displayText: '🌐 OUR WEB' }, type: 1 },
            { buttonId: 'youtube', buttonText: { displayText: '📺 YOGO APP' }, type: 1 },
            { buttonId: 'random_song', buttonText: { displayText: '🎵 RANDOM SONG' }, type: 1 },
            { buttonId: 'updates', buttonText: { displayText: '📢 UPDATES' }, type: 1 }
        ],
        contextInfo: contextInfo
    }, { quoted: contactMsg });

    // Handle button clicks
    const handler = async (update) => {
        const message = update.messages[0];
        if (!message || !message.key || message.key.remoteJid !== dest) return;

        try {
            // Handle button response
            if (message.message?.buttonsResponseMessage) {
                const buttonId = message.message.buttonsResponseMessage.selectedButtonId;

                if (buttonId === 'list_menu') {
                    // Send list menu
                    const sections = [{
                        title: "📋 Command Categories",
                        rows: Object.keys(categories).map((cat, i) => ({
                            title: cat,
                            rowId: `cat_${i}`,
                            description: `View ${cat} commands`
                        }))
                    }];

                    await zk.sendMessage(dest, {
                        text: "📋 *BWM XMD COMMAND MENU*",
                        footer: "Select a category",
                        title: "🌎 QUANTUM TECH 🌎",
                        buttonText: "View Categories",
                        sections,
                        contextInfo: contextInfo
                    }, { quoted: contactMsg });
                }
                else if (buttonId === 'button_menu') {
                    // Send button menu
                    const buttons = Object.keys(categories).map(cat => ({
                        buttonId: `cat_${cat}`,
                        buttonText: { displayText: cat },
                        type: 1
                    }));

                    // Add back button
                    buttons.push({
                        buttonId: 'main_menu',
                        buttonText: { displayText: '🔙 MAIN MENU' },
                        type: 1
                    });

                    await zk.sendMessage(dest, {
                        text: "🗂️ *BWM XMD BUTTON MENU*",
                        footer: "Select a category",
                        buttons,
                        contextInfo: contextInfo
                    }, { quoted: contactMsg });
                }
                else if (buttonId === 'web_app') {
                    // Send web app link
                    await zk.sendMessage(dest, {
                        text: "🌐 *BWM XMD WEB APP*\n\nVisit our official website here:\nwww.ibrahimadams.site",
                        contextInfo: contextInfo
                    }, { quoted: contactMsg });
                }
                else if (buttonId === 'youtube') {
                    // Send YouTube link
                    await zk.sendMessage(dest, {
                        text: "📺 *BWM XMD YOUTUBE*\n\nCheck out our yugo app:\nbwm-xmd-go.vercel.app",
                        contextInfo: contextInfo
                    }, { quoted: contactMsg });
                }
                else if (buttonId === 'random_song') {
                    // Send random song
                    const randomAudio = getRandomAudio();
                    await zk.sendMessage(dest, {
                        audio: { url: `${githubRawBaseUrl}/${randomAudio}` },
                        mimetype: 'audio/mp4',
                        ptt: true,
                        contextInfo: contextInfo
                    }, { quoted: contactMsg });
                }
                else if (buttonId === 'updates') {
                    // Send updates channel link
                    await zk.sendMessage(dest, {
                        text: "📢 *BWM XMD UPDATES CHANNEL*\n\nJoin our official updates channel:\nwhatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
                        contextInfo: contextInfo
                    }, { quoted: contactMsg });
                }
                else if (buttonId.startsWith('cat_')) {
                    // Show commands for selected category
                    const catName = buttonId.replace('cat_', '');
                    const catKeys = categories[catName] || [];
                    
                    let commands = [];
                    catKeys.forEach(key => {
                        if (commandList[key]) {
                            commands = commands.concat(commandList[key]);
                        }
                    });

                    if (commands.length > 0) {
                        await zk.sendMessage(dest, {
                            text: `📋 *${catName} COMMANDS*\n\n${commands.join('\n')}\n\n${footer}`,
                            contextInfo: contextInfo
                        }, { quoted: contactMsg });
                    } else {
                        await repondre(`❌ No commands found for ${catName}`);
                    }
                }
                else if (buttonId === 'main_menu') {
                    // Resend main menu
                    await zk.sendMessage(dest, {
                        image: { url: randomImage() },
                        caption: `Returning to main menu...\n\n${footer}`,
                        footer: "BWM XMD - Quantum Version",
                        buttons: [
                            { buttonId: 'list_menu', buttonText: { displayText: '📋 INBOX MENU' }, type: 1 },
                            { buttonId: 'button_menu', buttonText: { displayText: '🗂️ GROUP MENU' }, type: 1 },
                            { buttonId: 'web_app', buttonText: { displayText: '🌐 OUR WEB' }, type: 1 },
                            { buttonId: 'youtube', buttonText: { displayText: '📺 YOGO APP' }, type: 1 },
                            { buttonId: 'random_song', buttonText: { displayText: '🎵 RANDOM SONG' }, type: 1 },
                            { buttonId: 'updates', buttonText: { displayText: '📢 UPDATES' }, type: 1 }
                        ],
                        contextInfo: contextInfo
                    }, { quoted: contactMsg });
                }
            }

            // Handle list response
            if (message.message?.listResponseMessage) {
                const selectedId = message.message.listResponseMessage.singleSelectReply.selectedRowId;
                if (selectedId.startsWith('cat_')) {
                    const catIndex = parseInt(selectedId.split('_')[1]);
                    const catName = Object.keys(categories)[catIndex];
                    const catKeys = categories[catName] || [];
                    
                    let commands = [];
                    catKeys.forEach(key => {
                        if (commandList[key]) {
                            commands = commands.concat(commandList[key]);
                        }
                    });

                    if (commands.length > 0) {
                        await zk.sendMessage(dest, {
                            text: `📋 *${catName} COMMANDS*\n\n${commands.join('\n')}\n\n${footer}`,
                            contextInfo: contextInfo
                        }, { quoted: contactMsg });
                    } else {
                        await repondre(`❌ No commands found for ${catName}`);
                    }
                }
            }
        } catch (error) {
            console.error("Menu handler error:", error);
            await repondre("❌ An error occurred while processing your request");
        }
    };

    // Add event listener
    zk.ev.on('messages.upsert', handler);

    // Remove listener after 5 minutes
    setTimeout(() => {
        zk.ev.off('messages.upsert', handler);
    }, 300000);
});
