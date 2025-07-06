const { adams } = require("../Ibrahim/adams");
const { hybridConfig } = require("../config");

// Helper function to validate configuration
function validateConfig(repondre) {
    // Always return true since we're using hybrid config
    return true;
}

// **Mapping of Environment Variables to User-Friendly Names**
const configMapping = {
    AUDIO_CHATBOT: "Audio Chatbot",
    AUTO_BIO: "Auto Bio",
    AUTO_DOWNLOAD_STATUS: "Auto Download Status",
    AUTO_REACT: "Auto React",
    AUTO_REACT_STATUS: "Auto React Status",
    AUTO_READ: "Auto Read",
    AUTO_READ_STATUS: "Auto Read Status",
    CHATBOT: "Chatbot",
    PUBLIC_MODE: "Public Mode",
    STARTING_BOT_MESSAGE: "Starting Bot Message",
    "Auto Typing": "Auto Typing",
    "Always Online": "Always Online",
    "Auto Recording": "Auto Recording",
    ANTIDELETE_RECOVER_CONVENTION: "Anti Delete Recover Convention",
    ANTIDELETE_SENT_INBOX: "Anti Delete Sent Inbox",
    GOODBYE_MESSAGE: "Goodbye Message",
    AUTO_REJECT_CALL: "Auto Reject Call",
    WELCOME_MESSAGE: "Welcome Message",
    GROUPANTILINK: "Group Anti Link",
    AUTO_REPLY_STATUS: "Auto reply status"
};

// **Excluded Variables** (these are managed statically)
const EXCLUDED_VARS = [
    "DATA_BASE_URL",
    "MENU_TYPE",
    "CHATBOT1",
    "OWNER_NUMBER",
    "HEROKU_API_KEY",
    "HEROKU_APP_NAME",
    "BOT_MENU_LINK",
    "BOT_NAME",
    "PM_PERMIT",
    "PREFIX",
    "WARN_COUNT",
    "SESSION_ID",
];

// **Enhanced Command to Display and Modify Variables**
adams(
    {
        nomCom: "settings",
        categorie: "Control",
    },
    async (chatId, zk, context) => {
        const { repondre, superUser } = context;

        if (!superUser) {
            return repondre(
                "🚫 *Access Denied!* This command is restricted to the bot owner."
            );
        }

        if (!validateConfig(repondre)) return;

        try {
            // Get all settings from hybrid manager
            const allSettings = hybridConfig.getAllSettings();
            const sessionId = hybridConfig.getSessionId();
            const storageMode = hybridConfig.isHerokuAvailable ? 'Heroku+Local' : 'Local Only';
            
            let numberedList = [];
            let index = 1;

            // Get keys that are not excluded
            const variableKeys = Object.keys(configMapping).filter(
                (key) => !EXCLUDED_VARS.includes(key)
            );

            variableKeys.forEach((key) => {
                let currentValue;

                if (key === "Auto Typing") {
                    const presence = hybridConfig.getSetting('PRESENCE', '0');
                    currentValue = presence === "2" ? "yes" : "no";
                } else if (key === "Always Online") {
                    const presence = hybridConfig.getSetting('PRESENCE', '0');
                    currentValue = presence === "1" ? "yes" : "no";
                } else if (key === "Auto Recording") {
                    const presence = hybridConfig.getSetting('PRESENCE', '0');
                    currentValue = presence === "3" ? "yes" : "no";
                } else {
                    const settingValue = hybridConfig.getSetting(key, 'no');
                    currentValue = settingValue === "yes" ? "yes" : "no";
                }

                let toggleOn = `Enable ${configMapping[key]}`;
                let toggleOff = `Disable ${configMapping[key]}\n♻️ Currently: ${currentValue}\n▱▱▱▱▱▱▱▰▰▰▰▰▰▰▰▰\n\n`;

                numberedList.push(`${index}. ${toggleOn}`);
                numberedList.push(`${index + 1}. ${toggleOff}`);
                index += 2;
            });

            // Split into two pages
            const chunkSize = Math.ceil(numberedList.length / 2);
            const pages = [
                numberedList.slice(0, chunkSize),
                numberedList.slice(chunkSize),
            ];

            const sendPage = async (pageIndex) => {
                if (pageIndex < 0 || pageIndex >= pages.length) return;

                const randomImage =
                    Math.random() < 0.5
                        ? "https://res.cloudinary.com/dptzpfgtm/image/upload/v1751638065/whatsapp_uploads/igo74lzeatfkujrfivkw.jpg"
                        : "https://res.cloudinary.com/dptzpfgtm/image/upload/v1751638065/whatsapp_uploads/igo74lzeatfkujrfivkw.jpg";

                const message = `🌟 *BWM XMD HYBRID SETTINGS* 🌟\n📌 Reply with a number to toggle a variable\n (Page ${
                    pageIndex + 1
                }/${pages.length})\n\n💾 *Storage Mode:* ${storageMode}\n🔄 *Session ID:* ${sessionId.slice(-8)}\n⚡ *Status:* ${hybridConfig.isHerokuAvailable ? 'Synced' : 'Local Only'}\n\n${pages[pageIndex].join(
                    "\n"
                )}\n\n📌 *Reply with a number to toggle a variable or navigate pages:*\n▶️ *${chunkSize * 2 + 1}* Next Page\n◀️ *${
                    chunkSize * 2 + 2
                }* Previous Page\n\n🔧 *Quick Commands:*\n• \`autotyping on/off\` - Auto typing\n• \`autobio on/off\` - Auto bio\n• \`chatbot on/off\` - Chatbot\n• \`setvar KEY=value\` - Set any variable`;

                const sentMessage = await zk.sendMessage(chatId, {
                    image: { url: randomImage },
                    caption: message,
                    contextInfo: {
                        mentionedJid: [],
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "120363285388090068@newsletter",
                            newsletterName: "BWM-XMD",
                            serverMessageId: Math.floor(100000 + Math.random() * 900000),
                        },
                    },
                });

                // Enhanced Listen for Reply
                const replyHandler = async (update) => {
                    const message = update.messages[0];
                    if (!message.message || !message.message.extendedTextMessage) return;

                    const responseText = message.message.extendedTextMessage.text.trim();
                    if (
                        message.message.extendedTextMessage.contextInfo &&
                        message.message.extendedTextMessage.contextInfo.stanzaId ===
                            sentMessage.key.id
                    ) {
                        const selectedIndex = parseInt(responseText);
                        if (
                            isNaN(selectedIndex) ||
                            (selectedIndex < 1 && selectedIndex > chunkSize * 2 + 2)
                        ) {
                            return repondre(
                                "❌ *Invalid number. Please select a valid option.*"
                            );
                        }

                        if (selectedIndex === chunkSize * 2 + 1) {
                            return sendPage(pageIndex + 1);
                        } else if (selectedIndex === chunkSize * 2 + 2) {
                            return sendPage(pageIndex - 1);
                        }

                        const variableIndex = Math.floor((selectedIndex - 1) / 2);
                        const selectedKey = variableKeys[variableIndex];

                        let newValue = selectedIndex % 2 === 1 ? "yes" : "no";
                        let presenceValue = null;

                        if (selectedKey === "Auto Typing") {
                            presenceValue = newValue === "yes" ? "2" : "0";
                        } else if (selectedKey === "Always Online") {
                            presenceValue = newValue === "yes" ? "1" : "0";
                        } else if (selectedKey === "Auto Recording") {
                            presenceValue = newValue === "yes" ? "3" : "0";
                        }

                        try {
                            let success = false;
                            let updateMessage = "";

                            if (presenceValue !== null) {
                                // Update PRESENCE setting
                                success = await hybridConfig.setSetting("PRESENCE", presenceValue);
                                updateMessage = `✅ *${configMapping[selectedKey]} is now set to ${newValue}*`;
                            } else {
                                // Update regular setting
                                success = await hybridConfig.setSetting(selectedKey, newValue);
                                updateMessage = `✅ *${configMapping[selectedKey]} is now set to ${newValue}*`;
                            }

                            if (success) {
                                // Remove the reply handler
                                zk.ev.off("messages.upsert", replyHandler);

                                await zk.sendMessage(chatId, {
                                    text: `${updateMessage}\n\n💾 *Saved to:* ${hybridConfig.isHerokuAvailable ? 'Local + Heroku' : 'Local Storage'}\n🔄 *Bot is restarting...*\n🆔 *Session:* ${hybridConfig.getSessionId().slice(-8)}`,
                                });

                                // Restart bot with new settings
                                await hybridConfig.restartBot();
                            } else {
                                await zk.sendMessage(chatId, {
                                    text: `❌ *Failed to update ${configMapping[selectedKey]}*\n\n🔧 *Try using:* \`setvar ${selectedKey}=${newValue}\``,
                                });
                            }
                        } catch (error) {
                            console.error("Setting update error:", error);
                            await zk.sendMessage(chatId, {
                                text: `⚠️ *Error updating ${configMapping[selectedKey]}*\n\n🔧 *Error:* ${error.message}`,
                            });
                        }
                    }
                };

                zk.ev.on("messages.upsert", replyHandler);

                // Auto-cleanup handler after 5 minutes
                setTimeout(() => {
                    zk.ev.off("messages.upsert", replyHandler);
                }, 300000);
            };

            sendPage(0);
        } catch (error) {
            console.error("Error fetching settings:", error);
            await zk.sendMessage(chatId, {
                text: "⚠️ *Failed to fetch settings!*\n\n🔧 *Try:* \`settings\` again or use \`setvar\` command",
            });
        }
    }
);

// **Enhanced Command to set or update variables**
adams({
    nomCom: 'setvar',
    categorie: "Control"
}, async (chatId, zk, context) => {
    const { repondre, superUser, arg } = context;

    if (!superUser) {
        return repondre("🚫 *Access Denied!* This command is restricted to the bot owner.");
    }

    if (!validateConfig(repondre)) return;

    if (!arg[0] || !arg[0].includes('=')) {
        return repondre(
            "📋 *Enhanced Usage Instructions:*\n\n" +
            "To set or update a variable:\n" +
            "`setvar VAR_NAME=value`\n\n" +
            "Examples:\n" +
            "`setvar AUTO_REPLY=yes`\n" +
            "`setvar CHATBOT=no`\n" +
            "`setvar PRESENCE=1`\n\n" +
            "💾 *Storage Mode:* " + (hybridConfig.isHerokuAvailable ? 'Heroku+Local' : 'Local Only') + "\n" +
            "🔄 *Session ID:* " + hybridConfig.getSessionId().slice(-8) + "\n" +
            "⚡ *Status:* " + (hybridConfig.isHerokuAvailable ? 'Synced' : 'Local Only')
        );
    }

    const [varName, value] = arg[0].split('=');
    if (!varName || value === undefined) {
        return repondre("⚠️ *Invalid format!* Use `VAR_NAME=value` format.");
    }

    try {
        const success = await hybridConfig.setSetting(varName, value);
        
        if (success) {
            await zk.sendMessage(chatId, {
                text: `✅ *${varName.replace(/_/g, " ")} updated successfully!*\n\n` +
                      `📝 *Variable:* ${varName}\n` +
                      `📊 *Value:* ${value}\n` +
                      `💾 *Saved to:* ${hybridConfig.isHerokuAvailable ? 'Local + Heroku' : 'Local Storage'}\n` +
                      `🔄 *Bot is restarting...*\n` +
                      `🆔 *Session:* ${hybridConfig.getSessionId().slice(-8)}`
            });
            
            // Restart bot with new settings
            await hybridConfig.restartBot();
        } else {
            await zk.sendMessage(chatId, {
                text: `❌ *Failed to update ${varName}*\n\n🔧 *Please check the variable name and try again.*`
            });
        }
    } catch (error) {
        console.error("Enhanced setvar error:", error);
        await zk.sendMessage(chatId, { 
            text: `⚠️ *Failed to update variable!*\n\n🔧 *Error:* ${error.message}` 
        });
    }
});

// **New Command: Get Variable Value**
adams({
    nomCom: 'getallvarvar',
    categorie: "Control"
}, async (chatId, zk, context) => {
    const { repondre, superUser, arg } = context;

    if (!superUser) {
        return repondre("🚫 *Access Denied!* This command is restricted to the bot owner.");
    }

    if (!arg[0]) {
        return repondre(
            "📋 *Get Variable Usage:*\n\n" +
            "To get a variable value:\n" +
            "`getvar VAR_NAME`\n\n" +
            "Examples:\n" +
            "`getvar AUTO_REPLY`\n" +
            "`getvar CHATBOT`\n" +
            "`getvar PRESENCE`"
        );
    }

    const varName = arg[0].toUpperCase();
    
    try {
        const value = hybridConfig.getSetting(varName, 'NOT_FOUND');
        
        if (value === 'NOT_FOUND') {
            return repondre(
                `❌ *Variable '${varName}' not found*\n\n` +
                `🔧 *Available variables:*\n` +
                Object.keys(configMapping).slice(0, 10).join(', ') + '...'
            );
        }
        
        await zk.sendMessage(chatId, {
            text: `📊 *Variable Information*\n\n` +
                  `📝 *Name:* ${varName}\n` +
                  `📊 *Value:* ${value}\n` +
                  `💾 *Source:* ${hybridConfig.isHerokuAvailable ? 'Hybrid Storage' : 'Local Storage'}\n` +
                  `🆔 *Session:* ${hybridConfig.getSessionId().slice(-8)}\n` +
                  `⚡ *Status:* ${hybridConfig.isHerokuAvailable ? 'Synced' : 'Local Only'}`
        });
    } catch (error) {
        console.error("Get variable error:", error);
        await zk.sendMessage(chatId, { 
            text: `⚠️ *Failed to get variable!*\n\n🔧 *Error:* ${error.message}` 
        });
    }
});

// **New Command: List All Variables**
adams({
    nomCom: 'listvar',
    categorie: "Control"
}, async (chatId, zk, context) => {
    const { repondre, superUser } = context;

    if (!superUser) {
        return repondre("🚫 *Access Denied!* This command is restricted to the bot owner.");
    }

    try {
        const allSettings = hybridConfig.getAllSettings();
        const sessionId = hybridConfig.getSessionId();
        const storageMode = hybridConfig.isHerokuAvailable ? 'Heroku+Local' : 'Local Only';
        
        let settingsList = [];
        let index = 1;
        
        Object.entries(allSettings).forEach(([key, value]) => {
            if (!EXCLUDED_VARS.includes(key)) {
                settingsList.push(`${index}. *${key}*: ${value}`);
                index++;
            }
        });

        const message = `📊 *ALL CONFIGURATION VARIABLES*\n\n` +
                       `💾 *Storage Mode:* ${storageMode}\n` +
                       `🔄 *Session ID:* ${sessionId.slice(-8)}\n` +
                       `⚡ *Status:* ${hybridConfig.isHerokuAvailable ? 'Synced' : 'Local Only'}\n\n` +
                       `📝 *Variables (${settingsList.length}):*\n\n` +
                       settingsList.join('\n') + '\n\n' +
                       `🔧 *Commands:*\n` +
                       `• \`setvar KEY=value\` - Update variable\n` +
                       `• \`getvar KEY\` - Get variable value\n` +
                       `• \`settings\` - Interactive settings menu`;

        await zk.sendMessage(chatId, {
            text: message
        });
    } catch (error) {
        console.error("List variables error:", error);
        await zk.sendMessage(chatId, { 
            text: `⚠️ *Failed to list variables!*\n\n🔧 *Error:* ${error.message}` 
        });
    }
});

// **New Command: Backup Settings**
adams({
    nomCom: 'backup',
    categorie: "Control"
}, async (chatId, zk, context) => {
    const { repondre, superUser } = context;

    if (!superUser) {
        return repondre("🚫 *Access Denied!* This command is restricted to the bot owner.");
    }

    try {
        await hybridConfig.createBackup();
        const sessionId = hybridConfig.getSessionId();
        
        await zk.sendMessage(chatId, {
            text: `✅ *Settings Backup Created!*\n\n` +
                  `💾 *Backup Location:* config/backups/\n` +
                  `🔄 *Session ID:* ${sessionId.slice(-8)}\n` +
                  `📅 *Created:* ${new Date().toLocaleString()}\n\n` +
                  `🔧 *Note:* Backups are automatically created before each settings change.`
        });
    } catch (error) {
        console.error("Backup creation error:", error);
        await zk.sendMessage(chatId, { 
            text: `⚠️ *Failed to create backup!*\n\n🔧 *Error:* ${error.message}` 
        });
    }
});

// **New Command: System Status**
adams({
    nomCom: 'status',
    categorie: "Control"
}, async (chatId, zk, context) => {
    const { repondre, superUser } = context;

    if (!superUser) {
        return repondre("🚫 *Access Denied!* This command is restricted to the bot owner.");
    }

    try {
        const allSettings = hybridConfig.getAllSettings();
        const sessionId = hybridConfig.getSessionId();
        const storageMode = hybridConfig.isHerokuAvailable ? 'Heroku+Local' : 'Local Only';
        const settingsCount = Object.keys(allSettings).length;
        
        const uptime = process.uptime();
        const uptimeHours = Math.floor(uptime / 3600);
        const uptimeMinutes = Math.floor((uptime % 3600) / 60);
        const uptimeSeconds = Math.floor(uptime % 60);
        
        const message = `📊 *BWM XMD SYSTEM STATUS*\n\n` +
                       `🔄 *Session ID:* ${sessionId.slice(-8)}\n` +
                       `💾 *Storage Mode:* ${storageMode}\n` +
                       `⚡ *Heroku Status:* ${hybridConfig.isHerokuAvailable ? '✅ Connected' : '❌ Offline'}\n` +
                       `📝 *Settings Count:* ${settingsCount}\n` +
                       `⏱️ *Uptime:* ${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s\n` +
                       `🧠 *Memory Usage:* ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\n` +
                       `🔧 *Node Version:* ${process.version}\n\n` +
                       `🚀 *Bot Status:* Online & Operational\n` +
                       `💯 *System Health:* Excellent`;

        await zk.sendMessage(chatId, {
            text: message
        });
    } catch (error) {
        console.error("Status check error:", error);
        await zk.sendMessage(chatId, { 
            text: `⚠️ *Failed to get system status!*\n\n🔧 *Error:* ${error.message}` 
        });
    }
});

// **NEW: Flexible Setting Commands - Handle "auto [feature] [on/off]"**
adams({
    nomCom: 'auto',
    categorie: "Control"
}, async (chatId, zk, context) => {
    const { repondre, superUser, arg } = context;

    if (!superUser) {
        return repondre("🚫 *Access Denied!* This command is restricted to the bot owner.");
    }

    if (arg.length < 2) {
        return repondre("📋 *Usage:* `auto [feature] [on/off]`\n\nExamples:\n• `auto typing on`\n• `auto bio off`\n• `auto react on`\n• `auto read off`");
    }

    const feature = arg.slice(0, -1).join('').toLowerCase().replace(/\s+/g, '');
    const action = arg[arg.length - 1].toLowerCase();

    if (!['on', 'off'].includes(action)) {
        return repondre("❌ *Invalid action!* Use `on` or `off`");
    }

    const value = action === 'on' ? 'yes' : 'no';

    // Feature mapping
    const featureMap = {
    'typing': { key: 'PRESENCE', value: action === 'on' ? '2' : '0', name: 'Auto Typing' },
    'online': { key: 'PRESENCE', value: action === 'on' ? '1' : '0', name: 'Always Online' },
    'recording': { key: 'PRESENCE', value: action === 'on' ? '3' : '0', name: 'Auto Recording' },
    'bio': { key: 'AUTO_BIO', value: value, name: 'Auto Bio' },
    'react': { key: 'AUTO_REACT', value: value, name: 'Auto React' },
    'read': { key: 'AUTO_READ', value: value, name: 'Auto Read' },
    'chatbot': { key: 'CHATBOT', value: value, name: 'Chatbot' },
    'audiochatbot': { key: 'AUDIO_CHATBOT', value: value, name: 'Audio Chatbot' },
    'antilink': { key: 'GROUPANTILINK', value: value, name: 'Group Anti Link' },
    'welcome': { key: 'WELCOME_MESSAGE', value: value, name: 'Welcome Message' },
    'goodbye': { key: 'GOODBYE_MESSAGE', value: value, name: 'Goodbye Message' },
    'antidelete': { key: 'ANTIDELETE_SENT_INBOX', value: value, name: 'Anti Delete' },
    'autoreply': { key: 'AUTO_REPLY_STATUS', value: value, name: 'Auto reply status' },
    'privatemode': { key: 'PUBLIC_MODE', value: value, name: 'Public Mode' },
    'startmsg': { key: 'STARTING_BOT_MESSAGE', value: value, name: 'Starting Bot Message' },
    'autoreactstatus': { key: 'AUTO_REACT_STATUS', value: value, name: 'Auto React Status' },
    'autoreadstatus': { key: 'AUTO_READ_STATUS', value: value, name: 'Auto Read Status' },
    'autodownloadstatus': { key: 'AUTO_DOWNLOAD_STATUS', value: value, name: 'Auto Download Status' },
    'antideleterecover': { key: 'ANTIDELETE_RECOVER_CONVENTION', value: value, name: 'Anti Delete Recover Convention' },
    'rejectcall': { key: 'AUTO_REJECT_CALL', value: value, name: 'Auto Reject Call' }
};

    const setting = featureMap[feature];
    if (!setting) {
        return repondre(`❌ *Unknown feature: ${feature}*\n\nAvailable: typing, online, recording, bio, react, read, chatbot, audiochatbot, antilink, welcome, goodbye, antidelete`);
    }

    try {
        const success = await hybridConfig.setSetting(setting.key, setting.value);
        
        if (success) {
            await zk.sendMessage(chatId, {
                text: `✅ *${setting.name} is now ${action.toUpperCase()}*\n\n🔄 *Bot is restarting...*`
            });
            await hybridConfig.restartBot();
        } else {
            await zk.sendMessage(chatId, {
                text: `❌ *Failed to update ${setting.name}*`
            });
        }
    } catch (error) {
        console.error("Auto command error:", error);
        repondre(`⚠️ *Error: ${error.message}*`);
    }
});

// **NEW: Direct commands like "autotyping", "autobio", etc.**
const autoFeatures = ['autotyping', 'autobio', 'autoreact', 'autoread', 'chatbot', 'audiochatbot', 'antilink', 'welcome', 'goodbye', 'antidelete', 'alwaysonline', 'autorecording'];

autoFeatures.forEach(feature => {
    adams({
        nomCom: feature,
        categorie: "Control"
    }, async (chatId, zk, context) => {
        const { repondre, superUser, arg } = context;

        if (!superUser) {
            return repondre("🚫 *Access Denied!* This command is restricted to the bot owner.");
        }

        if (arg.length < 1) {
            return repondre(`📋 *Usage:* \`${feature} [on/off]\`\n\nExample: \`${feature} on\``);
        }

        const action = arg[0].toLowerCase();
        if (!['on', 'off'].includes(action)) {
            return repondre("❌ *Invalid action!* Use `on` or `off`");
        }

        const value = action === 'on' ? 'yes' : 'no';

        const featureMap = {
    'autotyping': { key: 'PRESENCE', value: action === 'on' ? '2' : '0', name: 'Auto Typing' },
    'alwaysonline': { key: 'PRESENCE', value: action === 'on' ? '1' : '0', name: 'Always Online' },
    'autorecording': { key: 'PRESENCE', value: action === 'on' ? '3' : '0', name: 'Auto Recording' },
    'autobio': { key: 'AUTO_BIO', value: value, name: 'Auto Bio' },
    'autoreact': { key: 'AUTO_REACT', value: value, name: 'Auto React' },
    'autoread': { key: 'AUTO_READ', value: value, name: 'Auto Read' },
    'chatbot': { key: 'CHATBOT', value: value, name: 'Chatbot' },
    'audiochatbot': { key: 'AUDIO_CHATBOT', value: value, name: 'Audio Chatbot' },
    'antilink': { key: 'GROUPANTILINK', value: value, name: 'Group Anti Link' },
    'welcome': { key: 'WELCOME_MESSAGE', value: value, name: 'Welcome Message' },
    'goodbye': { key: 'GOODBYE_MESSAGE', value: value, name: 'Goodbye Message' },
    'antidelete': { key: 'ANTIDELETE_SENT_INBOX', value: value, name: 'Anti Delete' },
    'autoreply': { key: 'AUTO_REPLY_STATUS', value: value, name: 'Auto reply status' },
    'privatemode': { key: 'PUBLIC_MODE', value: value, name: 'Public Mode' },
    'startmsg': { key: 'STARTING_BOT_MESSAGE', value: value, name: 'Starting Bot Message' },
    'autoreactstatus': { key: 'AUTO_REACT_STATUS', value: value, name: 'Auto React Status' },
    'autoreadstatus': { key: 'AUTO_READ_STATUS', value: value, name: 'Auto Read Status' },
    'autodownloadstatus': { key: 'AUTO_DOWNLOAD_STATUS', value: value, name: 'Auto Download Status' },
    'antideleterecover': { key: 'ANTIDELETE_RECOVER_CONVENTION', value: value, name: 'Anti Delete Recover Convention' },
    'anticall': { key: 'AUTO_REJECT_CALL', value: value, name: 'Anti call' }
};

        const setting = featureMap[feature];

        try {
            const success = await hybridConfig.setSetting(setting.key, setting.value);
            
            if (success) {
                await zk.sendMessage(chatId, {
                    text: `✅ *${setting.name} is now ${action.toUpperCase()}*\n\n🔄 *Bot is restarting...*`
                });
                await hybridConfig.restartBot();
            } else {
                await zk.sendMessage(chatId, {
                    text: `❌ *Failed to update ${setting.name}*`
                });
            }
        } catch (error) {
            console.error(`${feature} command error:`, error);
            repondre(`⚠️ *Error: ${error.message}*`);
        }
    });
});
