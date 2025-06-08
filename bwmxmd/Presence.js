module.exports = {
    setup: async (adams, { config, logger }) => {
        if (!adams || !config) return;

        // Presence Manager
        const updatePresence = async (jid) => {
            try {
                // Get presence state from config
                const etat = config.ETAT || 0; // Default to 0 (unavailable) if not set
                
                // Set presence based on ETAT value
                if (etat == 1) {
                    await adams.sendPresenceUpdate("available", jid);
                } else if (etat == 2) {
                    await adams.sendPresenceUpdate("composing", jid);
                } else if (etat == 3) {
                    await adams.sendPresenceUpdate("recording", jid);
                } else {
                    await adams.sendPresenceUpdate("unavailable", jid);
                }
                
                logger.debug(`Presence updated based on ETAT: ${etat}`);
            } catch (e) {
                logger.error('Presence update failed:', e.message);
            }
        };

        // Update presence on connection
        adams.ev.on("connection.update", ({ connection }) => {
            if (connection === "open") {
                logger.info("Connection established - updating presence");
                updatePresence("status@broadcast");
            }
        });

        // Update presence when receiving a message
        adams.ev.on("messages.upsert", async ({ messages }) => {
            if (messages && messages.length > 0) {
                await updatePresence(messages[0].key.remoteJid);
            }
        });
    }
};
