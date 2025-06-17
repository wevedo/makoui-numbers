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
    "💻 BOT_INFO MENU": ["GITHUB", "USER", "PAIR", "NEW"],
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

    // Create numbered menu options
    const menuOptions = `
*📋 MENU OPTIONS - Reply with number:*

*3.* 🌐 OUR WEB
*4.* 📺 YOGO APP
*5.* 🎵 RANDOM SONG
*6.* 📢 UPDATES

*📂 COMMAND CATEGORIES - Reply with number:*

*7.* 🤖 AI MENU
*8.* ⚽ SPORTS MENU
*9.* 📥 DOWNLOAD MENU
*10.* 🛠️ HEROKU MENU
*11.* 💬 CONVERSATION MENU
*12.* 😂 FUN MENU
*13.* 🌍 GENERAL MENU
*14.* 👨‍👨‍👦‍👦 GROUP MENU
*15.* 💻 BOT_INFO MENU
*16.* 🔞 ADULT MENU

_Reply with any number above to access that menu section_`;

    // Send main menu
    const sentMessage = await zk.sendMessage(dest, {
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

${menuOptions}

${footer}`,
        contextInfo: contextInfo
    }, { quoted: contactMsg });

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
                    // INBOX MENU - Show all commands
                    const categoryKeys = Object.keys(categories);
                    let allMenuText = "*📋 INBOX MENU - All Commands*\n\n";
                    
                    categoryKeys.forEach((catName, index) => {
                        allMenuText += `*${index + 1}. ${catName}*\n`;
                        const catKeys = categories[catName] || [];
                        catKeys.forEach(key => {
                            if (commandList[key]) {
                                commandList[key].forEach(cmd => {
                                    allMenuText += `   ${cmd}\n`;
                                });
                            }
                        });
                        allMenuText += "\n";
                    });

                    await zk.sendMessage(dest, {
                        text: allMenuText + footer,
                        contextInfo: contextInfo
                    }, { quoted: message });
                    break;

                case 2:
                    // GROUP MENU - Show category selection
                    let groupMenuText = "*🗂️ GROUP MENU - Select Category*\n\n";
                    Object.keys(categories).forEach((catName, index) => {
                        groupMenuText += `*${index + 17}.* ${catName}\n`;
                    });
                    
                    groupMenuText += "\n_Reply with the number to see commands in that category_\n\n";
                    await zk.sendMessage(dest, {
                        text: groupMenuText + footer,
                        contextInfo: contextInfo
                    }, { quoted: message });
                    break;

                case 3:
                    // WEB APP
                    await zk.sendMessage(dest, {
                        text: "🌐 *BWM XMD WEB APP*\n\nVisit our official website here:\nwww.ibrahimadams.site\n\n" + footer,
                        contextInfo: contextInfo
                    }, { quoted: message });
                    break;

                case 4:
                    // YOGO APP
                    await zk.sendMessage(dest, {
                        text: "📺 *BWM XMD YOUTUBE*\n\nCheck out our yugo app:\nbwm-xmd-go.vercel.app\n\n" + footer,
                        contextInfo: contextInfo
                    }, { quoted: message });
                    break;

                case 5:
                    // RANDOM SONG
                    const randomAudio = getRandomAudio();
                    await zk.sendMessage(dest, {
                        audio: { url: `${githubRawBaseUrl}/${randomAudio}` },
                        mimetype: 'audio/mp4',
                        ptt: true,
                        contextInfo: contextInfo
                    }, { quoted: message });
                    break;

                case 6:
                    // UPDATES
                    await zk.sendMessage(dest, {
                        text: "📢 *BWM XMD UPDATES CHANNEL*\n\nJoin our official updates channel:\nwhatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y\n\n" + footer,
                        contextInfo: contextInfo
                    }, { quoted: message });
                    break;

                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12:
                case 13:
                case 14:
                case 15:
                case 16:
                    // Category menus (7-16)
                    const catIndex = selectedIndex - 7;
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
                                text: `📋 *${categoryName} COMMANDS*\n\n${commands.join('\n')}\n\n${footer}`,
                                contextInfo: contextInfo
                            }, { quoted: message });
                        } else {
                            await zk.sendMessage(dest, {
                                text: `❌ No commands found for ${categoryName}\n\n${footer}`,
                                contextInfo: contextInfo
                            }, { quoted: message });
                        }
                    }
                    break;

                default:
                    // Handle numbers 17+ for group menu categories
                    if (selectedIndex >= 17) {
                        const groupCatIndex = selectedIndex - 17;
                        const categoryNames = Object.keys(categories);
                        const categoryName = categoryNames[groupCatIndex];
                        
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
                                    text: `📋 *${categoryName} COMMANDS*\n\n${commands.join('\n')}\n\n${footer}`,
                                    contextInfo: contextInfo
                                }, { quoted: message });
                            } else {
                                await zk.sendMessage(dest, {
                                    text: `❌ No commands found for ${categoryName}\n\n${footer}`,
                                    contextInfo: contextInfo
                                }, { quoted: message });
                            }
                        } else {
                            await zk.sendMessage(dest, {
                                text: "*❌ Invalid number. Please select a valid option.*\n\n" + footer,
                                contextInfo: contextInfo
                            }, { quoted: message });
                        }
                    } else {
                        await zk.sendMessage(dest, {
                            text: "*❌ Invalid number. Please select a valid option.*\n\n" + footer,
                            contextInfo: contextInfo
                        }, { quoted: message });
                    }
                    break;
            }
        } catch (error) {
            console.error("Menu reply error:", error);
            await zk.sendMessage(dest, {
                text: "*❌ An error occurred. Please try again.*\n\n" + footer,
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
