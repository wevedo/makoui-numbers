const { adams } = require("../Ibrahim/adams");
const s = require("../config");

// Helper function for common settings commands
async function handleSettingCommand(commandeOptions, settingName, settingKey, responses = {}) {
  const { repondre, arg, ms, superUser } = commandeOptions;
  
  if (!superUser) {
    return repondre(`*This command is restricted to the bot owner or Lucky owner.*`);
  }

  if (!arg[0]) {
    return repondre(
      `⚙️ *${settingName} Settings*\n\n` +
      `• *${s.PREFIX}${settingKey} yes* - Enable\n` +
      `• *${s.PREFIX}${settingKey} no* - Disable\n` +
      `• *${s.PREFIX}${settingKey} status* - Check current status`
    );
  }

  const option = arg[0].toLowerCase();
  let responseMessage = '';
  
  switch (option) {
    case "yes":
      s[settingKey] = 'yes';
      responseMessage = responses.enabled || `${settingName} has been enabled successfully.`;
      break;
    case "no":
      s[settingKey] = 'no';
      responseMessage = responses.disabled || `${settingName} has been disabled successfully.`;
      break;
    case "status":
      const status = s[settingKey] === 'yes' ? 'ENABLED ✅' : 'DISABLED ❌';
      responseMessage = `🛠️ ${settingName} Status: ${status}`;
      break;
    default:
      return repondre(`Invalid option. Use *${s.PREFIXE}${settingKey} yes/no/status*`);
  }

  await repondre(responseMessage);
}

// Anti-call command
adams({
  nomCom: 'anticall',
  categorie: "Settings",
  reaction: "📵",
  desc: "Block incoming calls to the bot"
}, async (dest, zk, commandeOptions) => {
  await handleSettingCommand(commandeOptions, "Anti-call", "AUTO_REJECT_CALL");
});

// Auto-react command
adams({
  nomCom: 'autoreact',
  categorie: "Settings",
  reaction: "💖",
  desc: "Automatically react to messages"
}, async (dest, zk, commandeOptions) => {
  await handleSettingCommand(commandeOptions, "Auto-react", "AUTO_REACT");
});

// Auto-read status command
adams({
  nomCom: 'autoreadstatus',
  categorie: "Settings",
  reaction: "👀",
  desc: "Automatically read status updates"
}, async (dest, zk, commandeOptions) => {
  await handleSettingCommand(commandeOptions, "Auto-read status", "AUTO_READ_STATUS");
});

// Continue with other commands following the same pattern...

// Private mode command
adams({
  nomCom: 'privatemode',
  categorie: "Settings",
  reaction: "🔒",
  desc: "Restrict bot to owner only"
}, async (dest, zk, commandeOptions) => {
  await handleSettingCommand(commandeOptions, "Private mode", "PRIVATE_MODE", {
    enabled: "🔒 Bot is now in PRIVATE MODE (owner only)",
    disabled: "🔓 Bot is now in PUBLIC MODE"
  });
});

// ETAT commands (grouped together)
const etatCommands = [
  { name: 'autorecord', value: '3', desc: "Auto-record voice messages" },
  { name: 'autotyping', value: '2', desc: "Show typing indicators" },
  { name: 'alwaysonline', value: '1', desc: "Show always online status" }
];

etatCommands.forEach(cmd => {
  adams({
    nomCom: cmd.name,
    categorie: "Settings",
    reaction: "⚙️",
    desc: cmd.desc
  }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms, superUser } = commandeOptions;
    
    if (!superUser) {
      return repondre("*This command is restricted to the bot owner or Lucky owner.*");
    }

    if (!arg[0]) {
      return repondre(
        `⚙️ *${cmd.name.toUpperCase()} Settings*\n\n` +
        `• *${s.PREFIX}${cmd.name} yes* - Enable\n` +
        `• *${s.PREFIX}${cmd.name} no* - Disable`
      );
    }

    const option = arg[0].toLowerCase();
    if (option === "yes") {
      s.ETAT = cmd.value;
      await repondre(`${cmd.desc} has been enabled successfully.`);
    } else if (option === "no") {
      s.ETAT = 'no';
      await repondre(`${cmd.desc} has been disabled successfully.`);
    } else {
      await repondre(`Invalid option. Use *${s.PREFIXE}${cmd.name} yes/no*`);
    }
  });
});

