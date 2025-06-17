const { adams } = require("../Ibrahim/adams");
const axios = require("axios");

// ================================
// GLOBAL PHONE TRACKER - REPLY MODE
// ================================

const globalCountries = {
    "1": { name: "United States/Canada", flag: "🇺🇸🇨🇦", region: "North America", carriers: ["Verizon", "AT&T", "T-Mobile", "Rogers", "Bell"] },
    "44": { name: "United Kingdom", flag: "🇬🇧", region: "Europe", carriers: ["EE", "O2", "Vodafone", "Three"] },
    "33": { name: "France", flag: "🇫🇷", region: "Europe", carriers: ["Orange", "SFR", "Bouygues", "Free"] },
    "49": { name: "Germany", flag: "🇩🇪", region: "Europe", carriers: ["Deutsche Telekom", "Vodafone", "O2"] },
    "39": { name: "Italy", flag: "🇮🇹", region: "Europe", carriers: ["TIM", "Vodafone", "WindTre"] },
    "34": { name: "Spain", flag: "🇪🇸", region: "Europe", carriers: ["Movistar", "Vodafone", "Orange"] },
    "31": { name: "Netherlands", flag: "🇳🇱", region: "Europe", carriers: ["KPN", "VodafoneZiggo", "T-Mobile"] },
    "7": { name: "Russia", flag: "🇷🇺", region: "Europe/Asia", carriers: ["MTS", "Beeline", "MegaFon"] },
    "86": { name: "China", flag: "🇨🇳", region: "Asia", carriers: ["China Mobile", "China Unicom", "China Telecom"] },
    "91": { name: "India", flag: "🇮🇳", region: "Asia", carriers: ["Jio", "Airtel", "Vi", "BSNL"] },
    "81": { name: "Japan", flag: "🇯🇵", region: "Asia", carriers: ["NTT DoCoMo", "SoftBank", "au"] },
    "82": { name: "South Korea", flag: "🇰🇷", region: "Asia", carriers: ["SK Telecom", "KT", "LG U+"] },
    "65": { name: "Singapore", flag: "🇸🇬", region: "Asia", carriers: ["Singtel", "StarHub", "M1"] },
    "60": { name: "Malaysia", flag: "🇲🇾", region: "Asia", carriers: ["Maxis", "Celcom", "Digi"] },
    "66": { name: "Thailand", flag: "🇹🇭", region: "Asia", carriers: ["AIS", "dtac", "TrueMove"] },
    "84": { name: "Vietnam", flag: "🇻🇳", region: "Asia", carriers: ["Viettel", "VinaPhone", "MobiFone"] },
    "62": { name: "Indonesia", flag: "🇮🇩", region: "Asia", carriers: ["Telkomsel", "Indosat", "XL Axiata"] },
    "63": { name: "Philippines", flag: "🇵🇭", region: "Asia", carriers: ["Globe", "Smart", "DITO"] },
    "92": { name: "Pakistan", flag: "🇵🇰", region: "Asia", carriers: ["Jazz", "Telenor", "Zong"] },
    "94": { name: "Sri Lanka", flag: "🇱🇰", region: "Asia", carriers: ["Dialog", "Mobitel", "Hutch"] },
    "880": { name: "Bangladesh", flag: "🇧🇩", region: "Asia", carriers: ["Grameenphone", "Robi", "Banglalink"] },
    "966": { name: "Saudi Arabia", flag: "🇸🇦", region: "Asia", carriers: ["STC", "Mobily", "Zain"] },
    "971": { name: "UAE", flag: "🇦🇪", region: "Asia", carriers: ["Etisalat", "du"] },
    "90": { name: "Turkey", flag: "🇹🇷", region: "Europe/Asia", carriers: ["Turkcell", "Vodafone", "Türk Telekom"] },
    "254": { name: "Kenya", flag: "🇰🇪", region: "Africa", carriers: ["Safaricom", "Airtel", "Telkom"] },
    "234": { name: "Nigeria", flag: "🇳🇬", region: "Africa", carriers: ["MTN", "Airtel", "Glo", "9mobile"] },
    "27": { name: "South Africa", flag: "🇿🇦", region: "Africa", carriers: ["Vodacom", "MTN", "Cell C"] },
    "20": { name: "Egypt", flag: "🇪🇬", region: "Africa", carriers: ["Orange", "Vodafone", "Etisalat"] },
    "212": { name: "Morocco", flag: "🇲🇦", region: "Africa", carriers: ["Maroc Telecom", "Orange", "inwi"] },
    "233": { name: "Ghana", flag: "🇬🇭", region: "Africa", carriers: ["MTN", "Vodafone", "AirtelTigo"] },
    "61": { name: "Australia", flag: "🇦🇺", region: "Oceania", carriers: ["Telstra", "Optus", "Vodafone"] },
    "64": { name: "New Zealand", flag: "🇳🇿", region: "Oceania", carriers: ["Spark", "Vodafone", "2degrees"] },
    "55": { name: "Brazil", flag: "🇧🇷", region: "South America", carriers: ["Vivo", "TIM", "Claro", "Oi"] },
    "54": { name: "Argentina", flag: "🇦🇷", region: "South America", carriers: ["Movistar", "Claro", "Personal"] },
    "52": { name: "Mexico", flag: "🇲🇽", region: "Central America", carriers: ["Telcel", "AT&T", "Movistar"] }
};

function analyzePhoneNumber(phoneNumber) {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    for (let i = 4; i >= 1; i--) {
        const code = cleanNumber.substring(0, i);
        if (globalCountries[code]) {
            const country = globalCountries[code];
            const localNumber = cleanNumber.substring(i);
            
            return {
                countryCode: code,
                country: country.name,
                flag: country.flag,
                region: country.region,
                carriers: country.carriers,
                localNumber: localNumber,
                fullNumber: `+${code} ${localNumber}`,
                isValid: localNumber.length >= 8 && localNumber.length <= 12
            };
        }
    }
    
    return null;
}

function extractPhoneFromJid(jid) {
    const phoneMatch = jid.match(/(\d+)/);
    return phoneMatch ? phoneMatch[1] : null;
}

// Track command - can use number or reply to message
adams({
    nomCom: "track",
    aliases: ["tr"],
    categorie: "New",
    reaction: "🌍"
}, async (dest, zk, commandOptions) => {
    const { arg, repondre, ms } = commandOptions;

    let phoneNumber = null;

    // Check if replying to a message
    if (ms.quoted) {
        const quotedJid = ms.quoted.key.participant || ms.quoted.key.remoteJid;
        phoneNumber = extractPhoneFromJid(quotedJid);
    }
    
    // If no reply or no phone from reply, check arguments
    if (!phoneNumber && arg[0]) {
        phoneNumber = arg.join("").replace(/\s+/g, "");
    }

    if (!phoneNumber) {
        return repondre(`🌍 *GLOBAL PHONE TRACKER*

📱 Usage: 
• track +1234567890
• Reply to any message + type "track"

*Examples:*
• track +254712345678  
• track +44123456789

💡 Works with all countries!`);
    }

    try {
        const analysis = analyzePhoneNumber(phoneNumber);
        
        if (!analysis) {
            return repondre(`❌ Could not identify phone number: ${phoneNumber}

Please provide a valid international format.
Example: +1234567890`);
        }

        const result = `🌍 *PHONE TRACKER RESULTS*

📱 *Number:* ${analysis.fullNumber}
${analysis.flag} *Country:* ${analysis.country}
🗺️ *Region:* ${analysis.region}
🏷️ *Code:* +${analysis.countryCode}
✅ *Valid:* ${analysis.isValid ? "Yes" : "No"}

🏢 *Major Carriers:*
${analysis.carriers.map(carrier => `• ${carrier}`).join('\n')}

⚡ *BWM XMD Global Tracker*`;

        await repondre(result);

    } catch (error) {
        console.error("Phone tracking error:", error);
        return repondre("❌ Error analyzing phone number. Please try again.");
    }
});

// ================================
// FILE CREATOR - REPLY MODE
// ================================

const githubFormats = {
    "mp3": { mime: "audio/mpeg", ext: ".mp3", desc: "Audio file", icon: "🎵" },
    "mp4": { mime: "video/mp4", ext: ".mp4", desc: "Video file", icon: "🎥" },
    "js": { mime: "text/javascript", ext: ".js", desc: "JavaScript", icon: "📜" },
    "html": { mime: "text/html", ext: ".html", desc: "HTML file", icon: "🌐" },
    "json": { mime: "application/json", ext: ".json", desc: "JSON file", icon: "📋" }
};

function createFileContent(text, format) {
    const timestamp = new Date().toISOString();
    
    switch (format) {
        case "js":
            return `// Generated by BWM XMD
// Created: ${timestamp}

const content = \`${text.replace(/`/g, '\\`')}\`;

console.log(content);

module.exports = {
    content: content,
    timestamp: "${timestamp}",
    generator: "BWM XMD"
};`;

        case "html":
            return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BWM XMD Generated File</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            line-height: 1.6;
        }
        .header { 
            background: #f4f4f4; 
            padding: 15px; 
            border-radius: 8px; 
            margin-bottom: 20px;
        }
        .content { 
            background: #f9f9f9; 
            padding: 15px; 
            border-radius: 8px;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>BWM XMD Generated Content</h1>
        <p><strong>Created:</strong> ${new Date(timestamp).toLocaleString()}</p>
        <p><strong>Generator:</strong> BWM XMD File Creator</p>
    </div>
    <div class="content">${text.replace(/\n/g, '<br>')}</div>
</body>
</html>`;

        case "json":
            return JSON.stringify({
                content: text,
                metadata: {
                    created: timestamp,
                    generator: "BWM XMD",
                    format: "json",
                    version: "1.0"
                }
            }, null, 2);

        default:
            return text;
    }
}

// JavaScript file creator
adams({
    nomCom: "js",
    categorie: "New",
    reaction: "📜"
}, async (dest, zk, commandOptions) => {
    const { repondre, ms } = commandOptions;

    if (!ms.quoted) {
        return repondre("❌ Reply to a message to convert it to JavaScript file");
    }

    try {
        const quotedText = ms.quoted.message?.conversation || 
                          ms.quoted.message?.extendedTextMessage?.text || 
                          "No text content";

        const filename = `bwm_${Date.now()}.js`;
        const fileContent = createFileContent(quotedText, "js");
        const fileBuffer = Buffer.from(fileContent, 'utf8');

        await zk.sendMessage(dest, {
            document: fileBuffer,
            fileName: filename,
            mimetype: githubFormats.js.mime,
            caption: `📜 *JavaScript File Created*

📁 ${filename}
📊 ${fileBuffer.length} bytes
✅ GitHub ready!

*Content:* ${quotedText.substring(0, 50)}${quotedText.length > 50 ? '...' : ''}`
        }, { quoted: ms });

    } catch (error) {
        console.error("JS file creation error:", error);
        return repondre("❌ Error creating JavaScript file");
    }
});

// HTML file creator
adams({
    nomCom: "html",
    categorie: "New", 
    reaction: "🌐"
}, async (dest, zk, commandOptions) => {
    const { repondre, ms } = commandOptions;

    if (!ms.quoted) {
        return repondre("❌ Reply to a message to convert it to HTML file");
    }

    try {
        const quotedText = ms.quoted.message?.conversation || 
                          ms.quoted.message?.extendedTextMessage?.text || 
                          "No text content";

        const filename = `bwm_${Date.now()}.html`;
        const fileContent = createFileContent(quotedText, "html");
        const fileBuffer = Buffer.from(fileContent, 'utf8');

        await zk.sendMessage(dest, {
            document: fileBuffer,
            fileName: filename,
            mimetype: githubFormats.html.mime,
            caption: `🌐 *HTML File Created*

📁 ${filename}
📊 ${fileBuffer.length} bytes
✅ GitHub ready!

*Content:* ${quotedText.substring(0, 50)}${quotedText.length > 50 ? '...' : ''}`
        }, { quoted: ms });

    } catch (error) {
        console.error("HTML file creation error:", error);
        return repondre("❌ Error creating HTML file");
    }
});

// JSON file creator
adams({
    nomCom: "json",
    categorie: "New",
    reaction: "📋" 
}, async (dest, zk, commandOptions) => {
    const { repondre, ms } = commandOptions;

    if (!ms.quoted) {
        return repondre("❌ Reply to a message to convert it to JSON file");
    }

    try {
        const quotedText = ms.quoted.message?.conversation || 
                          ms.quoted.message?.extendedTextMessage?.text || 
                          "No text content";

        const filename = `bwm_${Date.now()}.json`;
        const fileContent = createFileContent(quotedText, "json");
        const fileBuffer = Buffer.from(fileContent, 'utf8');

        await zk.sendMessage(dest, {
            document: fileBuffer,
            fileName: filename,
            mimetype: githubFormats.json.mime,
            caption: `📋 *JSON File Created*

📁 ${filename}
📊 ${fileBuffer.length} bytes
✅ GitHub ready!

*Content:* ${quotedText.substring(0, 50)}${quotedText.length > 50 ? '...' : ''}`
        }, { quoted: ms });

    } catch (error) {
        console.error("JSON file creation error:", error);
        return repondre("❌ Error creating JSON file");
    }
});

// MP3 file creator (from audio messages)
adams({
    nomCom: "mp3",
    categorie: "New",
    reaction: "🎵"
}, async (dest, zk, commandOptions) => {
    const { repondre, ms } = commandOptions;

    if (!ms.quoted) {
        return repondre("❌ Reply to an audio message to convert it to MP3 file");
    }

    try {
        if (!ms.quoted.message.audioMessage) {
            return repondre("❌ Please reply to an audio message");
        }

        const audioBuffer = await zk.downloadMediaMessage(ms.quoted);
        const filename = `bwm_audio_${Date.now()}.mp3`;
        const fileSize = (audioBuffer.length / 1024).toFixed(1);

        await zk.sendMessage(dest, {
            document: audioBuffer,
            fileName: filename,
            mimetype: githubFormats.mp3.mime,
            caption: `🎵 *MP3 File Created*

📁 ${filename}
📊 ${fileSize} KB
✅ GitHub ready!

*Converted from audio message*`
        }, { quoted: ms });

    } catch (error) {
        console.error("MP3 file creation error:", error);
        return repondre("❌ Error creating MP3 file");
    }
});

// MP4 file creator (from video messages)
adams({
    nomCom: "mp4",
    categorie: "New",
    reaction: "🎥"
}, async (dest, zk, commandOptions) => {
    const { repondre, ms } = commandOptions;

    if (!ms.quoted) {
        return repondre("❌ Reply to a video message to convert it to MP4 file");
    }

    try {
        if (!ms.quoted.message.videoMessage) {
            return repondre("❌ Please reply to a video message");
        }

        const videoBuffer = await zk.downloadMediaMessage(ms.quoted);
        const filename = `bwm_video_${Date.now()}.mp4`;
        const fileSize = (videoBuffer.length / (1024 * 1024)).toFixed(1);

        await zk.sendMessage(dest, {
            document: videoBuffer,
            fileName: filename,
            mimetype: githubFormats.mp4.mime,
            caption: `🎥 *MP4 File Created*

📁 ${filename}
📊 ${fileSize} MB
✅ GitHub ready!

*Converted from video message*`
        }, { quoted: ms });

    } catch (error) {
        console.error("MP4 file creation error:", error);
        return repondre("❌ Error creating MP4 file");
    }
});

console.log("✅ BWM XMD Reply System Loaded:");
console.log("🌍 Phone Tracker - Reply or type number");
console.log("📁 File Creators - js, html, json, mp3, mp4");
console.log("💡 Just reply to any message and type the command!");
