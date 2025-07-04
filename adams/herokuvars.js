const { adams } = require("../Ibrahim/adams");
const Heroku = require("heroku-client");

const heroku = new Heroku({ token: process.env.HEROKU_API_KEY });
const appName = process.env.HEROKU_APP_NAME;

// Helper function to validate Heroku config
function validateHerokuConfig(repondre) {
  if (!process.env.HEROKU_API_KEY || !appName) {
    repondre(
      "⚠️ *Missing Configuration!*\n\n" +
        "Ensure that the following environment variables are properly set:\n" +
        "- `HEROKU_API_KEY`\n" +
        "- `HEROKU_APP_NAME`"
    );
    return false;
  }
  return true;
}

// **Mapping of Environment Variables to User-Friendly Names**
const configMapping = {
  AUDIO_CHATBOT: "Audio Chatbot",
  AUTO_BIO: "Auto Bio",
  AUTO_DOWNLOAD_STATUS: "Auto Download Status",
  AUTO_REACT: "Auto React",
  AUTO_REACT_STATUS: "Auto React Status",
  AUTO_READ: "Auto Read",
  AUTO_READ_STATUS: "Auto Read Status",
  CHATBOT: "Chatbot",
  PUBLIC_MODE: "Public Mode",
  STARTING_BOT_MESSAGE: "Starting Bot Message",
  "Auto Typing": "Auto Typing",
  "Always Online": "Always Online",
  "Auto Recording": "Auto Recording",
  ANTIDELETE_RECOVER_CONVENTION: "Anti Delete Recover Convention",
  ANTIDELETE_SENT_INBOX: "Anti Delete Sent Inbox",
  GOODBYE_MESSAGE: "Goodbye Message",
  AUTO_REJECT_CALL: "Auto Reject Call",
  WELCOME_MESSAGE: "Welcome Message",
  GROUPANTILINK: "Group Anti Link",
  AUTO_REPLY_STATUS: "Auto reply status"
};

// **Excluded Variables**
const EXCLUDED_VARS = [
  "DATA_BASE_URL",
  "MENU_TYPE",
  "CHATBOT1",
  "OWNER_NUMBER",
  "HEROKU_API_KEY",
  "HEROKU_APP_NAME",
  "BOT_MENU_LINK",
  "BOT_NAME",
  "PM_PERMIT",
  "PREFIX",
  "WARN_COUNT",
  "SESSION_ID",
];

// **Command to Display and Modify Heroku Variables**
adams(
  {
    nomCom: "getallvar",
    categorie: "Control",
  },
  async (chatId, zk, context) => {
    const { repondre, superUser } = context;

    if (!superUser) {
      return repondre(
        "🚫 *Access Denied!* This command is restricted to the bot owner."
      );
    }

    if (!validateHerokuConfig(repondre)) return;

    try {
      const configVars = await heroku.get(`/apps/${appName}/config-vars`);
      let numberedList = [];
      let index = 1;

      // Get keys that are not excluded
      const variableKeys = Object.keys(configMapping).filter(
        (key) => !EXCLUDED_VARS.includes(key)
      );

      variableKeys.forEach((key) => {
        let currentValue;

        if (key === "Auto Typing") {
          currentValue = configVars.PRESENCE === "2" ? "yes" : "no";
        } else if (key === "Always Online") {
          currentValue = configVars.PRESENCE === "1" ? "yes" : "no";
        } else if (key === "Auto Recording") {
          currentValue = configVars.PRESENCE === "3" ? "yes" : "no";
        } else {
          currentValue = configVars[key] === "yes" ? "yes" : "no";
        }

        let toggleOn = `Enable ${configMapping[key]}`;
        let toggleOff = `Disable ${configMapping[key]}\n♻️ Currently: ${currentValue}\n▱▱▱▱▱▱▱▰▰▰▰▰▰▰▰▰\n\n`;

        numberedList.push(`${index}. ${toggleOn}`);
        numberedList.push(`${index + 1}. ${toggleOff}`);
        index += 2;
      });

      // Split into two pages
      const chunkSize = Math.ceil(numberedList.length / 2);
      const pages = [
        numberedList.slice(0, chunkSize),
        numberedList.slice(chunkSize),
      ];

      const sendPage = async (pageIndex) => {
        if (pageIndex < 0 || pageIndex >= pages.length) return;

        const randomImage =
          Math.random() < 0.5
            ? "https://res.cloudinary.com/dptzpfgtm/image/upload/v1751638065/whatsapp_uploads/igo74lzeatfkujrfivkw.jpg"
            : "https://res.cloudinary.com/dptzpfgtm/image/upload/v1751638065/whatsapp_uploads/igo74lzeatfkujrfivkw.jpg";

        const message = `🌟 *BWM XMD VARS LIST* 🌟\n📌 Reply with a number to toggle a variable\n (Page ${
          pageIndex + 1
        }/${pages.length})\n\n${pages[pageIndex].join(
          "\n"
        )}\n\n📌 *Reply with a number to toggle a variable or navigate pages:*\n▶️ *${chunkSize * 2 + 1}* Next Page\n◀️ *${
          chunkSize * 2 + 2
        }* Previous Page`;

        const sentMessage = await zk.sendMessage(chatId, {
  image: { url: randomImage },
  caption: message,
  contextInfo: {
    mentionedJid: [],
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363285388090068@newsletter",
      newsletterName: "BWM-XMD",
      serverMessageId: Math.floor(100000 + Math.random() * 900000),
    },
  },
});

        // Listen for Reply
        zk.ev.on("messages.upsert", async (update) => {
          const message = update.messages[0];
          if (!message.message || !message.message.extendedTextMessage) return;

          const responseText = message.message.extendedTextMessage.text.trim();
          if (
            message.message.extendedTextMessage.contextInfo &&
            message.message.extendedTextMessage.contextInfo.stanzaId ===
              sentMessage.key.id
          ) {
            const selectedIndex = parseInt(responseText);
            if (
              isNaN(selectedIndex) ||
              (selectedIndex < 1 && selectedIndex > chunkSize * 2 + 2)
            ) {
              return repondre(
                "❌ *Invalid number. Please select a valid option.*"
              );
            }

            if (selectedIndex === chunkSize * 2 + 1) {
              return sendPage(pageIndex + 1);
            } else if (selectedIndex === chunkSize * 2 + 2) {
              return sendPage(pageIndex - 1);
            }

            const variableIndex = Math.floor((selectedIndex - 1) / 2);
            const selectedKey = variableKeys[variableIndex];

            let newValue = selectedIndex % 2 === 1 ? "yes" : "no";
            let presenceValue = "0";

            if (selectedKey === "Auto Typing") {
              presenceValue = newValue === "yes" ? "2" : "0";
            } else if (selectedKey === "Always Online") {
              presenceValue = newValue === "yes" ? "1" : "0";
            } else if (selectedKey === "Auto Recording") {
              presenceValue = newValue === "yes" ? "3" : "0";
            }

            if (
              selectedKey === "Auto Typing" ||
              selectedKey === "Always Online" ||
              selectedKey === "Auto Recording"
            ) {
              await heroku.patch(`/apps/${appName}/config-vars`, {
                body: { PRESENCE: presenceValue },
              });
            } else {
              await heroku.patch(`/apps/${appName}/config-vars`, {
                body: { [selectedKey]: newValue },
              });
            }

            await heroku.delete(`/apps/${appName}/dynos`);

            await zk.sendMessage(chatId, {
              text: `✅ *${configMapping[selectedKey]} is now set to ${newValue}*\n\n🔄 *Bot is restarting...*`,
            });
          }
        });
      };

      sendPage(0);
    } catch (error) {
      console.error("Error fetching Heroku vars:", error);
      await zk.sendMessage(chatId, {
        text: "⚠️ *Failed to fetch Heroku environment variables!*",
      });
    }
  }
);


adams(
  {
    nomCom: "settings",
    categorie: "Control",
  },
  async (chatId, zk, context) => {
    const { repondre, superUser } = context;

    if (!superUser) {
      return repondre(
        "🚫 *Access Denied!* This command is restricted to the bot owner."
      );
    }

    if (!validateHerokuConfig(repondre)) return;

    try {
      const configVars = await heroku.get(`/apps/${appName}/config-vars`);
      let numberedList = [];
      let index = 1;

      // Get keys that are not excluded
      const variableKeys = Object.keys(configMapping).filter(
        (key) => !EXCLUDED_VARS.includes(key)
      );

      variableKeys.forEach((key) => {
        let currentValue;

        if (key === "Auto Typing") {
          currentValue = configVars.PRESENCE === "2" ? "yes" : "no";
        } else if (key === "Always Online") {
          currentValue = configVars.PRESENCE === "1" ? "yes" : "no";
        } else if (key === "Auto Recording") {
          currentValue = configVars.PRESENCE === "3" ? "yes" : "no";
        } else {
          currentValue = configVars[key] === "yes" ? "yes" : "no";
        }

        let toggleOn = `Enable ${configMapping[key]}`;
        let toggleOff = `Disable ${configMapping[key]}\n♻️ Currently: ${currentValue}\n▱▱▱▱▱▱▱▰▰▰▰▰▰▰▰▰\n\n`;

        numberedList.push(`${index}. ${toggleOn}`);
        numberedList.push(`${index + 1}. ${toggleOff}`);
        index += 2;
      });

      // Split into two pages
      const chunkSize = Math.ceil(numberedList.length / 2);
      const pages = [
        numberedList.slice(0, chunkSize),
        numberedList.slice(chunkSize),
      ];

      const sendPage = async (pageIndex) => {
        if (pageIndex < 0 || pageIndex >= pages.length) return;

        const randomImage =
          Math.random() < 0.5
            ? "https://res.cloudinary.com/dptzpfgtm/image/upload/v1751638065/whatsapp_uploads/igo74lzeatfkujrfivkw.jpg"
            : "https://res.cloudinary.com/dptzpfgtm/image/upload/v1751638065/whatsapp_uploads/igo74lzeatfkujrfivkw.jpg";

        const message = `🌟 *BWM XMD VARS LIST* 🌟\n📌 Reply with a number to toggle a variable\n (Page ${
          pageIndex + 1
        }/${pages.length})\n\n${pages[pageIndex].join(
          "\n"
        )}\n\n📌 *Reply with a number to toggle a variable or navigate pages:*\n▶️ *${chunkSize * 2 + 1}* Next Page\n◀️ *${
          chunkSize * 2 + 2
        }* Previous Page`;

        const sentMessage = await zk.sendMessage(chatId, {
  image: { url: randomImage },
  caption: message,
  contextInfo: {
    mentionedJid: [],
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363285388090068@newsletter",
      newsletterName: "BWM-XMD",
      serverMessageId: Math.floor(100000 + Math.random() * 900000),
    },
  },
});

        // Listen for Reply
        zk.ev.on("messages.upsert", async (update) => {
          const message = update.messages[0];
          if (!message.message || !message.message.extendedTextMessage) return;

          const responseText = message.message.extendedTextMessage.text.trim();
          if (
            message.message.extendedTextMessage.contextInfo &&
            message.message.extendedTextMessage.contextInfo.stanzaId ===
              sentMessage.key.id
          ) {
            const selectedIndex = parseInt(responseText);
            if (
              isNaN(selectedIndex) ||
              (selectedIndex < 1 && selectedIndex > chunkSize * 2 + 2)
            ) {
              return repondre(
                "❌ *Invalid number. Please select a valid option.*"
              );
            }

            if (selectedIndex === chunkSize * 2 + 1) {
              return sendPage(pageIndex + 1);
            } else if (selectedIndex === chunkSize * 2 + 2) {
              return sendPage(pageIndex - 1);
            }

            const variableIndex = Math.floor((selectedIndex - 1) / 2);
            const selectedKey = variableKeys[variableIndex];

            let newValue = selectedIndex % 2 === 1 ? "yes" : "no";
            let presenceValue = "0";

            if (selectedKey === "Auto Typing") {
              presenceValue = newValue === "yes" ? "2" : "0";
            } else if (selectedKey === "Always Online") {
              presenceValue = newValue === "yes" ? "1" : "0";
            } else if (selectedKey === "Auto Recording") {
              presenceValue = newValue === "yes" ? "3" : "0";
            }

            if (
              selectedKey === "Auto Typing" ||
              selectedKey === "Always Online" ||
              selectedKey === "Auto Recording"
            ) {
              await heroku.patch(`/apps/${appName}/config-vars`, {
                body: { PRESENCE: presenceValue },
              });
            } else {
              await heroku.patch(`/apps/${appName}/config-vars`, {
                body: { [selectedKey]: newValue },
              });
            }

            await heroku.delete(`/apps/${appName}/dynos`);

            await zk.sendMessage(chatId, {
              text: `✅ *${configMapping[selectedKey]} is now set to ${newValue}*\n\n🔄 *Bot is restarting...*`,
            });
          }
        });
      };

      sendPage(0);
    } catch (error) {
      console.error("Error fetching Heroku vars:", error);
      await zk.sendMessage(chatId, {
        text: "⚠️ *Failed to fetch Heroku environment variables!*",
      });
    }
  }
);
// Command to set or update Heroku environment variables
adams({
  nomCom: 'setvar',
  categorie: "Control"
}, async (chatId, zk, context) => {
  const { repondre, superUser, arg } = context;

  if (!superUser) {
    return repondre("🚫 *Access Denied!* This command is restricted to the bot owner.");
  }

  if (!validateHerokuConfig(repondre)) return;

  if (!arg[0] || !arg[0].includes('=')) {
    return repondre(
      "📋 *Usage Instructions:*\n\n" +
      "To set or update a variable:\n" +
      "`setvar VAR_NAME=value`\n\n" +
      "Example:\n" +
      "`setvar AUTO_REPLY=yes`\n" +
      "`setvar AUTO_REPLY=no`"
    );
  }

  const [varName, value] = arg[0].split('=');
  if (!varName || !value) {
    return repondre("⚠️ *Invalid format!* Use `VAR_NAME=value` format.");
  }

  try {
    await heroku.patch(`/apps/${appName}/config-vars`, {
      body: {
        [varName]: value
      }
    });

    await heroku.delete(`/apps/${appName}/dynos`);

    await zk.sendMessage(chatId, {
      text: `✅ *${varName.replace(/_/g, " ")} updated successfully!*\n\n🔄 *Bot is restarting...*`
    });
  } catch (error) {
    console.error("Error updating Heroku var or restarting dynos:", error);
    await zk.sendMessage(chatId, { text: "⚠️ *Failed to update Heroku environment variable!*" });
  }
});

// Command to restart the bot using the local endpoint
adams({
  nomCom: 'update',
  categorie: "Control"
}, async (chatId, zk, context) => {
  const { repondre, superUser } = context;

  if (!superUser) {
    return repondre("🚫 *Access Denied!* This command is restricted to the bot owner.");
  }

  try {
    // Send restart request to local endpoint
    const response = await fetch('http://localhost:' + (process.env.PORT || 3000) + '/restart');
    await zk.sendMessage(chatId, {
      text: "✅ *Bot restart initiated!*\n\n🔄 *Please wait a moment while the bot restarts...*"
    });
  } catch (error) {
    console.error("Error restarting bot:", error);
    await zk.sendMessage(chatId, {
      text: "⚠️ *Failed to restart bot!*\n\nError: " + error.message
    });
  }
});

adams({
  nomCom: 'restart',
  categorie: "Control"
}, async (chatId, zk, context) => {
  const { repondre, superUser } = context;

  if (!superUser) {
    return repondre("🚫 *Access Denied!* This command is restricted to the bot owner.");
  }

  try {
    // Send restart request to local endpoint
    const response = await fetch('http://localhost:' + (process.env.PORT || 3000) + '/restart');
    await zk.sendMessage(chatId, {
      text: "✅ *Bot restart initiated!*\n\n🔄 *Please wait a moment while the bot restarts...*"
    });
  } catch (error) {
    console.error("Error restarting bot:", error);
    await zk.sendMessage(chatId, {
      text: "⚠️ *Failed to restart bot!*\n\nError: " + error.message
    });
  }
});

// Ping command to check bot status
adams({
  nomCom: 'status',
  categorie: "Control"
}, async (chatId, zk, context) => {
  const { repondre } = context;
  
  try {
    // Check health endpoint
    const start = Date.now();
    const response = await fetch('http://localhost:' + (process.env.PORT || 3000) + '/health');
    const data = await response.json();
    const latency = Date.now() - start;
    
    const statusMessage = `🏓 *Pong!*
    
📊 *Status:* ${data.status}
⏱️ *Uptime:* ${Math.floor(data.uptime)} seconds
🔄 *Restart Attempts:* ${data.restartAttempts}
💾 *Memory Usage:*
  - RSS: ${(data.memory.rss / 1024 / 1024).toFixed(2)} MB
  - Heap: ${(data.memory.heapUsed / 1024 / 1024).toFixed(2)}/${(data.memory.heapTotal / 1024 / 1024).toFixed(2)} MB
⏳ *Latency:* ${latency}ms
🕒 *Timestamp:* ${data.timestamp}`;

    await repondre(statusMessage);
  } catch (error) {
    console.error("Ping error:", error);
    await repondre("⚠️ *Failed to check bot status!*\n\nError: " + error.message);
  }
});
