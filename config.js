const fs = require('fs-extra');
const { Sequelize } = require('sequelize');
if (fs.existsSync('config.env'))
    require('dotenv').config({ path: __dirname + '/config.env' });
const path = require("path");
const databasePath = path.join(__dirname, './database.db');
const DATABASE_URL = process.env.DATABASE_URL === undefined
    ? databasePath
    : process.env.DATABASE_URL;
module.exports = { session: process.env.SESSION_ID || '',
    PREFIX: process.env.PREFIX || ".",
    OWNER_NAME: process.env.OWNER_NAME || "Ibrahim Adams",
    OWNER_NUMBER : process.env.OWNER_NUMBER || "",              
    AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "yes",
    AUTO_DOWNLOAD_STATUS: process.env.AUTO_DOWNLOAD_STATUS || 'no',
    BOT : process.env.BOT_NAME || 'BMW_MD',
    URL : process.env.BOT_MENU_LINKS || 'https://files.catbox.moe/h2ydge.jpg',
    BWM_XMD: 'https://raw.githubusercontent.com/wevedo/makoui-numbers/refs/heads/main/index.html',
    GURL: 'https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y',
    AUTO_REPLY_STATUS: (process.env.AUTO_REPLY_STATUS || "no").toLowerCase(),               
    MODE: process.env.PUBLIC_MODE || "yes",
    PM_PERMIT: process.env.PM_PERMIT || 'yes',
    HEROKU_APP_NAME : process.env.HEROKU_APP_NAME,
    HEROKU_APY_KEY : process.env.HEROKU_APY_KEY ,
    WARN_COUNT : process.env.WARN_COUNT || '3' ,
    ETAT : process.env.PRESENCE || '',
    CHATBOT : process.env.CHATBOT || 'no',
    CHATBOT1 : process.env.AUDIO_CHATBOT || 'no',              
    DP : process.env.STARTING_BOT_MESSAGE || "yes",
    ANTIDELETE1 : process.env.ANTIDELETE_RECOVER_CONVENTION || 'no',
    ANTIDELETE2 : process.env.ANTIDELETE_SENT_INBOX || 'yes',
    GOODBYE_MESSAGE : process.env.GOODBYE_MESSAGE || 'no',
    ANTICALL : process.env.AUTO_REJECT_CALL || 'no',
    WELCOME_MESSAGE : process.env.WELCOME_MESSAGE || 'no',
    GROUP_ANTILINK2 : process.env.GROUPANTILINK_DELETE_ONLY || 'yes',
    GROUP_ANTILINK : process.env.GROUPANTILINK || 'no',
    STATUS_REACT_EMOJIS : process.env.STATUS_REACT_EMOJIS || "",
    REPLY_STATUS_TEXT: process.env.REPLY_STATUS_TEXT || "",             
                  AUTO_REACT : process.env.AUTO_REACT || 'no',
                  AUTO_REACT_STATUS : process.env.AUTO_REACT_STATUS || 'yes',
                  AUTO_REPLY : process.env.AUTO_REPLY || 'yes',
                  AUTO_READ : process.env.AUTO_READ || 'yes',
                  AUTO_SAVE_CONTACTS : process.env.AUTO_SAVE_CONTACTS || 'yes',
                  AUTO_REJECT_CALL : process.env.AUTO_REJECT_CALL || 'yes',
                  AUTO_BIO : process.env.AUTO_BIO || 'yes',
                  AUDIO_REPLY : process.env.AUDIO_REPLY || 'yes',
    URL: process.env.BOT_MENU_LINKS || 'https://files.catbox.moe/h2ydge.jpg',
    BOT_URL: process.env.BOT_URL ? process.env.BOT_URL.split(',') : [
    'https://res.cloudinary.com/dptzpfgtm/image/upload/v1748879883/whatsapp_uploads/e3eprzkzxhwfx7pmemr5.jpg',
    'https://res.cloudinary.com/dptzpfgtm/image/upload/v1748879901/whatsapp_uploads/hqagxk84idvf899rhpfj.jpg',
     'https://res.cloudinary.com/dptzpfgtm/image/upload/v1748879921/whatsapp_uploads/bms318aehnllm6sfdgql.jpg'
    ],
    
    MENU_TOP_LEFT: process.env.MENU_TOP_LEFT || "┌─❖",
    MENU_BOT_NAME_LINE: process.env.MENU_BOT_NAME_LINE || "│ ",
    MENU_BOTTOM_LEFT: process.env.MENU_BOTTOM_LEFT || "└┬❖", 
    MENU_GREETING_LINE: process.env.MENU_GREETING_LINE || "┌┤ ",
    MENU_DIVIDER: process.env.MENU_DIVIDER || "│└────────┈⳹",
    MENU_USER_LINE: process.env.MENU_USER_LINE || "│🕵️ ",
    MENU_DATE_LINE: process.env.MENU_DATE_LINE || "│📅 ",
    MENU_TIME_LINE: process.env.MENU_TIME_LINE || "│⏰ ",
    MENU_STATS_LINE: process.env.MENU_STATS_LINE || "│⭐ ",
    MENU_BOTTOM_DIVIDER: process.env.MENU_BOTTOM_DIVIDER || "└─────────────┈⳹",
    
    // Footer Configuration
    FOOTER: process.env.BOT_FOOTER || '\n\nFor more info visit: bwmxmd.online\n\n®2025 ʙᴡᴍ xᴍᴅ 🔥',
    DATABASE_URL,
    DATABASE: DATABASE_URL === databasePath
        ? "postgresql://postgres:bKlIqoOUWFIHOAhKxRWQtGfKfhGKgmRX@viaduct.proxy.rlwy.net:47738/railway" : "postgresql://postgres:bKlIqoOUWFIHOAhKxRWQtGfKfhGKgmRX@viaduct.proxy.rlwy.net:47738/railway",
   
};
let fichier = require.resolve(__filename);
fs.watchFile(fichier, () => {
    fs.unwatchFile(fichier);
    console.log(`mise à jour ${__filename}`);
    delete require.cache[fichier];
    require(fichier);
});
