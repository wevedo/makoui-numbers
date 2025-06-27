const { adams } = require("../Ibrahim/adams");
const fs = require("fs-extra");
const { createContext } = require("../Ibrahim/helper");

// Enhanced branding constants
const BOT_BRANDING = {
  NAME: "BWM_XMD",
  TAGLINE: "Next-Gen WhatsApp Automation",
  AUTHOR: "Ibrahim Adams",
  EMOJI: {
    SUCCESS: "⚡",
    ERROR: "💢",
    INFO: "ℹ️",
    ADMIN: "🛡️",
    BROADCAST: "📡",
    CONTACT: "📇",
    PROCESSING: "⌛"
  },
  FOOTER: (text = "") => `${text}\n\n🚀 ʙᴡᴍ xᴍᴅ ʙʏ ɪʙʀᴀʜɪᴍ ᴀᴅᴀᴍs`
};

// Special contact mapping
const SPECIAL_CONTACTS = {
  "254727716045": "Sir Ibrahim Adams",
  "254106727593": "Sir Ibrahim Adams", 
  "254710772666": "Sir Ibrahim Adams"
};

// Utility function to clean group names for filenames
const cleanGroupName = (name) => (name || "Group").replace(/[^\w]/g, '_').slice(0, 50);

// Enhanced senttoall command with rate limiting
adams({ 
  nomCom: "senttoall", 
  categorie: 'Group', 
  reaction: BOT_BRANDING.EMOJI.BROADCAST 
}, async (dest, zk, { ms, repondre, arg, verifAdmin, superUser }) => {
  
  // Verify permissions
  if (!verifAdmin && !superUser) {
    return repondre({
      text: BOT_BRANDING.FOOTER(`${BOT_BRANDING.EMOJI.ADMIN} *Access Denied*\nMass messaging requires admin privileges`),
      ...createContext(dest, {
        title: "Admin Privileges Required",
        body: "Broadcast command restricted"
      })
    });
  }

  // Check for message content
  if (!arg?.length) {
    return repondre({
      text: BOT_BRANDING.FOOTER(`${BOT_BRANDING.EMOJI.INFO} *Command Usage*\nExample: !senttoall Check your email for updates`),
      ...createContext(dest, {
        title: "Usage Instructions",
        body: "How to use senttoall"
      })
    });
  }

  try {
    const metadata = await zk.groupMetadata(dest);
    const senderName = ms.pushName || "Admin";
    const members = metadata.participants;
    const message = arg.join(' ');

    // Progress notification
    const progressMsg = await repondre({
      text: BOT_BRANDING.FOOTER(`${BOT_BRANDING.EMOJI.BROADCAST} *Mass DM Initiated*\nProcessing ${members.length} recipients...`),
      ...createContext(dest, {
        title: "Mass DM in Progress",
        body: "Sending individual messages"
      })
    });

    // Rate-limited sending
    let success = 0;
    const failed = [];
    const BATCH_SIZE = 5; // Messages per second
    const DELAY = 1000; // 1 second delay between batches

    for (let i = 0; i < members.length; i += BATCH_SIZE) {
      const batch = members.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(async (member) => {
        try {
          await zk.sendMessage(member.id, {
            text: `✉️ *Message from ${senderName}*\n\n${message}\n\n_${BOT_BRANDING.TAGLINE}_`,
            ...createContext(member.id, {
              title: `${metadata.subject || "Group"} Notification`,
              body: senderName
            })
          });
          success++;
        } catch (error) {
          failed.push(member.id.split('@')[0]);
        }
      }));
      
      if (i + BATCH_SIZE < members.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY));
      }
    }

    // Send results
    const resultText = [
      `${BOT_BRANDING.EMOJI.SUCCESS} *Broadcast Complete*`,
      `✅ Success: ${success}`,
      failed.length ? `❌ Failed: ${failed.length}\n${failed.slice(0, 5).join(', ')}${failed.length > 5 ? '...' : ''}` : ''
    ].filter(Boolean).join('\n');

    await zk.sendMessage(dest, {
      text: BOT_BRANDING.FOOTER(resultText),
      ...createContext(dest, {
        title: "Broadcast Results",
        body: `Delivered to ${success} members`
      })
    }, { quoted: ms });

    // Clean up progress message
    if (progressMsg?.key) {
      await zk.sendMessage(dest, { delete: progressMsg.key });
    }

  } catch (error) {
    repondre({
      text: BOT_BRANDING.FOOTER(`${BOT_BRANDING.EMOJI.ERROR} *Error*\nFailed to process command: ${error.message}`),
      ...createContext(dest, {
        title: "Command Error",
        body: "Please try again later"
      })
    });
  }
});

// Unified VCF export command (handles both vcf and vcard)
const vcfExport = async (dest, zk, { ms, repondre }, command) => {
  try {
    // Validate group context
    if (!dest.endsWith("@g.us")) {
      return repondre({
        text: BOT_BRANDING.FOOTER("❌ This command only works in groups."),
        ...createContext(dest, {
          title: "Group Command Only",
          body: "VCF export requires group chat"
        })
      });
    }

    // Processing notification
    await repondre({
      text: BOT_BRANDING.FOOTER(`${BOT_BRANDING.EMOJI.PROCESSING} Generating contact file...`),
      ...createContext(dest, {
        title: "Processing Request",
        body: "Creating VCF file"
      })
    });

    // Get group data
    const groupData = await zk.groupMetadata(dest);
    const participants = groupData.participants;
    const fileName = `BWM_Contacts_${cleanGroupName(groupData.subject)}.vcf`;
    const filePath = `./${fileName}`;

    // Create VCF file
    const fileStream = fs.createWriteStream(filePath);
    
    participants.forEach((member) => {
      const number = member.id.split('@')[0];
      const name = SPECIAL_CONTACTS[number] || `🚀 ʙᴡᴍ xᴍᴅ ғᴀᴍɪʟʏ ${number}`;
      
      fileStream.write(
        `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;type=CELL;type=VOICE;waid=${number}:+${number}\nEND:VCARD\n\n`
      );
    });

    fileStream.end();

    // Wait for file completion
    await new Promise((resolve) => fileStream.on('finish', resolve));

    // Send VCF file
    await zk.sendMessage(dest, {
      document: { url: filePath },
      mimetype: 'text/vcard',
      fileName: fileName,
      caption: BOT_BRANDING.FOOTER(`📇 *Group Contacts Export*\n\n✅ Contains ${participants.length} members\n🔗 ${groupData.subject}`),
      ...createContext(dest, {
        title: "VCF File Ready",
        body: "Group contacts export"
      })
    }, { quoted: ms });

    // Clean up file
    fs.unlinkSync(filePath);

  } catch (error) {
    repondre({
      text: BOT_BRANDING.FOOTER(`${BOT_BRANDING.EMOJI.ERROR} Error generating contacts: ${error.message}`),
      ...createContext(dest, {
        title: "Export Failed",
        body: "VCF generation error"
      })
    });
  }
};

// Register both command variants
adams({ nomCom: "vcf", categorie: 'Group', reaction: BOT_BRANDING.EMOJI.CONTACT }, vcfExport);
adams({ nomCom: "vcard", categorie: 'Group', reaction: BOT_BRANDING.EMOJI.CONTACT }, vcfExport);

// New Group Info Command
adams({ nomCom: "groupinfo", categorie: 'Group', reaction: "ℹ️" }, async (dest, zk, { repondre }) => {
  try {
    if (!dest.endsWith("@g.us")) {
      return repondre(BOT_BRANDING.FOOTER("❌ This command only works in groups."));
    }

    const metadata = await zk.groupMetadata(dest);
    const participants = metadata.participants;
    const admins = participants.filter(p => p.admin).length;
    const owner = metadata.owner || "Unknown";

    const infoMessage = [
      `📌 *Group Info*`,
      `🔖 Name: ${metadata.subject || "Unnamed Group"}`,
      `👥 Members: ${participants.length}`,
      `🛡️ Admins: ${admins}`,
      `👑 Owner: ${owner.split('@')[0]}`,
      `📅 Created: ${new Date(metadata.creation * 1000).toLocaleString()}`,
      `🆔 ID: ${metadata.id}`
    ].join('\n');

    repondre(BOT_BRANDING.FOOTER(infoMessage));

  } catch (error) {
    repondre(BOT_BRANDING.FOOTER(`❌ Error: ${error.message}`));
  }
});

// New Group Backup Command
adams({ nomCom: "backup", categorie: 'Group', reaction: "💾" }, async (dest, zk, { repondre, superUser }) => {
  if (!superUser) {
    return repondre(BOT_BRANDING.FOOTER("❌ This command is reserved for the bot owner."));
  }

  try {
    if (!dest.endsWith("@g.us")) {
      return repondre(BOT_BRANDING.FOOTER("❌ This command only works in groups."));
    }

    const metadata = await zk.groupMetadata(dest);
    const fileName = `BWM_Backup_${cleanGroupName(metadata.subject)}.json`;
    const filePath = `./${fileName}`;

    // Create backup file
    fs.writeFileSync(filePath, JSON.stringify({
      groupId: metadata.id,
      subject: metadata.subject,
      creation: metadata.creation,
      owner: metadata.owner,
      participants: metadata.participants.map(p => ({
        id: p.id,
        admin: p.admin
      }))
    }, null, 2));

    // Send backup file
    await zk.sendMessage(dest, {
      document: { url: filePath },
      mimetype: 'application/json',
      fileName: fileName,
      caption: BOT_BRANDING.FOOTER(`💾 *Group Backup*\n\n✅ Successfully backed up group data`)
    });

    // Clean up
    fs.unlinkSync(filePath);

  } catch (error) {
    repondre(BOT_BRANDING.FOOTER(`❌ Backup failed: ${error.message}`));
  }
});
