const googleTTS = require("google-tts-api");
const { createContext } = require("../Ibrahim/helper");
const { createContext2 } = require("../Ibrahim/helper2");

class ConversationMemory {
    constructor() {
        this.store = new Map();
        this.ttl = 60 * 60 * 1000;
        this.apiUsage = new Map();
    }

    get(jid) {
        const data = this.store.get(jid);
        if (data && Date.now() - data.lastUpdated < this.ttl) {
            return data;
        }
        this.delete(jid);
        return null;
    }

    set(jid, data) {
        this.store.set(jid, {
            ...data,
            lastUpdated: Date.now()
        });
    }

    delete(jid) {
        this.store.delete(jid);
    }

    extractInfo(content) {
        const patterns = [
            { regex: /(?:my name is|call me) (\w+)/i, key: 'name' },
            { regex: /(?:i am|i'm) (\w+)/i, key: 'name' },
            { regex: /(?:live in|from) (.+?)(?:\.|$)/i, key: 'location' },
            { regex: /(?:age is|am) (\d+)/i, key: 'age' },
            { regex: /remember (.+)/i, key: 'custom' }
        ];

        const info = {};
        for (const { regex, key } of patterns) {
            const match = content.match(regex);
            if (match) info[key] = match[1].trim();
        }
        return info;
    }

    getNextApiIndex(jid, totalApis) {
        const lastUsed = this.apiUsage.get(jid) || -1;
        const nextIndex = (lastUsed + 1) % totalApis;
        this.apiUsage.set(jid, nextIndex);
        return nextIndex;
    }
}

const memory = new ConversationMemory();

module.exports = {
    setup: async (adams, { config, logger }) => {
        if (!adams || !config) return;

        const availableApis = [
            { url: "https://bk9.fun/ai/gemini?q=", name: "Gemini" },
            { url: "https://bk9.fun/ai/llama?q=", name: "Llama" },
            { url: "https://bk9.fun/ai/jeeves-chat?q=", name: "Jeeves" },
            { url: "https://bk9.fun/ai/jeeves-chat2?q=", name: "Jeeves-v2" },
            { url: "https://bk9.fun/ai/mathssolve?q=", name: "MathSolver" },
            { url: "https://bk9.fun/ai/Perplexity?q=", name: "Perplexity" },
            { url: "https://bk9.fun/ai/xdash?q=", name: "XDash" },
            { url: "https://bk9.fun/ai/Aoyo?q=", name: "Aoyo-Naruto" }
        ];

        // Enhanced TTS Processor
        const processForTTS = (text) => {
            // Clean and shorten text for TTS
            let processed = text
                .replace(/[\[\]\(\)\{\}]/g, ' ') // Remove special brackets
                .replace(/\s+/g, ' ') // Collapse whitespace
                .substring(0, 190); // Hard limit with buffer
            
            // Ensure natural stopping point
            const lastPunct = Math.max(
                processed.lastIndexOf('.'),
                processed.lastIndexOf('!'),
                processed.lastIndexOf('?'),
                processed.lastIndexOf(',')
            );
            
            if (lastPunct > 150) {
                processed = processed.substring(0, lastPunct + 1);
            }
            
            // Add continuation marker if truncated
            if (text.length > 190) {
                processed += "... [message continues]";
            }
            
            return processed;
        };

        const tryApis = async (jid, query, context) => {
            const contextualQuery = [
                `Current context: ${JSON.stringify(context.userData)}`,
                `Previous messages: ${context.history.slice(-2).join(' | ')}`,
                `New query: ${query}`
            ].join('\n');

            let lastError = null;
            let attempts = 0;
            
            while (attempts < availableApis.length * 2) { // Try each API twice
                const apiIndex = memory.getNextApiIndex(jid, availableApis.length);
                const api = availableApis[apiIndex];
                
                try {
                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 8000);
                    
                    const response = await fetch(api.url + encodeURIComponent(contextualQuery), {
                        signal: controller.signal
                    });
                    clearTimeout(timeout);
                    
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    
                    const data = await response.json();
                    // Handle BK9 API response format
                    const result = data.BK9 || data.result || data.response || data.message;
                    
                    if (result) {
                        logger.debug(`API success: ${api.name} → ${result.substring(0,50)}...`);
                        return {
                            response: result,
                            apiUsed: api.name
                        };
                    }
                } catch (error) {
                    lastError = error;
                    logger.warn(`API ${api.name} attempt ${attempts+1} failed: ${error.message}`);
                    attempts++;
                    await new Promise(resolve => setTimeout(resolve, attempts * 500));
                }
            }
            
            throw lastError || new Error("All API attempts exhausted");
        };

        adams.ev.on("messages.upsert", async ({ messages }) => {
            const ms = messages[0];
            if (!ms?.message) return;

            const senderJid = ms.key.participant || ms.key.remoteJid;
            const remoteJid = ms.key.remoteJid;
            const messageType = Object.keys(ms.message)[0];
            const messageContent = ms.message.conversation || ms.message.extendedTextMessage?.text || "";

            // Ignore self and owner messages
            if (ms.key.fromMe || senderJid === `${config.OWNER_NUMBER}@s.whatsapp.net`) return;

            // Context management
            let context = memory.get(remoteJid) || {
                botName: "BWM-XMD",
                creator: "Ibrahim Adams",
                history: [],
                userData: {}
            };

            // Information extraction
            if (messageContent) {
                const newInfo = memory.extractInfo(messageContent);
                if (Object.keys(newInfo).length > 0) {
                    context.userData = { ...context.userData, ...newInfo };
                    memory.set(remoteJid, context);
                    
                    if (newInfo.name) {
                        await adams.sendMessage(
                            remoteJid,
                            { text: `Nice to meet you ${newInfo.name}! I'll remember that.` },
                            { quoted: ms }
                        );
                        return;
                    }
                }
            }

            // Special commands handler
            const handleSpecialCommands = async () => {
                if (/your name|who are you/i.test(messageContent)) {
                    return `I'm ${context.botName}, created by ${context.creator}.` +
                        (context.userData.name ? ` Nice to see you again ${context.userData.name}!` : "");
                }

                if (/remember me|my info/i.test(messageContent)) {
                    if (Object.keys(context.userData).length === 0) {
                        return "I don't have any information about you yet. Tell me something like 'My name is Ibrahim'!";
                    }
                    
                    return "🔍 Here's what I remember:\n\n" +
                        Object.entries(context.userData)
                            .map(([k,v]) => `• ${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
                            .join('\n');
                }
                return null;
            };

            // Main processing flow
            try {
                const specialResponse = await handleSpecialCommands();
                if (specialResponse) {
                    await adams.sendMessage(
                        remoteJid,
                        { 
                            text: specialResponse,
                            ...createContext(senderJid, {
                                title: context.botName,
                                body: "Information Response"
                            })
                        },
                        { quoted: ms }
                    );
                    return;
                }

                // AI Response Handling
                if (config.CHATBOT === "yes" || config.CHATBOT1 === "yes") {
                    const { response, apiUsed } = await tryApis(remoteJid, messageContent, context);
                    
                    // Update memory
                    memory.set(remoteJid, {
                        ...context,
                        history: [...context.history.slice(-3), `${messageContent.substring(0,20)}... → ${response.substring(0,30)}...`],
                        lastApiUsed: apiUsed
                    });

                    // Text Response
                    if (config.CHATBOT === "yes") {
                        await adams.sendMessage(
                            remoteJid,
                            { 
                                text: response,
                                ...createContext(senderJid, {
                                    title: `${context.botName} (via ${apiUsed})`,
                                    body: context.userData.name ? `For ${context.userData.name}` : "AI Response"
                                })
                            },
                            { quoted: ms }
                        );
                    }

                    // Voice Response with TTS limits
                    if (config.CHATBOT1 === "yes") {
                        const ttsContent = processForTTS(response);
                        logger.debug(`TTS processing: Original ${response.length} chars → ${ttsContent.length} chars`);
                        
                        try {
                            const audioUrl = googleTTS.getAudioUrl(ttsContent, {
                                lang: "en",
                                slow: false,
                                host: "https://translate.google.com",
                            });

                            await adams.sendMessage(
                                remoteJid,
                                { 
                                    audio: { url: audioUrl },
                                    mimetype: "audio/mpeg",
                                    ptt: true,
                                    ...createContext2(senderJid, {
                                        title: `${context.botName} Voice`,
                                        body: `Shortened from ${response.length} chars`
                                    })
                                },
                                { quoted: ms }
                            );
                        } catch (ttsError) {
                            logger.error("TTS generation failed:", ttsError);
                            // Don't send error to user per requirements
                        }
                    }
                }
            } catch (error) {
                logger.error("Processing error:", error);
                // No error messages sent to user as requested
            }
        });
    }
};
