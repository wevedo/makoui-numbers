
const { adams } = require("../Ibrahim/adams");
const axios = require("axios");

module.exports = {
    nomCom: "pay",
    categorie: "Payment",
    reaction: "💰",
    description: "Initiate M-Pesa payment for BWM-XMD services",
    
    async execute(origineMessage, zk, commandeOptions) {
        const { arg, repondre, auteurMessage, verifGroupe } = commandeOptions;
        
        // Check if command is used in a group
        if (verifGroupe) {
            return repondre("❌ This command only works in private chats.");
        }

        // Validate amount
        const amount = arg[0];
        if (!amount || isNaN(amount) || amount <= 0) {
            return repondre("📌 Usage: *pay <amount>*\nExample: *pay 100*");
        }

        try {
            // Step 1: Ask for phone number
            await repondre(`💳 *BWM-XMD Payment Request*\n\nPlease reply with your M-Pesa phone number:\n\nFormat: *0722XXXXXX* or *254722XXXXXX*\n\nAmount: *Ksh ${amount}*`);

            // Wait for phone number response
            const phoneResponse = await waitForResponse(zk, auteurMessage, 60000); // 1 minute timeout
            
            if (!phoneResponse) {
                return repondre("⌛ Payment request timed out. Please try again.");
            }

            // Validate phone number
            const phone = validatePhoneNumber(phoneResponse);
            if (!phone) {
                return repondre("❌ Invalid phone number. Please use format: *0722XXXXXX* or *254722XXXXXX*");
            }

            // Step 2: Confirm payment
            await repondre(`📲 *Payment Confirmation*\n\nYou will receive an M-Pesa prompt to enter your PIN for:\n\nAmount: *Ksh ${amount}*\nPhone: *${phone}*\n\nPlease wait...`);

            // Simulate processing (replace with actual API call)
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Step 3: Make actual payment request (example using Lipa API)
            const paymentResponse = await initiatePayment(phone, amount);
            
            if (paymentResponse.success) {
                // Step 4: Payment success
                await repondre(`✅ *Payment Successful!*\n\nThank you for your payment of *Ksh ${amount}*.\n\nTransaction ID: *${paymentResponse.transactionId}*\n\nYour BWM-XMD services have been activated.`);
            } else {
                await repondre(`❌ Payment failed: ${paymentResponse.message}\n\nPlease try again or contact support.`);
            }

        } catch (error) {
            console.error("Payment Error:", error);
            repondre("❌ An error occurred during payment. Please try again later.");
        }
    }
};

// Helper function to wait for user response
function waitForResponse(zk, userId, timeout) {
    return new Promise((resolve) => {
        const listener = (update) => {
            const message = update.messages[0];
            if (message.key.remoteJid === userId && message.message.conversation) {
                zk.ev.off("messages.upsert", listener);
                clearTimeout(timer);
                resolve(message.message.conversation.trim());
            }
        };

        const timer = setTimeout(() => {
            zk.ev.off("messages.upsert", listener);
            resolve(null);
        }, timeout);

        zk.ev.on("messages.upsert", listener);
    });
}

// Validate and format phone number
function validatePhoneNumber(phone) {
    phone = phone.replace(/\D/g, ''); // Remove non-digits
    
    // Convert to 254 format if starts with 0
    if (phone.startsWith('0') && phone.length === 10) {
        phone = '254' + phone.substring(1);
    }
    
    // Check if valid Kenyan number
    if (phone.startsWith('254') && phone.length === 12) {
        return phone;
    }
    
    return null;
}

// Simulate payment initiation (replace with actual API call)
async function initiatePayment(phone, amount) {
    try {
        // Example using Lipa API (replace with your actual API)
        const response = await axios.post('https://lipia-api.kreativelabske.com/api/request/stk', {
            phone,
            amount,
            service: "BWM-XMD"
        }, {
            headers: {
                'Authorization': 'Bearer 37d9f8fbd899572f77f81e838704d0ae476f3136'
            }
        });

        return {
            success: true,
            transactionId: response.data.transaction_id || "MPESA" + Date.now()
        };
    } catch (error) {
        console.error("Payment API Error:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Payment processing failed"
        };
    }
}


