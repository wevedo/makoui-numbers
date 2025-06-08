const {
  adams
} = require("../Ibrahim/adams");
adams(
  { nomCom: "weather", reaction: "🌤️", nomFichier: __filename },
  async (dest, zk, commandeOptions) => {
    const { ms, arg } = commandeOptions;
    const userJid = ms?.sender || dest;

    if (!arg || arg.length === 0) {
      return await zk.sendMessage(dest, {
        text: "Please specify a location. Example: *weather Nairobi* or *weather Bungoma*",
        mentions: [userJid]
      });
    }

    try {
      const location = arg.join(" ");
      const apiKey = "060a6bcfa19809c2cd4d97a212b19273";
      
      // Show waiting message
      await zk.sendMessage(dest, { 
        text: `Fetching weather data for *${location}*... ⏳`,
        mentions: [userJid]
      });

      // Fetch weather data
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${apiKey}&lang=en`);
      const data = await response.json();

      if (data.cod !== 200) {
        throw new Error(data.message || "Location not found");
      }

      // Format weather information
      const weatherInfo = `
🌍 *Location*: ${data.name}, ${data.sys.country || "N/A"}
🌡️ *Temperature*: ${Math.round(data.main.temp)}°C (Feels like ${Math.round(data.main.feels_like)}°C)
☁️ *Condition*: ${data.weather[0].description}
📊 *Humidity*: ${data.main.humidity}%
💨 *Wind*: ${data.wind.speed} m/s
🌅 *Sunrise*: ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}
🌇 *Sunset*: ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}
      `.trim();

      await zk.sendMessage(dest, {
        text: `*Weather Report* 🌤️\n${weatherInfo}\n\n_Updated: ${new Date().toLocaleString()}_`,
        mentions: [userJid]
      });

    } catch (error) {
      console.error("Weather command error:", error);
      await zk.sendMessage(dest, {
        text: `❌ Failed to get weather data for "${arg.join(" ")}"\nError: ${error.message}\n\nPlease try another location or check the spelling.`,
        mentions: [userJid]
      });
    }
  }
);
