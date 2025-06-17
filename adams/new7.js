const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const path = require('path');


// Phone number validation and info extraction
function getPhoneInfo(phoneNumber) {
    // Clean the number
    let cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    
    // Country codes database (partial list)
    const countryCodes = {
        '1': { country: 'United States/Canada', region: 'North America' },
        '7': { country: 'Russia/Kazakhstan', region: 'Europe/Asia' },
        '20': { country: 'Egypt', region: 'Africa' },
        '27': { country: 'South Africa', region: 'Africa' },
        '30': { country: 'Greece', region: 'Europe' },
        '31': { country: 'Netherlands', region: 'Europe' },
        '32': { country: 'Belgium', region: 'Europe' },
        '33': { country: 'France', region: 'Europe' },
        '34': { country: 'Spain', region: 'Europe' },
        '36': { country: 'Hungary', region: 'Europe' },
        '39': { country: 'Italy', region: 'Europe' },
        '40': { country: 'Romania', region: 'Europe' },
        '41': { country: 'Switzerland', region: 'Europe' },
        '43': { country: 'Austria', region: 'Europe' },
        '44': { country: 'United Kingdom', region: 'Europe' },
        '45': { country: 'Denmark', region: 'Europe' },
        '46': { country: 'Sweden', region: 'Europe' },
        '47': { country: 'Norway', region: 'Europe' },
        '48': { country: 'Poland', region: 'Europe' },
        '49': { country: 'Germany', region: 'Europe' },
        '51': { country: 'Peru', region: 'South America' },
        '52': { country: 'Mexico', region: 'North America' },
        '53': { country: 'Cuba', region: 'Caribbean' },
        '54': { country: 'Argentina', region: 'South America' },
        '55': { country: 'Brazil', region: 'South America' },
        '56': { country: 'Chile', region: 'South America' },
        '57': { country: 'Colombia', region: 'South America' },
        '58': { country: 'Venezuela', region: 'South America' },
        '60': { country: 'Malaysia', region: 'Asia' },
        '61': { country: 'Australia', region: 'Oceania' },
        '62': { country: 'Indonesia', region: 'Asia' },
        '63': { country: 'Philippines', region: 'Asia' },
        '64': { country: 'New Zealand', region: 'Oceania' },
        '65': { country: 'Singapore', region: 'Asia' },
        '66': { country: 'Thailand', region: 'Asia' },
        '81': { country: 'Japan', region: 'Asia' },
        '82': { country: 'South Korea', region: 'Asia' },
        '84': { country: 'Vietnam', region: 'Asia' },
        '86': { country: 'China', region: 'Asia' },
        '90': { country: 'Turkey', region: 'Europe/Asia' },
        '91': { country: 'India', region: 'Asia' },
        '92': { country: 'Pakistan', region: 'Asia' },
        '93': { country: 'Afghanistan', region: 'Asia' },
        '94': { country: 'Sri Lanka', region: 'Asia' },
        '95': { country: 'Myanmar', region: 'Asia' },
        '98': { country: 'Iran', region: 'Asia' },
        '212': { country: 'Morocco', region: 'Africa' },
        '213': { country: 'Algeria', region: 'Africa' },
        '216': { country: 'Tunisia', region: 'Africa' },
        '218': { country: 'Libya', region: 'Africa' },
        '220': { country: 'Gambia', region: 'Africa' },
        '221': { country: 'Senegal', region: 'Africa' },
        '222': { country: 'Mauritania', region: 'Africa' },
        '223': { country: 'Mali', region: 'Africa' },
        '224': { country: 'Guinea', region: 'Africa' },
        '225': { country: 'Ivory Coast', region: 'Africa' },
        '226': { country: 'Burkina Faso', region: 'Africa' },
        '227': { country: 'Niger', region: 'Africa' },
        '228': { country: 'Togo', region: 'Africa' },
        '229': { country: 'Benin', region: 'Africa' },
        '230': { country: 'Mauritius', region: 'Africa' },
        '231': { country: 'Liberia', region: 'Africa' },
        '232': { country: 'Sierra Leone', region: 'Africa' },
        '233': { country: 'Ghana', region: 'Africa' },
        '234': { country: 'Nigeria', region: 'Africa' },
        '235': { country: 'Chad', region: 'Africa' },
        '236': { country: 'Central African Republic', region: 'Africa' },
        '237': { country: 'Cameroon', region: 'Africa' },
        '238': { country: 'Cape Verde', region: 'Africa' },
        '239': { country: 'São Tomé and Príncipe', region: 'Africa' },
        '240': { country: 'Equatorial Guinea', region: 'Africa' },
        '241': { country: 'Gabon', region: 'Africa' },
        '242': { country: 'Republic of the Congo', region: 'Africa' },
        '243': { country: 'Democratic Republic of the Congo', region: 'Africa' },
        '244': { country: 'Angola', region: 'Africa' },
        '245': { country: 'Guinea-Bissau', region: 'Africa' },
        '246': { country: 'British Indian Ocean Territory', region: 'Africa' },
        '248': { country: 'Seychelles', region: 'Africa' },
        '249': { country: 'Sudan', region: 'Africa' },
        '250': { country: 'Rwanda', region: 'Africa' },
        '251': { country: 'Ethiopia', region: 'Africa' },
        '252': { country: 'Somalia', region: 'Africa' },
        '253': { country: 'Djibouti', region: 'Africa' },
        '254': { country: 'Kenya', region: 'Africa', carriers: ['Safaricom', 'Airtel', 'Telkom'] },
        '255': { country: 'Tanzania', region: 'Africa' },
        '256': { country: 'Uganda', region: 'Africa' },
        '257': { country: 'Burundi', region: 'Africa' },
        '258': { country: 'Mozambique', region: 'Africa' },
        '260': { country: 'Zambia', region: 'Africa' },
        '261': { country: 'Madagascar', region: 'Africa' },
        '262': { country: 'Réunion/Mayotte', region: 'Africa' },
        '263': { country: 'Zimbabwe', region: 'Africa' },
        '264': { country: 'Namibia', region: 'Africa' },
        '265': { country: 'Malawi', region: 'Africa' },
        '266': { country: 'Lesotho', region: 'Africa' },
        '267': { country: 'Botswana', region: 'Africa' },
        '268': { country: 'Eswatini', region: 'Africa' },
        '269': { country: 'Comoros', region: 'Africa' },
        '290': { country: 'Saint Helena', region: 'Africa' }
    };

    // Remove + if present
    if (cleanNumber.startsWith('+')) {
        cleanNumber = cleanNumber.substring(1);
    }

    // Find country code
    let countryInfo = null;
    let countryCode = '';
    
    // Try different country code lengths (1-3 digits)
    for (let len = 1; len <= 3; len++) {
        const code = cleanNumber.substring(0, len);
        if (countryCodes[code]) {
            countryInfo = countryCodes[code];
            countryCode = code;
            break;
        }
    }

    // Kenya specific analysis
    let kenyanCarrier = '';
    if (countryCode === '254') {
        const networkCode = cleanNumber.substring(3, 5);
        const networkCodes = {
            '70': 'Safaricom',
            '71': 'Safaricom', 
            '72': 'Safaricom',
            '74': 'Safaricom',
            '75': 'Airtel',
            '76': 'Safaricom',
            '77': 'Telkom',
            '78': 'Airtel',
            '79': 'Safaricom',
            '11': 'Safaricom',
            '10': 'Safaricom'
        };
        kenyanCarrier = networkCodes[networkCode] || 'Unknown Carrier';
    }

    return {
        original: phoneNumber,
        cleaned: cleanNumber,
        countryCode: countryCode,
        country: countryInfo?.country || 'Unknown',
        region: countryInfo?.region || 'Unknown',
        carrier: kenyanCarrier,
        isValid: countryInfo !== null,
        format: countryCode ? `+${countryCode} ${cleanNumber.substring(countryCode.length)}` : cleanNumber
    };
}

adams({
    nomCom: "track",
    aliases: ["phoneinfo", "numberinfo", "lookup"],
    categorie: "New",
    reaction: "📱",
    nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg, msgRepondu } = commandeOptions;

    let phoneNumber = '';

    // Check if replying to a message
    if (msgRepondu && !arg[0]) {
        // Extract number from quoted message sender
        const quotedSender = ms.message?.extendedTextMessage?.contextInfo?.participant;
        if (quotedSender) {
            phoneNumber = quotedSender.split('@')[0];
        } else {
            return repondre("❌ Could not extract phone number from the replied message.");
        }
    } else if (arg[0]) {
        // Manual number input
        phoneNumber = arg.join('');
    } else {
        return repondre("📱 *PHONE NUMBER TRACKER*\n\n*Usage:*\n• Reply to a message: `track`\n• Manual lookup: `track 254727716045`\n\n*Example:* track +1234567890");
    }

    try {
        await repondre("🔍 *Analyzing phone number...*\n\nPlease wait while I gather information...");

        const phoneInfo = getPhoneInfo(phoneNumber);

        if (!phoneInfo.isValid) {
            return repondre(`❌ *Invalid Phone Number*\n\n*Number:* ${phoneNumber}\n\nPlease provide a valid international phone number.`);
        }

        let responseText = "📱 *PHONE NUMBER ANALYSIS*\n";
        responseText += "━━━━━━━━━━━━━━━━━━━━━━\n\n";
        
        responseText += "📋 *BASIC INFORMATION*\n";
        responseText += `*Original:* ${phoneInfo.original}\n`;
        responseText += `*Formatted:* ${phoneInfo.format}\n`;
        responseText += `*Country Code:* +${phoneInfo.countryCode}\n`;
        responseText += `*Country:* ${phoneInfo.country}\n`;
        responseText += `*Region:* ${phoneInfo.region}\n`;

        if (phoneInfo.carrier) {
            responseText += `*Carrier:* ${phoneInfo.carrier}\n`;
        }

        responseText += "\n🌍 *LOCATION INFORMATION*\n";
        responseText += `*Country:* ${phoneInfo.country}\n`;
        responseText += `*Continent:* ${phoneInfo.region}\n`;

        // Add Kenya-specific details
        if (phoneInfo.countryCode === '254') {
            responseText += `*Time Zone:* EAT (UTC+3)\n`;
            responseText += `*Currency:* Kenyan Shilling (KES)\n`;
            responseText += `*Language:* English, Swahili\n`;
        }

        responseText += "\n⚠️ *PRIVACY NOTICE*\n";
        responseText += "This shows only publicly available information.\n";
        responseText += "No personal data or exact location is accessed.\n";
        
        responseText += "\n━━━━━━━━━━━━━━━━━━━━━━\n";
        responseText += "> © BWM-XMD Phone Tracker";

        await zk.sendMessage(dest, {
            text: responseText,
            contextInfo: {
                externalAdReply: {
                    title: `📱 ${phoneInfo.country} Phone Number`,
                    body: `${phoneInfo.format} • ${phoneInfo.carrier || 'Carrier Unknown'}`,
                    mediaType: 1,
                    thumbnailUrl: "https://files.catbox.moe/sd49da.jpg",
                    sourceUrl: "https://bwmxmd.online",
                    renderLargerThumbnail: false,
                    showAdAttribution: true,
                 }
            }
        }, { quoted: ms });

    } catch (error) {
        console.error("Error in track command:", error);
        await repondre(`❌ *Analysis Failed*\n\nError: ${error.message}\n\nPlease try again with a valid phone number.`);
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
    nomCom: "matrix2",
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
// 📁 FILE CREATOR COMMAND
// ===========================================
adams({
    nomCom: "tofile",
    aliases: ["file", "create", "fc"],
    categorie: "New",
    reaction: "📁",
    nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, msgRepondu, arg } = commandeOptions;

    if (!msgRepondu) {
        return repondre("📁 Reply to a message to create a file!\n\n*Usage:* .fc filename.ext\n*Supported text files:* js, html, css, json, md, txt, py, php, xml, sql, yaml\n*Supported media:* jpg, png, mp3, mp4, gif, pdf\n\nExample: .fc index.js (for code) or .fc audio.mp3 (for media)");
    }

    // Get filename or use default
    let filename = arg[0] || 'file.txt';
    
    // Ensure filename has an extension
    if (!filename.includes('.')) {
        filename += '.txt'; // Default to txt if no extension
    }

    try {
        await repondre("📁 *Processing file creation...*");

        // Get file extension
        const ext = filename.split('.').pop().toLowerCase();
        
        // Supported extensions
        const supportedText = ['js', 'html', 'css', 'json', 'md', 'txt', 'py', 'php', 'xml', 'sql', 'yaml'];
        const supportedMedia = ['jpg', 'jpeg', 'png', 'mp3', 'mp4', 'gif', 'pdf', 'webp'];
        
        // Check if media message
        if (msgRepondu.imageMessage || msgRepondu.audioMessage || msgRepondu.videoMessage) {
            if (!supportedMedia.includes(ext)) {
                return repondre(`❌ Unsupported media type: .${ext}\n\n*Supported media:* ${supportedMedia.join(', ')}`);
            }
            
            // Handle media files
            let mediaType, mediaBuffer;
            if (msgRepondu.imageMessage) {
                mediaType = 'image';
                mediaBuffer = await zk.downloadAndSaveMediaMessage(msgRepondu.imageMessage);
            } else if (msgRepondu.audioMessage) {
                mediaType = 'audio';
                mediaBuffer = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
            } else if (msgRepondu.videoMessage) {
                mediaType = 'video';
                mediaBuffer = await zk.downloadAndSaveMediaMessage(msgRepondu.videoMessage);
            }
            
            // Send as document
            await zk.sendMessage(dest, {
                document: fs.readFileSync(mediaBuffer),
                fileName: filename,
                mimetype: getMimeType(ext),
                caption: `📁 *File Created Successfully*\n\n*Name:* ${filename}\n*Type:* ${ext.toUpperCase()}\n*Size:* ${fs.statSync(mediaBuffer).size} bytes\n\n> BWM-XMD File Creator`
            }, { quoted: ms });
            
            // Clean up
            fs.unlinkSync(mediaBuffer);
            
        } else {
            // Handle text/code files
            if (!supportedText.includes(ext)) {
                return repondre(`❌ Unsupported file type: .${ext}\n\n*Supported text files:* ${supportedText.join(', ')}`);
            }
            
            const content = msgRepondu.conversation || msgRepondu.extendedTextMessage?.text;
            if (!content) {
                return repondre("❌ No text content found in the replied message.");
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
        }
    } catch (error) {
        console.error("File creation error:", error);
        await repondre(`❌ File creation failed: ${error.message}`);
    }
});

// Helper function to get MIME type
function getMimeType(ext) {
    const mimeTypes = {
        'txt': 'text/plain',
        'js': 'application/javascript',
        'html': 'text/html',
        'css': 'text/css',
        'json': 'application/json',
        'md': 'text/markdown',
        'py': 'text/x-python',
        'php': 'application/x-php',
        'xml': 'application/xml',
        'sql': 'application/sql',
        'yaml': 'application/yaml',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'mp3': 'audio/mpeg',
        'mp4': 'video/mp4',
        'gif': 'image/gif',
        'pdf': 'application/pdf',
        'webp': 'image/webp'
    };
    return mimeTypes[ext] || 'application/octet-stream';
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

