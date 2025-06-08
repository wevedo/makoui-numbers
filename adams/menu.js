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

// Navigation state storage
const navigationState = new Map();

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

    // Create numbered menu options (REMOVED INBOX MENU AND GROUP MENU)
    const menuOptions = `
*📋 MENU OPTIONS - Reply with number:*

*1.* 🌐 OUR WEB
*2.* 📺 YOGO APP
*3.* 🎵 RANDOM SONG
*4.* 📢 UPDATES

*📂 COMMAND CATEGORIES - Reply with number:*

*5.* 🤖 AI MENU
*6.* ⚽ SPORTS MENU
*7.* 📥 DOWNLOAD MENU
*8.* 🛠️ HEROKU MENU
*9.* 💬 CONVERSATION MENU
*10.* 😂 FUN MENU
*11.* 🌍 GENERAL MENU
*12.* 👨‍👨‍👦‍👦 GROUP MENU
*13.* 💻 BOT_INFO MENU
*14.* 🔞 ADULT MENU

_Reply with any number above to access that section_`;

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

    // Initialize navigation state for this user
    navigationState.set(sender, { 
        currentCategory: -1, 
        messageId: sentMessage.key.id,
        isInCategory: false 
    });

    // Handle replies to this message
    const cleanup = () => {
        zk.ev.off("messages.upsert", handleReply);
        navigationState.delete(sender);
    };

    const showCategoryCommands = async (categoryIndex, dest, message, isNavigation = false) => {
        const categoryNames = Object.keys(categories);
        const categoryName = categoryNames[categoryIndex];
        
        if (!categoryName) return false;

        const catKeys = categories[categoryName] || [];
        let commands = [];
        catKeys.forEach(key => {
            if (commandList[key]) {
                commands = commands.concat(commandList[key]);
            }
        });

        // Create navigation info
        const totalCategories = categoryNames.length;
        const navigationInfo = `
*🧭 NAVIGATION:*
*0.* 🔙 BACK TO MAIN MENU
*98.* ⬅️ PREVIOUS CATEGORY ${categoryIndex > 0 ? `(${categoryNames[categoryIndex - 1]})` : '(Last)'}
*99.* ➡️ NEXT CATEGORY ${categoryIndex < totalCategories - 1 ? `(${categoryNames[categoryIndex + 1]})` : '(First)'}

_Category ${categoryIndex + 1} of ${totalCategories}_`;

        if (commands.length > 0) {
            await zk.sendMessage(dest, {
                text: `📋 *${categoryName} COMMANDS*\n\n${commands.join('\n')}\n\n${navigationInfo}\n\n${footer}`,
                contextInfo: contextInfo
            }, { quoted: message });
        } else {
            await zk.sendMessage(dest, {
                text: `❌ No commands found for ${categoryName}\n\n${navigationInfo}\n\n${footer}`,
                contextInfo: contextInfo
            }, { quoted: message });
        }

        // Update navigation state
        const userState = navigationState.get(sender) || {};
        userState.currentCategory = categoryIndex;
        userState.isInCategory = true;
        navigationState.set(sender, userState);

        return true;
    };

    const handleReply = async (update) => {
        const message = update.messages[0];
        if (!message?.message) return;

        // Check if this is a reply to our menu message or if user is in navigation
        const userState = navigationState.get(sender);
        const isReply = message.message.extendedTextMessage?.contextInfo?.stanzaId === sentMessage.key.id;
        const isInCategory = userState?.isInCategory;
        
        if (!isReply && !isInCategory) return;

        const responseText = message.message.extendedTextMessage?.text?.trim() || 
                           message.message.conversation?.trim();
        
        if (!responseText) return;

        const selectedIndex = parseInt(responseText);
        const dest = message.key.remoteJid;

        try {
            // Handle navigation commands
            if (selectedIndex === 0) {
                // Back to main menu
                const userState = navigationState.get(sender) || {};
                userState.isInCategory = false;
                userState.currentCategory = -1;
                navigationState.set(sender, userState);

                await zk.sendMessage(dest, {
                    image: { url: randomImage() },
                    caption: `🔙 *BACK TO MAIN MENU*\n\n${menuOptions}\n\n${footer}`,
                    contextInfo: contextInfo
                }, { quoted: message });
                return;
            }

            if (selectedIndex === 98) {
                // Previous category
                const userState = navigationState.get(sender) || {};
                const currentIndex = userState.currentCategory || 0;
                const categoryNames = Object.keys(categories);
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : categoryNames.length - 1;
                
                await showCategoryCommands(prevIndex, dest, message, true);
                return;
            }

            if (selectedIndex === 99) {
                // Next category
                const userState = navigationState.get(sender) || {};
                const currentIndex = userState.currentCategory || 0;
                const categoryNames = Object.keys(categories);
                const nextIndex = currentIndex < categoryNames.length - 1 ? currentIndex + 1 : 0;
                
                await showCategoryCommands(nextIndex, dest, message, true);
                return;
            }

            // Handle main menu options
            switch (selectedIndex) {
                case 1:
                    // WEB APP
                    await zk.sendMessage(dest, {
                        text: "🌐 *BWM XMD WEB APP*\n\nVisit our official website here:\nwww.ibrahimadams.site\n\n*0.* 🔙 BACK TO MAIN MENU\n\n" + footer,
                        contextInfo: contextInfo
                    }, { quoted: message });
                    break;

                case 2:
                    // YOGO APP
                    await zk.sendMessage(dest, {
                        text: "📺 *BWM XMD YOUTUBE*\n\nCheck out our yugo app:\nbwm-xmd-go.vercel.app\n\n*0.* 🔙 BACK TO MAIN MENU\n\n" + footer,
                        contextInfo: contextInfo
                    }, { quoted: message });
                    break;

                case 3:
                    // RANDOM SONG
                    const randomAudio = getRandomAudio();
                    await zk.sendMessage(dest, {
                        audio: { url: `${githubRawBaseUrl}/${randomAudio}` },
                        mimetype: 'audio/mp4',
                        ptt: true,
                        contextInfo: contextInfo
                    }, { quoted: message });
                    
                    await zk.sendMessage(dest, {
                        text: "🎵 *RANDOM SONG SENT*\n\n*0.* 🔙 BACK TO MAIN MENU\n\n" + footer,
                        contextInfo: contextInfo
                    }, { quoted: message });
                    break;

                case 4:
                    // UPDATES
                    await zk.sendMessage(dest, {
                        text: "📢 *BWM XMD UPDATES CHANNEL*\n\nJoin our official updates channel:\nwhatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y\n\n*0.* 🔙 BACK TO MAIN MENU\n\n" + footer,
                        contextInfo: contextInfo
                    }, { quoted: message });
                    break;

                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12:
                case 13:
                case 14:
                    // Category menus (5-14)
                    const catIndex = selectedIndex - 5;
                    await showCategoryCommands(catIndex, dest, message);
                    break;

                default:
                    await zk.sendMessage(dest, {
                        text: "*❌ Invalid number. Please select a valid option.*\n\n*0.* 🔙 BACK TO MAIN MENU\n\n" + footer,
                        contextInfo: contextInfo
                    }, { quoted: message });
                    break;
            }
        } catch (error) {
            console.error("Menu reply error:", error);
            await zk.sendMessage(dest, {
                text: "*❌ An error occurred. Please try again.*\n\n*0.* 🔙 BACK TO MAIN MENU\n\n" + footer,
                contextInfo: contextInfo
            }, { quoted: message });
        }
    };

    // Listen for replies
    zk.ev.on("messages.upsert", handleReply);

    // Auto cleanup after 10 minutes
    setTimeout(cleanup, 600000);
});
