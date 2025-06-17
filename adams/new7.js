const { adams } = require("../Ibrahim/adams");
const axios = require("axios");

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
    categorie: "Info",
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
bbbb                }
            }
        }, { quoted: ms });

    } catch (error) {
        console.error("Error in track command:", error);
        await repondre(`❌ *Analysis Failed*\n\nError: ${error.message}\n\nPlease try again with a valid phone number.`);
    }
});


