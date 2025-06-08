const { adams } = require("../Ibrahim/adams");
const fs = require("fs-extra");
const { createContext } = require("../Ibrahim/helper");

// Constants for the new branding
const BOT_NAME = "BWM_XMD";
const BOT_TAGLINE = "Next-Gen WhatsApp Automation";
const EMOJI_THEME = {
  success: "⚡",
  error: "💢",
  info: "ℹ️",
  admin: "🛡️",
  broadcast: "📡"
};

// Senttoall command with proper names
adams({ nomCom: "senttoall", categorie: 'Group', reaction: "📨" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg, verifAdmin, superUser } = commandeOptions;
  
  // Verify group and get metadata
  try {
    const metadata = await zk.groupMetadata(dest);
    const senderName = ms.pushName || "Admin";

    if (!verifAdmin && !superUser) {
      return repondre({
        text: `${EMOJI_THEME.admin} *Access Denied*\nMass messaging requires admin privileges`,
        ...createContext(dest, {
          title: "Admin Privileges Required",
          body: "Broadcast command restricted"
        })
      });
    }

    if (!arg?.length) {
      return repondre({
        text: `${EMOJI_THEME.info} *Command Usage*\nExample: !senttoall Check your email for updates`,
        ...createContext(dest, {
          title: "Usage Instructions",
          body: "How to use senttoall"
        })
      });
    }

    const message = arg.join(' ');
    const members = metadata.participants;
    
    const progressMsg = await repondre({
      text: `${EMOJI_THEME.broadcast} *Mass DM Initiated*\nProcessing ${members.length} recipients...`,
      ...createContext(dest, {
        title: "Mass DM in Progress",
        body: "Sending individual messages"
      })
    });

    let success = 0;
    const failed = [];
    
    for (const member of members) {
      try {
        await zk.sendMessage(member.id, {
          text: `✉️ *Message from ${senderName}*\n\n${message}\n\n_${BOT_TAGLINE}_`,
          ...createContext(member.id, {
            title: `GROUP NAME ${metadata.subject || "Group"}`,
            body: senderName
          })
        });
        success++;
      } catch (error) {
        failed.push(member.id.split('@')[0]);
      }
    }

    const resultText = [
      `${EMOJI_THEME.success} *Broadcast Complete*`,
      `✅ Success: ${success}`,
      failed.length ? `❌ Failed: ${failed.length}\n${failed.slice(0, 5).join(', ')}${failed.length > 5 ? '...' : ''}` : ''
    ].filter(Boolean).join('\n');

    await zk.sendMessage(dest, {
      text: resultText,
      ...createContext(dest, {
        title: "Broadcast Results",
        body: `Delivered to ${success} members`
      })
    }, { quoted: ms });

    if (progressMsg?.key) {
      await zk.sendMessage(dest, { delete: progressMsg.key });
    }

  } catch (error) {
    repondre({
      text: `${EMOJI_THEME.error} *Error*\nFailed to process command: ${error.message}`,
      ...createContext(dest, {
        title: "Command Error",
        body: "Please try again later"
      })
    });
  }
});

// VCF command for group contacts export
adams({ nomCom: "vcf", categorie: 'Group', reaction: "📇" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre } = commandeOptions;

  try {
    // Check if in group
    if (!dest.endsWith("@g.us")) {
      return repondre({
        text: "❌ This command only works in groups.\n\n🚀 BWM XMD by Ibrahim Adams",
        ...createContext(dest, {
          title: "Group Command Only",
          body: "VCF export requires group chat"
        })
      });
    }

    // Notify processing start
    await repondre({
      text: "⌛ Generating contact file for all group members...",
      ...createContext(dest, {
        title: "Processing Request",
        body: "Creating VCF file"
      })
    });

    // Get group data
    const groupData = await zk.groupMetadata(dest);
    const participants = groupData.participants;
    const fileName = `BWM_Contacts_${groupData.subject.replace(/[^\w]/g, '_')}.vcf`;
    const filePath = `./${fileName}`;

    // Create VCF file
    const fileStream = fs.createWriteStream(filePath);
    
    // Special numbers mapping
    const specialNumbers = {
      "254727716045": "Sir Ibrahim Adams",
      "254106727593": "Sir Ibrahim Adams", 
      "254710772666": "Sir Ibrahim Adams"
    };

    participants.forEach((member) => {
      const number = member.id.split('@')[0];
      const name = specialNumbers[number] || `BWM Contact ${number}`;
      
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
      caption: `📇 *Group Contacts Export*\n\n✅ Contains ${participants.length} members\n🔗 ${groupData.subject}\n\n🚀 ʙᴡᴍ xᴍᴅ ʙʏ ɪʙʀᴀʜɪᴍ ᴀᴅᴀᴍs`,
      ...createContext(dest, {
        title: "VCF File Ready",
        body: "Group contacts export"
      })
    }, { quoted: ms });

    // Clean up
    fs.unlinkSync(filePath);

  } catch (error) {
    repondre({
      text: `❌ Error generating contacts: ${error.message}\n\n🚀 ʙᴡᴍ xᴍᴅ ʙʏ ɪʙʀᴀʜɪᴍ ᴀᴅᴀᴍs`,
      ...createContext(dest, {
        title: "Export Failed",
        body: "VCF generation error"
      })
    });
  }
});


adams({ nomCom: "vcard", categorie: 'Group', reaction: "📇" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre } = commandeOptions;

  try {
    // Check if in group
    if (!dest.endsWith("@g.us")) {
      return repondre({
        text: "❌ This command only works in groups.\n\n🚀 ʙᴡᴍ xᴍᴅ ʙʏ ɪʙʀᴀʜɪᴍ ᴀᴅᴀᴍs",
        ...createContext(dest, {
          title: "Group Command Only",
          body: "VCF export requires group chat"
        })
      });
    }

    // Notify processing start
    await repondre({
      text: "⌛ Generating contact file for all group members...",
      ...createContext(dest, {
        title: "Processing Request",
        body: "Creating VCF file"
      })
    });

    // Get group data
    const groupData = await zk.groupMetadata(dest);
    const participants = groupData.participants;
    const fileName = `BWM_Contacts_${groupData.subject.replace(/[^\w]/g, '_')}.vcf`;
    const filePath = `./${fileName}`;

    // Create VCF file
    const fileStream = fs.createWriteStream(filePath);
    
    // Special numbers mapping
    const specialNumbers = {
      "254727716045": "Sir Ibrahim Adams",
      "254106727593": "Sir Ibrahim Adams", 
      "254710772666": "Sir Ibrahim Adams"
    };

    participants.forEach((member) => {
      const number = member.id.split('@')[0];
      const name = specialNumbers[number] || `🚀 ʙᴡᴍ xᴍᴅ ғᴀᴍɪʟʏ ${number}`;
      
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
      caption: `📇 *Group Contacts Export*\n\n✅ Contains ${participants.length} members\n🔗 ${groupData.subject}\n\n🚀 ʙᴡᴍ xᴍᴅ ʙʏ ɪʙʀᴀʜɪᴍ ᴀᴅᴀᴍs`,
      ...createContext(dest, {
        title: "VCF File Ready",
        body: "Group contacts export"
      })
    }, { quoted: ms });

    // Clean up
    fs.unlinkSync(filePath);

  } catch (error) {
    repondre({
      text: `❌ Error generating contacts: ${error.message}\n\n🚀 ʙᴡᴍ xᴍᴅ ʙʏ ɪʙʀᴀʜɪᴍ ᴀᴅᴀᴍs`,
      ...createContext(dest, {
        title: "Export Failed",
        body: "VCF generation error"
      })
    });
  }
});

