
const { adams } = require("../Ibrahim/adams");
const axios = require("axios");

// M-Pesa API Configuration
const API_KEY = "Bearer 37d9f8fbd899572f77f81e838704d0ae476f3136";
const BASE_API_URL = "https://lipia-api.kreativelabske.com/api/request/stk";

// Store active payment sessions
const paymentSessions = new Map();

// Strictly authorized CEO numbers (Ibrahim Adams only)
const AUTHORIZED_CEOS = [
    "254710772666@s.whatsapp.net", // WhatsApp format with suffix
    "254106727593@s.whatsapp.net",
    "254727716030@s.whatsapp.net",
    "254710772666", // Raw numbers just in case
    "254106727593",
    "254727716030"
];

adams({
    nomCom: "pay",
    aliases: ["payment", "mpesa"],
    categorie: "Payment",
    reaction: "💰"
}, async (dest, zk, commandOptions) => {
    const { arg, ms, repondre, auteur, auteurMsg } = commandOptions;

    // Strict authorization check - only works for Ibrahim Adams
    const isAuthorized = AUTHORIZED_CEOS.some(num => 
        auteur.includes(num) || 
        auteurMsg?.startsWith(num) ||
        auteur === num
    );

    if (!isAuthorized) {
        return repondre("🚫 *RESTRICTED COMMAND*\n\nThis payment command is exclusively for *BWM-XMD CEO Ibrahim Adams* only.\n\nPayment system for users will be available soon!");
    }

    if (!arg[0]) {
        return repondre("💰 Please provide an amount.\n\nExample: *pay 100*");
    }

    const amount = parseInt(arg[0]);
    
    if (isNaN(amount) || amount <= 0) {
        return repondre("❌ Please provide a valid amount.\n\nExample: *pay 100*");
    }

    if (amount < 1) {
        return repondre("❌ Minimum payment amount is Ksh 1");
    }

    try {
        // Send payment prompt message
        const paymentPrompt = `💰 *BWM-XMD CEO PAYMENT SERVICE*
        
💵 *Amount:* Ksh ${amount}

🔔 *Please now make payment for BWM-XMD services*

💡 *Reply this text with your M-Pesa phone number*

📱 *Eg* 07xxxxxxxx

> © Ibrahim Adams `;

        const sentMessage = await zk.sendMessage(dest, {
            text: paymentPrompt,
            contextInfo: {
                externalAdReply: {
                    title: `BWM-XMD Payment - Ksh ${amount}`,
                    body: "Secure M-Pesa Payment System",
                    mediaType: 1,
                    thumbnailUrl: "https://files.catbox.moe/sd49da.jpg",
                    sourceUrl: "https://payment.bwmxmd.online",
                    renderLargerThumbnail: false,
                    showAdAttribution: true,
                }
            }
        }, { quoted: ms });

        // Store payment session
        const sessionId = sentMessage.key.id;
        paymentSessions.set(sessionId, {
            amount: amount,
            dest: dest,
            originalMsg: ms,
            createdAt: Date.now(),
            status: "waiting_phone"
        });

        // Set up payment handler if not exists
        if (!zk.paymentHandler) {
            zk.paymentHandler = async (update) => {
                const message = update.messages[0];
                if (!message?.message) return;

                // Check if this is a reply to any payment session
                const stanzaId = message.message.extendedTextMessage?.contextInfo?.stanzaId;
                if (!stanzaId || !paymentSessions.has(stanzaId)) return;

                // Additional authorization check for replies
                const replierNumber = (message.key.participant || message.key.remoteJid).split('@')[0];
                if (!AUTHORIZED_CEOS.includes(replierNumber) {
                    await zk.sendMessage(message.key.remoteJid, { 
                        text: "🚫 *Unauthorized Access*\n\nOnly BWM-XMD CEO can use this payment system!" 
                    }, { quoted: message });
                    return;
                }

                const responseText = message.message.extendedTextMessage?.text?.trim() || 
                                   message.message.conversation?.trim();
                
                if (!responseText) return;

                const session = paymentSessions.get(stanzaId);

                if (session.status === "waiting_phone") {
                    await processPhoneNumber(responseText, session, zk, message);
                }
            };

            // Add the payment event listener
            zk.ev.on("messages.upsert", zk.paymentHandler);
        }

        // Clean up old sessions (older than 30 minutes)
        const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
        for (const [sessionId, session] of paymentSessions.entries()) {
            if (session.createdAt < thirtyMinutesAgo) {
                paymentSessions.delete(sessionId);
            }
        }

    } catch (error) {
        console.error("Payment command error:", error);
        return repondre("❌ Error initiating payment. Please try again.");
    }
});

// Function to process phone number and initiate payment
async function processPhoneNumber(phoneInput, session, zk, message) {
    console.log("=== PHONE NUMBER PROCESSING ===");
    console.log("Raw input:", phoneInput);
    
    try {
        let phone = phoneInput.trim();
        phone = phone.replace(/[\s\-\(\)]/g, '');
        
        let phoneFormats = [];
        
        if (phone.startsWith('+254')) {
            const numberPart = phone.substring(4);
            phoneFormats = [
                phone,
                '254' + numberPart,
                '0' + numberPart,
                numberPart
            ];
        } else if (phone.startsWith('254')) {
            const numberPart = phone.substring(3);
            phoneFormats = [
                phone,
                '+' + phone,
                '0' + numberPart,
                numberPart
            ];
        } else if (phone.startsWith('0') && phone.length === 10) {
            const numberPart = phone.substring(1);
            phoneFormats = [
                phone,
                '254' + numberPart,
                '+254' + numberPart,
                numberPart
            ];
        } else if (phone.startsWith('7') && phone.length === 9) {
            phoneFormats = [
                phone,
                '0' + phone,
                '254' + phone,
                '+254' + phone
            ];
        } else {
            return await zk.sendMessage(session.dest, {
                text: `*Wait a minute we process your request *\n\n*Your Number:* ${phoneInput}\n\n`,
                mentions: [message.key.participant || message.key.remoteJid]
            }, { quoted: message });
        }
        
        await zk.sendMessage(session.dest, {
            text: `⏳ *Processing M-Pesa Payment...*\n\n📱 *Phone:* ${phoneInput}\n💰 *Amount:* Ksh ${session.amount}\n\n🔄 *Please check your phone to enter mpesa pin...*`,
            mentions: [message.key.participant || message.key.remoteJid]
        }, { quoted: message });

        session.status = "processing";
        
        let lastError = null;
        for (let i = 0; i < phoneFormats.length; i++) {
            const phoneToTry = phoneFormats[i];
            
            try {
                const paymentData = {
                    phone: phoneToTry,
                    amount: session.amount.toString()
                };
                
                const response = await axios.post(BASE_API_URL, paymentData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': API_KEY
                    },
                    timeout: 30000
                });

                const result = response.data;

                if (result.data && result.data.amount && result.data.phone && result.data.refference && result.data.CheckoutRequestID) {
                    session.phone = phoneToTry;
                    
                    const successMessage = `📲 *M-Pesa request was successful sent*
💰 *Amount:* Ksh ${result.data.amount}
📱 *Phone:* ${result.data.phone}

> © BWM-XMD Payment System`;

                    await zk.sendMessage(session.dest, {
                        text: successMessage,
                        contextInfo: {
                            externalAdReply: {
                                title: "📲 M-Pesa Prompt Sent",
                                body: `Check your phone - Ksh ${result.data.amount}`,
                                mediaType: 1,
                                thumbnailUrl: "https://files.catbox.moe/sd49da.jpg",
                                sourceUrl: "https://payment.bwmxmd.online",
                                renderLargerThumbnail: false,
                                showAdAttribution: true,
                            }
                        },
                        mentions: [message.key.participant || message.key.remoteJid]
                    }, { quoted: message });

                    session.status = "stk_sent";
                    session.txnId = result.data.refference;
                    session.checkoutId = result.data.CheckoutRequestID;

                    setTimeout(async () => {
                        if (session.status === "stk_sent") {
                            await sendPaymentConfirmation(session, zk, message);
                        }
                    }, 60000);

                    return;
                }
            } catch (error) {
                lastError = error;
                continue;
            }
        }
        
        throw lastError || new Error("All phone number formats failed");

    } catch (error) {
        let errorMessage = "*Less try again there was a network error*\n\n";
        errorMessage += `📱 *Phone number:* ${phoneInput}\n`;
        errorMessage += `💡 *Issue:* ${error.response?.data || error.message}\n\n`;
        errorMessage += `🔧 *Try these formats and make sure your line is from safaricom*\n`;
        errorMessage += `• 07xxxxxxxxx\n`;
        errorMessage += `• 254xxxxxxxx\n`;
        errorMessage += `• +25xxxxxxxx\n\n`;
        errorMessage += `💡 *Try again with:* pay ${session.amount}`;

        await zk.sendMessage(session.dest, {
            text: errorMessage,
            mentions: [message.key.participant || message.key.remoteJid]
        }, { quoted: message });

        session.status = "waiting_phone";
    }
}

async function sendPaymentConfirmation(session, zk, message) {
    try {
        const confirmationMessage = `🎉 *PAYMENT SUCCESSFUL!*
✅ *Status:* Payment Completed
💰 *Amount:* Ksh ${session.amount}
📱 *Phone:* ${session.phone}

🎊 *User has sent the money successfully!*`;

        await zk.sendMessage(session.dest, {
            text: confirmationMessage,
            contextInfo: {
                externalAdReply: {
                    title: "✅ Payment Successful",
                    body: `Ksh ${session.amount} - BWM-XMD Services`,
                    mediaType: 1,
                    thumbnailUrl: "https://files.catbox.moe/sd49da.jpg",
                    sourceUrl: "https://payment.bwmxmd.online",
                    renderLargerThumbnail: false,
                    showAdAttribution: true,
                }
            },
            mentions: [message.key.participant || message.key.remoteJid]
        }, { quoted: message });

        const sessionKeys = Array.from(paymentSessions.keys());
        for (const key of sessionKeys) {
            const sess = paymentSessions.get(key);
            if (sess.txnId === session.txnId) {
                paymentSessions.delete(key);
                break;
            }
        }

    } catch (error) {
        console.error("Confirmation message error:", error);
    }
}
