
const { adams } = require('../Ibrahim/adams');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

// ===========================================
// 📱 PHONE TRACKER COMMAND
// ===========================================
function getEnhancedPhoneInfo(phoneNumber) {
    let cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    
    if (cleanNumber.startsWith('+')) {
        cleanNumber = cleanNumber.substring(1);
    }

    const countryCodes = {
        '254': { 
            country: 'Kenya', region: 'East Africa', capital: 'Nairobi',
            timezone: 'EAT (UTC+3)', currency: 'KES',
            carriers: {
                '70': { name: 'Safaricom', type: 'GSM', tech: '2G/3G/4G/5G' },
                '71': { name: 'Safaricom', type: 'GSM', tech: '2G/3G/4G/5G' },
                '72': { name: 'Safaricom', type: 'GSM', tech: '2G/3G/4G/5G' },
                '74': { name: 'Safaricom', type: 'GSM', tech: '2G/3G/4G/5G' },
                '75': { name: 'Airtel', type: 'GSM', tech: '2G/3G/4G' },
                '76': { name: 'Safaricom', type: 'GSM', tech: '2G/3G/4G/5G' },
                '77': { name: 'Telkom', type: 'GSM', tech: '3G/4G' },
                '78': { name: 'Airtel', type: 'GSM', tech: '2G/3G/4G' },
                '79': { name: 'Safaricom', type: 'GSM', tech: '2G/3G/4G/5G' }
            }
        },
        '1': { country: 'United States/Canada', region: 'North America', timezone: 'Multiple', currency: 'USD/CAD' },
        '44': { country: 'United Kingdom', region: 'Europe', timezone: 'GMT (UTC+0)', currency: 'GBP' },
        '91': { country: 'India', region: 'South Asia', timezone: 'IST (UTC+5:30)', currency: 'INR' },
        '234': { country: 'Nigeria', region: 'West Africa', timezone: 'WAT (UTC+1)', currency: 'NGN' },
        '27': { country: 'South Africa', region: 'Southern Africa', timezone: 'SAST (UTC+2)', currency: 'ZAR' },
        '33': { country: 'France', region: 'Europe', timezone: 'CET (UTC+1)', currency: 'EUR' },
        '49': { country: 'Germany', region: 'Europe', timezone: 'CET (UTC+1)', currency: 'EUR' },
        '81': { country: 'Japan', region: 'Asia', timezone: 'JST (UTC+9)', currency: 'JPY' },
        '86': { country: 'China', region: 'Asia', timezone: 'CST (UTC+8)', currency: 'CNY' }
    };

    let countryInfo = null;
    let countryCode = '';
    
    for (let len = 1; len <= 3; len++) {
        const code = cleanNumber.substring(0, len);
        if (countryCodes[code]) {
            countryInfo = countryCodes[code];
            countryCode = code;
            break;
        }
    }

    let carrierInfo = null;
    if (countryInfo?.carriers) {
        const networkCode = cleanNumber.substring(countryCode.length, countryCode.length + 2);
        carrierInfo = countryInfo.carriers[networkCode];
    }

    return {
        original: phoneNumber,
        cleaned: cleanNumber,
        countryCode: countryCode,
        countryInfo: countryInfo,
        carrierInfo: carrierInfo,
        isValid: countryInfo !== null,
        format: countryCode ? `+${countryCode} ${cleanNumber.substring(countryCode.length)}` : cleanNumber,
        numberType: countryCode === '254' ? 'Mobile' : 'Mobile'
    };
}

adams({
    nomCom: "track",
    aliases: ["track", "phone"],
    categorie: "New",
    reaction: "🔍",
    nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg, msgRepondu } = commandeOptions;

    let phoneNumber = '';
    const isGroup = dest.endsWith('@g.us');

    if (msgRepondu && !arg[0]) {
        const quotedSender = ms.message?.extendedTextMessage?.contextInfo?.participant;
        if (quotedSender) {
            phoneNumber = quotedSender.split('@')[0];
        } else {
            return repondre("❌ Could not extract number from replied message.");
        }
    } else if (arg[0]) {
        phoneNumber = arg.join('').replace(/\s/g, '');
    } else {
        return repondre("🔍 *PHONE TRACKER*\n\n*Usage:*\n• Reply: `tr`\n• Manual: `tr 254727716045`");
    }

    try {
        await repondre("🔍 *Analyzing...*");

        const phoneInfo = getEnhancedPhoneInfo(phoneNumber);

        if (!phoneInfo.isValid) {
            return repondre(`❌ *Invalid Number*\n\n*Input:* ${phoneNumber}`);
        }

        let response = "";
        
        if (isGroup) {
            response = "🔍 *GROUP ANALYSIS*\n━━━━━━━━━━━━━━━━━━━━━━\n\n";
            response += `📱 *Number:* ${phoneInfo.format}\n`;
            response += `🌍 *Country:* ${phoneInfo.countryInfo.country}\n`;
            response += `📍 *Region:* ${phoneInfo.countryInfo.region}\n`;
            if (phoneInfo.carrierInfo) response += `📡 *Network:* ${phoneInfo.carrierInfo.name}\n`;
            response += "\n🔒 *Limited info in groups*";
        } else {
            response = "🔍 *PHONE ANALYSIS*\n━━━━━━━━━━━━━━━━━━━━━━\n\n";
            response += `📱 *Number:* ${phoneInfo.format}\n`;
            response += `🌍 *Country:* ${phoneInfo.countryInfo.country}\n`;
            response += `📍 *Region:* ${phoneInfo.countryInfo.region}\n`;
            response += `🏛️ *Capital:* ${phoneInfo.countryInfo.capital || 'N/A'}\n`;
            response += `⏰ *Timezone:* ${phoneInfo.countryInfo.timezone}\n`;
            response += `💰 *Currency:* ${phoneInfo.countryInfo.currency}\n`;
            
            if (phoneInfo.carrierInfo) {
                response += `\n📡 *NETWORK*\n`;
                response += `*Carrier:* ${phoneInfo.carrierInfo.name}\n`;
                response += `*Type:* ${phoneInfo.carrierInfo.type}\n`;
                response += `*Tech:* ${phoneInfo.carrierInfo.tech}\n`;
            }
            
            response += "\n⚠️ *Educational purpose only*";
        }

        await zk.sendMessage(dest, { text: response }, { quoted: ms });

    } catch (error) {
        await repondre("❌ Analysis failed. Try again.");
    }
});

// ===========================================
// 🔮 MIND READER COMMAND
// ===========================================
adams({
    nomCom: "readmind",
    aliases: ["mind", "read"],
    categorie: "New",
    reaction: "🔮",
    nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre } = commandeOptions;

    const predictions = [
        "You're thinking about someone special",
        "You just checked your battery",
        "You're craving your favorite food",
        "You're wondering how this works",
        "You have an unread message",
        "You're in a comfortable position",
        "You're planning something tomorrow",
        "You touched your face recently",
        "You want to listen to music",
        "You're curious about this bot"
    ];

    const behaviors = [
        "sending a laugh emoji", "asking how this works", "sharing with friends",
        "checking other commands", "looking around your room", "taking a screenshot",
        "reading this twice", "typing 'wow'", "wanting to try again"
    ];

    try {
        await repondre("🔮 *Reading your mind...*");
        await new Promise(resolve => setTimeout(resolve, 2000));

        const prediction = predictions[Math.floor(Math.random() * predictions.length)];
        const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
        const confidence = Math.floor(Math.random() * 20) + 80;

        let response = `🔮 *MIND READ COMPLETE*\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        response += `🧠 *Current Thought:*\n${prediction}\n\n`;
        response += `🎯 *Next Action:*\n${behavior}\n\n`;
        response += `📊 *Confidence:* ${confidence}%\n`;
        response += `⚡ *Method:* Quantum brain scan\n\n`;
        response += `🎲 *Try again for new predictions!*`;

        await zk.sendMessage(dest, { text: response }, { quoted: ms });

    } catch (error) {
        await repondre("🔮 Mind reading blocked. Clear your thoughts and retry.");
    }
});

// ===========================================
// 👥 DIGITAL CLONE COMMAND
// ===========================================
adams({
    nomCom: "clone",
    aliases: ["clone", "twin"],
    categorie: "New",
    reaction: "👥",
    nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, msgRepondu } = commandeOptions;

    if (!msgRepondu) {
        return repondre("👥 Reply to someone's message to clone them!");
    }

    try {
        await repondre("👥 *Cloning in progress...*");
        await new Promise(resolve => setTimeout(resolve, 3000));

        const sender = msgRepondu.key.participant || msgRepondu.key.remoteJid;
        const userName = sender.split('@')[0];

        const personalities = ["witty", "cheerful", "mysterious", "funny", "calm", "energetic"];
        const traits = ["sends memes", "asks questions", "uses emojis", "sends voice notes", "replies fast"];

        const personality = personalities[Math.floor(Math.random() * personalities.length)];
        const trait = traits[Math.floor(Math.random() * traits.length)];
        const similarity = Math.floor(Math.random() * 20) + 80;

        let response = `👥 *CLONE CREATED*\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        response += `🎭 *Original:* ${userName}\n`;
        response += `🧬 *Personality:* ${personality}\n`;
        response += `⚡ *Main Trait:* ${trait}\n`;
        response += `🎯 *Similarity:* ${similarity}%\n`;
        response += `🤖 *Status:* Active and learning\n`;
        response += `💭 *First Thought:* "Why am I here?"\n\n`;
        response += `⚠️ *Warning:* Clone may develop own opinions`;

        await zk.sendMessage(dest, { text: response }, { quoted: ms });

    } catch (error) {
        await repondre("👥 Cloning failed. User too complex to replicate.");
    }
});

// ===========================================
// ⚡ REALITY GLITCH COMMAND
// ===========================================
adams({
    nomCom: "matrix",
    aliases: ["glitch", "matrix"],
    categorie: "New",
    reaction: "⚡",
    nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre } = commandeOptions;

    try {
        await repondre("📱 *System normal...*");
        await new Promise(resolve => setTimeout(resolve, 1500));

        await repondre("📱 *Syst3m n0rm@l...*");
        await new Promise(resolve => setTimeout(resolve, 1500));

        await repondre("📱 *Sy5t3M 3RR0R...*\n\n⚠️ GLITCH DETECTED ⚠️");
        await new Promise(resolve => setTimeout(resolve, 2000));

        let glitch = `⚡ *REALITY BREACH*\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        glitch += `🔴 *MATRIX ERROR*\n`;
        glitch += `Location: Chat ${dest.substring(0, 8)}...\n`;
        glitch += `Status: R3@L!TY_C0RRUPT3D\n\n`;
        glitch += `⚡ *Anomalies:*\n• Time loop detected\n• Reality.exe crashed\n• Matrix code corrupted\n\n`;
        glitch += `🔧 *Fixing:*\n[████████░░] 80%\n\n`;
        glitch += `⚠️ Y0u s@w n07h!ng\n🔄 R3b007!ng...`;

        await zk.sendMessage(dest, { text: glitch }, { quoted: ms });

        await new Promise(resolve => setTimeout(resolve, 3000));
        await repondre("📱 *System normal...*\n\n✅ Reality restored.\n🤫 Nothing happened here.");

    } catch (error) {
        await repondre("⚡ Reality.exe stopped working. Restart universe needed.");
    }
});

// ===========================================
// 🔍 PERSONALITY SCANNER COMMAND
// ===========================================
adams({
    nomCom: "scan2",
    aliases: ["scan2", "analyze"],
    categorie: "New",
    reaction: "🔍",
    nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, msgRepondu } = commandeOptions;

    if (!msgRepondu) {
        return repondre("🔍 Reply to someone's message to scan personality!");
    }

    try {
        await repondre("🔍 *Scanning personality...*");
        await new Promise(resolve => setTimeout(resolve, 3000));

        const message = msgRepondu.conversation || msgRepondu.extendedTextMessage?.text || "No text";
        const sender = msgRepondu.key.participant?.split('@')[0] || 'Unknown';

        const traits = [];
        if (message.includes('😂')) traits.push('Humorous');
        if (message.length > 50) traits.push('Expressive');
        if (message.includes('!')) traits.push('Enthusiastic');
        if (message.includes('?')) traits.push('Curious');
        if (traits.length === 0) traits.push('Mysterious');

        const personalities = ['Introvert', 'Extrovert', 'Ambivert'];
        const moods = ['Happy', 'Calm', 'Excited', 'Thoughtful'];
        
        const personality = personalities[Math.floor(Math.random() * personalities.length)];
        const mood = moods[Math.floor(Math.random() * moods.length)];

        let response = `🔍 *SCAN COMPLETE*\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        response += `👤 *Subject:* ${sender}\n`;
        response += `🎭 *Type:* ${personality}\n`;
        response += `😊 *Mood:* ${mood}\n`;
        response += `⭐ *Traits:* ${traits.join(', ')}\n\n`;
        response += `📊 *Scores:*\n`;
        response += `• Social: ${Math.floor(Math.random() * 30) + 70}%\n`;
        response += `• Creative: ${Math.floor(Math.random() * 40) + 60}%\n`;
        response += `• Logic: ${Math.floor(Math.random() * 35) + 65}%\n\n`;
        response += `💡 *Style:* ${message.length > 50 ? 'Detailed' : 'Concise'}`;

        await zk.sendMessage(dest, { text: response }, { quoted: ms });

    } catch (error) {
        await repondre("🔍 Scan failed. Subject too complex to analyze.");
    }
});

// ===========================================
// 📁 FILE CREATOR COMMAND
// ===========================================
adams({
    nomCom: "tofile",
    aliases: ["file", "create"],
    categorie: "New",
    reaction: "📁",
    nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, msgRepondu, arg } = commandeOptions;

    if (!msgRepondu) {
        return repondre("📁 Reply to a message with code/text to create a file!\n\n*Usage:* fc filename.js\n*Supported:* js, html, css, json, md, txt, py, php");
    }

    const filename = arg[0] || 'untitled.txt';
    const content = msgRepondu.conversation || msgRepondu.extendedTextMessage?.text;

    if (!content) {
        return repondre("❌ No text content found in the replied message.");
    }

    try {
        await repondre("📁 *Creating file...*");

        // Get file extension
        const ext = filename.split('.').pop()?.toLowerCase() || 'txt';
        const supportedExts = ['js', 'html', 'css', 'json', 'md', 'txt', 'py', 'php', 'xml', 'sql', 'yaml'];

        if (!supportedExts.includes(ext)) {
            return repondre(`❌ Unsupported file type: .${ext}\n\n*Supported:* ${supportedExts.join(', ')}`);
        }

        // Create temp file
        const tempPath = path.join(__dirname, `temp_${Date.now()}_${filename}`);
        await fs.writeFile(tempPath, content, 'utf8');

        // Send as document
        await zk.sendMessage(dest, {
            document: fs.readFileSync(tempPath),
            fileName: filename,
            mimetype: getMimeType(ext),
            caption: `📁 *File Created Successfully*\n\n*Name:* ${filename}\n*Type:* ${ext.toUpperCase()}\n*Size:* ${content.length} characters\n\n> BWM-XMD File Creator`
        }, { quoted: ms });

        // Clean up
        fs.unlinkSync(tempPath);

    } catch (error) {
        await repondre(`❌ File creation failed: ${error.message}`);
    }
});

function getMimeType(ext) {
    const mimeTypes = {
        'js': 'application/javascript',
        'html': 'text/html',
        'css': 'text/css',
        'json': 'application/json',
        'md': 'text/markdown',
        'txt': 'text/plain',
        'py': 'text/x-python',
        'php': 'application/x-httpd-php',
        'xml': 'application/xml',
        'sql': 'application/sql',
        'yaml': 'application/x-yaml'
    };
    return mimeTypes[ext] || 'text/plain';
}

// ===========================================
// 🎯 FORTUNE MACHINE COMMAND
// ===========================================
adams({
    nomCom: "predict",
    aliases: ["fortune", "predict"],
    categorie: "New",
    reaction: "🔮",
    nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg } = commandeOptions;

    const categories = ['love', 'money', 'career', 'health', 'family'];
    const category = arg[0]?.toLowerCase() || categories[Math.floor(Math.random() * categories.length)];

    const fortunes = {
        love: [
            "Someone special is thinking about you right now",
            "A message from your past will change your future",
            "Your next relationship starts through a friend",
            "Love will find you in an unexpected place"
        ],
        money: [
            "Unexpected income surprises you within 3 weeks",
            "A small risk leads to big financial improvement",
            "Someone will remember to pay you back soon",
            "A forgotten investment will finally pay off"
        ],
        career: [
            "New opportunity comes from unexpected source",
            "Your skills get recognized very soon",
            "A forgotten project becomes very important",
            "Your next job is in a field you never considered"
        ],
        health: [
            "Your energy levels will significantly improve",
            "A healthy habit you start now changes everything",
            "Good news about your health is coming",
            "You'll discover a new way to feel better"
        ],
        family: [
            "A family member will surprise you positively",
            "Old family connections will be renewed",
            "Family gatherings bring unexpected joy",
            "You'll be the bridge for family harmony"
        ]
    };

    try {
        await repondre("🔮 *Fortune calculating...*");
        await new Promise(resolve => setTimeout(resolve, 2000));

        const fortune = fortunes[category] ? 
            fortunes[category][Math.floor(Math.random() * fortunes[category].length)] :
            "Something amazing awaits you very soon";

        const accuracy = Math.floor(Math.random() * 15) + 85;
        const timeframes = ['24 hours', '3 days', '1 week', '2 weeks', 'this month'];
        const timeframe = timeframes[Math.floor(Math.random() * timeframes.length)];

        let response = `🔮 *FORTUNE REVEALED*\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        response += `🎯 *Category:* ${category.toUpperCase()}\n`;
        response += `📊 *Accuracy:* ${accuracy}%\n`;
        response += `⏰ *Timeframe:* ${timeframe}\n\n`;
        response += `🌟 *Your Fortune:*\n${fortune}\n\n`;
        response += `🔥 *Energy:* ${['High', 'Very High', 'Extreme'][Math.floor(Math.random() * 3)]}\n`;
        response += `🎲 *Luck:* ${Math.floor(Math.random() * 30) + 70}%\n\n`;
        response += `💫 *Bonus:* Trust your instincts this week\n\n`;
        response += `🔄 *Categories:* love, money, career, health, family`;

        await zk.sendMessage(dest, { text: response }, { quoted: ms });

    } catch (error) {
        await repondre("🔮 Fortune too powerful to display. Cosmic servers overloaded.");
    }
});

// ===========================================
// 🌐 IP TRACKER COMMAND
// ===========================================
adams({
    nomCom: "ip",
    aliases: ["track", "location"],
    categorie: "New",
    reaction: "🌐",
    nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg } = commandeOptions;

    if (!arg[0]) {
        return repondre("🌐 *IP TRACKER*\n\n*Usage:* ip 8.8.8.8\n\n*Example IPs to try:*\n• 8.8.8.8 (Google DNS)\n• 1.1.1.1 (Cloudflare)\n• 208.67.222.222 (OpenDNS)");
    }

    const ip = arg[0];
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    if (!ipRegex.test(ip)) {
        return repondre("❌ Invalid IP address format. Use: xxx.xxx.xxx.xxx");
    }

    try {
        await repondre("🌐 *Tracking IP address...*");

        // Use free IP API
        const response = await axios.get(`http://ip-api.com/json/${ip}`);
        const data = response.data;

        if (data.status === 'fail') {
            return repondre(`❌ IP lookup failed: ${data.message}`);
        }

        let result = `🌐 *IP ANALYSIS COMPLETE*\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        result += `🔍 *IP Address:* ${ip}\n`;
        result += `🌍 *Country:* ${data.country || 'Unknown'}\n`;
        result += `🏙️ *City:* ${data.city || 'Unknown'}\n`;
        result += `📍 *Region:* ${data.regionName || 'Unknown'}\n`;
        result += `🏢 *ISP:* ${data.isp || 'Unknown'}\n`;
        result += `🔗 *Organization:* ${data.org || 'Unknown'}\n`;
        result += `⏰ *Timezone:* ${data.timezone || 'Unknown'}\n`;
        result += `📮 *Zip Code:* ${data.zip || 'Unknown'}\n`;
        
        if (data.lat && data.lon) {
            result += `🗺️ *Coordinates:* ${data.lat}, ${data.lon}\n`;
        }

        result += `\n🔒 *Security Info:*\n`;
        result += `*Proxy:* ${data.proxy ? 'Yes' : 'No'}\n`;
        result += `*Mobile:* ${data.mobile ? 'Yes' : 'No'}\n\n`;
        result += `⚠️ *Note:* Location is approximate\n`;
        result += `🎯 *Educational purpose only*`;

        await zk.sendMessage(dest, {
            text: result,
            contextInfo: {
                externalAdReply: {
                    title: "🌐 IP Tracker Results",
                    body: `${data.country} • ${data.city} • ${data.isp}`,
                    mediaType: 1,
                    thumbnailUrl: "https://files.catbox.moe/sd49da.jpg",
                    sourceUrl: "https://bwmxmd.online",
                    renderLargerThumbnail: false,
                    showAdAttribution: true,
                }
            }
        }, { quoted: ms });

    } catch (error) {
        await repondre(`❌ IP tracking failed: ${error.message}`);
    }
});

// ===========================================
// 🎨 QR CODE GENERATOR COMMAND
// ===========================================
adams({
    nomCom: "qr",
    aliases: ["qrcode", "generate"],
    categorie: "New",
    reaction: "📱",
    nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg } = commandeOptions;

    if (!arg[0]) {
        return repondre("📱 *QR CODE GENERATOR*\n\n*Usage:* qr Your text here\n\n*Examples:*\n• qr Hello World\n• qr https://google.com\n• qr My phone: +254727716045");
    }

    const text = arg.join(' ');

    if (text.length > 500) {
        return repondre("❌ Text too long. Maximum 500 characters.");
    }

    try {
        await repondre("📱 *Generating QR code...*");

        // Use QR API service
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(text)}`;

        let caption = `📱 *QR CODE GENERATED*\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        caption += `📝 *Content:* ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}\n`;
        caption += `📏 *Size:* 400x400 pixels\n`;
        caption += `🔢 *Characters:* ${text.length}\n`;
        caption += `⚡ *Type:* ${text.startsWith('http') ? 'URL' : text.includes('@') ? 'Email' : text.match(/^\+?[\d\s-]+$/) ? 'Phone' : 'Text'}\n\n`;
        caption += `📱 *Scan with any QR reader*\n`;
        caption += `> BWM-XMD QR Generator`;

        await zk.sendMessage(dest, {
            image: { url: qrUrl },
            caption: caption,
            contextInfo: {
                externalAdReply: {
                    title: "📱 QR Code Generated",
                    body: `${text.length} characters • Ready to scan`,
                    mediaType: 1,
                    thumbnailUrl: qrUrl,
                    sourceUrl: "https://bwmxmd.online",
                    renderLargerThumbnail: false,
                    showAdAttribution: true,
                }
            }
        }, { quoted: ms });

    } catch (error) {
        await repondre(`❌ QR generation failed: ${error.message}`);
    }
});

// ===========================================
// 🎭 FAKE SYSTEM INFO COMMAND
// ===========================================
adams({
    nomCom: "system",
    aliases: ["system", "info"],
    categorie: "New",
    reaction: "💻",
    nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre } = commandeOptions;

    try {
        await repondre("💻 *Scanning system...*");
        await new Promise(resolve => setTimeout(resolve, 2000));

        const cpuUsage = Math.floor(Math.random() * 30) + 20;
        const ramUsage = Math.floor(Math.random() * 40) + 30;
        const storage = Math.floor(Math.random() * 50) + 25;
        const uptime = Math.floor(Math.random() * 72) + 1;

        let response = `💻 *SYSTEM INFORMATION*\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        response += `🖥️ *Hardware:*\n`;
        response += `CPU: Intel Xeon E5-2696 v4\n`;
        response += `RAM: 64GB DDR4 ECC\n`;
        response += `Storage: 2TB NVMe SSD\n`;
        response += `GPU: NVIDIA RTX 4090\n\n`;
        
        response += `📊 *Performance:*\n`;
        response += `CPU Usage: ${cpuUsage}%\n`;
        response += `RAM Usage: ${ramUsage}%\n`;
        response += `Storage: ${storage}% used\n`;
        response += `Temperature: ${Math.floor(Math.random() * 20) + 35}°C\n\n`;
        
        response += `🌐 *Network:*\n`;
        response += `Connection: 10 Gbps Fiber\n`;
        response += `Latency: ${Math.floor(Math.random() * 10) + 5}ms\n`;
        response += `Packets: ${Math.floor(Math.random() * 1000000) + 500000} sent\n\n`;
        
        response += `⏱️ *Status:*\n`;
        response += `Uptime: ${uptime} hours\n`;
        response += `Load: ${(Math.random() * 2).toFixed(2)}\n`;
        response += `Processes: ${Math.floor(Math.random() * 200) + 100}\n\n`;
        
        response += `🔒 *Security:*\n`;
        response += `Firewall: Active\n`;
        response += `Antivirus: Protected\n`;
        response += `SSL: Enabled\n\n`;
        
        response += `> BWM-XMD System Monitor`;

        await zk.sendMessage(dest, { text: response }, { quoted: ms });

    } catch (error) {
        await repondre("💻 System scan blocked by security protocols.");
    }
});
