const axios = require("axios");
const abu = require(__dirname + "/../config");

module.exports = {
    setup: async (adams, { config, logger }) => {
        if (!adams || !config) return;

        //console.log("Initializing Auto Bio & Anti-Call systems...");

        let bioInterval = null;
        let activeCallHandler = null;

        // Function to fetch weather data
        const fetchWeather = async () => {
            try {
                const apiKey = "060a6bcfa19809c2cd4d97a212b19273";
                const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
                    params: { q: "Nairobi", units: "metric", appid: apiKey, language: "en" } // Default city
                });
                const data = response.data;
                return `🌡️ Temp: ${data.main.temp}°C | 🌫️ ${data.weather[0].description} | 💧 Humidity: ${data.main.humidity}%`;
            } catch (error) {
               // console.error("❌ Error fetching weather data:", error.message);
                return "🌡️ Weather unavailable";
            }
        };

        // Auto Bio System
        const startBioUpdates = async () => {
            if (abu.AUTO_BIO !== "yes") return;

            const getCurrentDateTime = () => new Intl.DateTimeFormat("en-KE", {
                timeZone: "Africa/Nairobi",
                year: "numeric",
                month: "long",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            }).format(new Date());

            const updateBio = async () => {
                try {
                    const weatherInfo = await fetchWeather();
                    await adams.updateProfileStatus(`👋 BWM XMD ONLINE 🚀 |  \n${weatherInfo}\n📅 ${getCurrentDateTime()}`);
                   // logger.info("Bio updated successfully");
                } catch (err) {
                    //logger.error("Bio update failed:", err.message);
                }
            };

            updateBio();
            bioInterval = setInterval(updateBio, 60000);
        };

        // Anti-Call System
        const startCallBlocking = () => {
            if (abu.ANTICALL !== "yes") return;

            const callHandler = async (callData) => {
                try {
                    const { id, from } = callData[0];
                    await adams.rejectCall(id, from);
                    logger.info(`Blocked call from: ${from}`);
                } catch (err) {
                    logger.error("Call blocking failed:", err.message);
                }
            };

            adams.ev.on('call', callHandler);
            activeCallHandler = callHandler;
        };

        startBioUpdates();
        startCallBlocking();

        //console.log("✅ Auto Bio & Anti-Call systems operational");
       // logger.info("Protection systems now active");

        return () => {
            console.log("Shutting down Auto Bio & Anti-Call systems...");
            if (bioInterval) clearInterval(bioInterval);
            if (activeCallHandler) adams.ev.off('call', activeCallHandler);
            logger.info("Systems terminated");
        };
    }
};
