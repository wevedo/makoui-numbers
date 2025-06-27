const { adams } = require("../Ibrahim/adams");

// Utility function to extract JID from different formats
function extractJID(input) {
  if (!input) return null;
  
  // Handle direct JIDs (like 254710772666@s.whatsapp.net)
  if (input.includes('@s.whatsapp.net') || input.includes('@lid')) {
    return input;
  }
  
  // Handle phone numbers (remove all non-digit characters)
  const phone = input.replace(/[^0-9]/g, '');
  if (phone.length >= 10) {
    return `${phone}@s.whatsapp.net`;
  }
  
  return null;
}

// Join group via invite link
adams({ nomCom: "join", categorie: "Mods" }, async (dest, zk, commandeOptions) => {
  const { arg, repondre, superUser } = commandeOptions;

  if (!superUser) {
    repondre("Command reserved for the bot owner");
    return;
  }
  
  if (!arg || !arg[0]) {
    repondre("Please provide a WhatsApp group invite link");
    return;
  }

  try {
    const result = arg[0].split('https://chat.whatsapp.com/')[1];
    await zk.groupAcceptInvite(result);
    repondre(`✅ Successfully joined the group`);
  } catch (e) {
    repondre('❌ Failed to join group: ' + e.message);
  }
});

// Get JID of user
adams({ nomCom: "jid", categorie: "Mods" }, async (dest, zk, commandeOptions) => {
  const { repondre, msgRepondu, auteurMsgRepondu, superUser, ms } = commandeOptions;

  if (!superUser) {
    repondre("Command reserved for the bot owner");
    return;
  }

  const jid = msgRepondu ? auteurMsgRepondu : dest;
  zk.sendMessage(dest, { text: jid }, { quoted: ms });
});

// Block user
adams({ nomCom: "block", categorie: "Mods" }, async (dest, zk, commandeOptions) => {
  const { repondre, msgRepondu, auteurMsgRepondu, superUser, arg, verifGroupe } = commandeOptions;

  if (!superUser) {
    repondre("Command reserved for the bot owner");
    return;
  }

  let jid;
  if (msgRepondu) {
    jid = auteurMsgRepondu;
  } else if (arg && arg[0]) {
    jid = extractJID(arg[0]);
    if (!jid) {
      return repondre("Please mention a user or reply to their message");
    }
  } else {
    return repondre('Please mention a user or reply to their message');
  }

  try {
    await zk.updateBlockStatus(jid, "block");
    repondre(`✅ Successfully blocked ${jid.split('@')[0]}`);
  } catch (e) {
    repondre('❌ Failed to block: ' + e.message);
  }
});

// Unblock user
adams({ nomCom: "unblock", categorie: "Mods" }, async (dest, zk, commandeOptions) => {
  const { repondre, msgRepondu, auteurMsgRepondu, superUser, arg } = commandeOptions;

  if (!superUser) {
    repondre("Command reserved for the bot owner");
    return;
  }

  let jid;
  if (msgRepondu) {
    jid = auteurMsgRepondu;
  } else if (arg && arg[0]) {
    jid = extractJID(arg[0]);
    if (!jid) {
      return repondre("Please mention a user or reply to their message");
    }
  } else {
    return repondre('Please mention a user or reply to their message');
  }

  try {
    await zk.updateBlockStatus(jid, "unblock");
    repondre(`✅ Successfully unblocked ${jid.split('@')[0]}`);
  } catch (e) {
    repondre('❌ Failed to unblock: ' + e.message);
  }
});

// Group invite link
adams({ nomCom: "invite", categorie: 'Group', reaction: "📩", nomFichier: __filename }, async (chatId, zk, { repondre, superUser, verifAdmin }) => {
  try {
    if (!superUser && !verifAdmin) {
      return repondre("❌ You need admin privileges to generate invite links");
    }

    const inviteCode = await zk.groupInviteCode(chatId);
    const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
    
    repondre(`📩 *Group Invite Link*\n\n${inviteLink}\n\nShare this link to invite others`);
  } catch (error) {
    repondre(`❌ Failed to generate invite link: ${error.message}`);
  }
});

// Add user to group
adams({ nomCom: "add", categorie: 'Group', reaction: "➕", nomFichier: __filename }, async (chatId, zk, { repondre, arg, superUser, verifAdmin }) => {
  try {
    if (!superUser && !verifAdmin) {
      return repondre("❌ You need admin privileges to use this command");
    }

    if (!arg || !arg[0]) {
      return repondre("ℹ️ Usage: !add phone_number\nOr reply to a user's message with !add");
    }

    const jid = extractJID(arg[0]);
    if (!jid) {
      return repondre("❌ Please provide a valid phone number (at least 10 digits)");
    }

    await zk.groupParticipantsUpdate(chatId, [jid], "add");
    repondre(`✅ Added ${jid.split('@')[0]} to the group`);
  } catch (error) {
    repondre(`❌ Failed to add user: ${error.message}`);
  }
});

// Leave group
adams({ nomCom: "left", categorie: 'Group', reaction: "🚪", nomFichier: __filename }, async (chatId, zk, { repondre, superUser }) => {
  try {
    if (!superUser) {
      return repondre("❌ This command is reserved for the bot owner only");
    }

    const metadata = await zk.groupMetadata(chatId);
    repondre(`👋 Leaving group: ${metadata.subject || "Unknown Group"}`);
    await zk.groupLeave(chatId);
  } catch (error) {
    repondre(`❌ Failed to leave group: ${error.message}`);
  }
});
// Kick user from group
adams({ nomCom: "remove", categorie: 'Group', reaction: "👢", nomFichier: __filename }, async (chatId, zk, { repondre, arg, superUser, verifAdmin, msgRepondu, auteurMsgRepondu }) => {
  try {
    if (!superUser && !verifAdmin) {
      return repondre("❌ You need admin privileges to use this command");
    }

    let userJid;
    if (msgRepondu) {
      userJid = auteurMsgRepondu;
    } else if (arg && arg[0]) {
      userJid = extractJID(arg[0]);
      if (!userJid) {
        return repondre("ℹ️ Usage: !remove @user\nOr reply to a user's message with !kick");
      }
    } else {
      return repondre("ℹ️ Usage: !remove @user\nOr reply to a user's message with !kick");
    }

    // Verify the user is in group
    const metadata = await zk.groupMetadata(chatId);
    const isMember = metadata.participants.some(p => p.id === userJid);
    
    if (!isMember) {
      return repondre("❌ This user is not in the group");
    }

    // Check if trying to kick an admin (only superUser can do this)
    const targetIsAdmin = metadata.participants.find(p => p.id === userJid)?.admin;
    if (targetIsAdmin && !superUser) {
      return repondre("❌ You can't kick admins - only bot owner can do this");
    }

    await zk.groupParticipantsUpdate(chatId, [userJid], "remove");
    repondre(`✅ @${userJid.split('@')[0]} has been removed from the group`, { mentions: [userJid] });
  } catch (error) {
    repondre(`❌ Failed to kick user: ${error.message}`);
  }
});
// Kick user from group
adams({ nomCom: "kick", categorie: 'Group', reaction: "👢", nomFichier: __filename }, async (chatId, zk, { repondre, arg, superUser, verifAdmin, msgRepondu, auteurMsgRepondu }) => {
  try {
    if (!superUser && !verifAdmin) {
      return repondre("❌ You need admin privileges to use this command");
    }

    let userJid;
    if (msgRepondu) {
      userJid = auteurMsgRepondu;
    } else if (arg && arg[0]) {
      userJid = extractJID(arg[0]);
      if (!userJid) {
        return repondre("ℹ️ Usage: !kick @user\nOr reply to a user's message with !kick");
      }
    } else {
      return repondre("ℹ️ Usage: !kick @user\nOr reply to a user's message with !kick");
    }

    // Verify the user is in group
    const metadata = await zk.groupMetadata(chatId);
    const isMember = metadata.participants.some(p => p.id === userJid);
    
    if (!isMember) {
      return repondre("❌ This user is not in the group");
    }

    // Check if trying to kick an admin (only superUser can do this)
    const targetIsAdmin = metadata.participants.find(p => p.id === userJid)?.admin;
    if (targetIsAdmin && !superUser) {
      return repondre("❌ You can't kick admins - only bot owner can do this");
    }

    await zk.groupParticipantsUpdate(chatId, [userJid], "remove");
    repondre(`✅ @${userJid.split('@')[0]} has been removed from the group`, { mentions: [userJid] });
  } catch (error) {
    repondre(`❌ Failed to kick user: ${error.message}`);
  }
});

// Kick all non-admin members
adams({ nomCom: "kickall", categorie: 'Group', reaction: "🔥", nomFichier: __filename }, async (chatId, zk, { repondre, superUser, auteurMessage }) => { 
  if (!superUser) {
    return repondre("❌ This command is reserved for the bot owner only");
  }
  
  try {
    const metadata = await zk.groupMetadata(chatId);
    const botJid = zk.user.id;
    
    // Get regular members to kick (non-admins, not you, not bot)
    const toKick = metadata.participants
      .filter(p => 
        p.id !== auteurMessage && 
        p.id !== botJid &&
        !p.admin
      );
    
    if (toKick.length === 0) {
      return repondre("ℹ️ No regular members to kick (only admins and bot remain)");
    }
    
    // Create mention message before kicking
    const mentionMessage = `🔥 *Mass Removal* 🔥\n\n` +
                         `The following members were removed:\n` +
                         `${toKick.map(m => `◎ @${m.id.split('@')[0]}`).join('\n')}`;
    
    await zk.sendMessage(chatId, {
      text: mentionMessage,
      mentions: toKick.map(m => m.id)
    });
    
    // Actually perform the kick
    await zk.groupParticipantsUpdate(chatId, toKick.map(m => m.id), "remove");
    
    repondre(`✅ Kicked ${toKick.length} members\n🛡️ Admins and bot were spared`);
  } catch (error) {
    repondre(`❌ Failed to kick members: ${error.message}`);
  }
});

// Enhanced member list with tagging
adams({ nomCom: "tagall", categorie: 'Group', reaction: "👥", nomFichier: __filename }, async (chatId, zk, { repondre, verifAdmin, superUser }) => {
  try {
    if (!superUser && !verifAdmin) {
      return repondre("❌ You need admin privileges to use this command");
    }

    const metadata = await zk.groupMetadata(chatId);
    const allMembers = metadata.participants;
    
    // Create tagged list
    const memberList = allMembers.map(m => {
      const number = m.id.split('@')[0];
      return m.admin ? `🛡️ @${number}` : `◎ @${number}`;
    }).join('\n');
    
    const message = `👥 *Group Members* 👥\n\n` +
                   `📊 Total: ${allMembers.length}\n` +
                   `🛡️ Admins: ${allMembers.filter(m => m.admin).length}\n\n` +
                   `${memberList}`;
    
    await zk.sendMessage(chatId, {
      text: message,
      mentions: allMembers.map(m => m.id)
    });
  } catch (error) {
    repondre(`❌ Failed to get members list: ${error.message}`);
  }
});

// Open group settings (owner only)
adams({ nomCom: "opengroup", categorie: 'Group', reaction: "🔓", nomFichier: __filename }, async (chatId, zk, { repondre, superUser }) => { 
  if (!superUser) {
    return repondre("❌ This command is reserved for the bot owner only");
  }
  
  try {
    await zk.groupSettingUpdate(chatId, "not_announcement");
    repondre("✅ Group is now open - all members can send messages");
  } catch (error) {
    repondre(`❌ Failed to open group: ${error.message}`);
  }
});

// Close group settings (owner only)
adams({ nomCom: "closegroup", categorie: 'Group', reaction: "🔒", nomFichier: __filename }, async (chatId, zk, { repondre, superUser }) => { 
  if (!superUser) {
    return repondre("❌ This command is reserved for the bot owner only");
  }
  
  try {
    await zk.groupSettingUpdate(chatId, "announcement");
    repondre("✅ Group is now closed - only admins can send messages");
  } catch (error) {
    repondre(`❌ Failed to close group: ${error.message}`);
  }
});

// Tag all members with hidden mention
adams({ nomCom: "hidetag", categorie: 'Group', reaction: "📢", nomFichier: __filename }, async (chatId, zk, { repondre, arg, verifAdmin, superUser }) => { 
  if (!superUser && !verifAdmin) {
    return repondre("❌ You need admin privileges to use this command");
  }

  try {
    const metadata = await zk.groupMetadata(chatId);
    const mentions = metadata.participants.map(p => p.id);
    const message = arg?.join(' ') || "@everyone";
    
    await zk.sendMessage(chatId, { 
      text: `*${message}*` + ' '.repeat(mentions.length),
      mentions 
    });
  } catch (error) {
    repondre(`❌ Failed to tag members: ${error.message}`);
  }
});

// Promote member (owner only)
adams({ nomCom: "promote", categorie: 'Group', reaction: "⬆️", nomFichier: __filename }, async (chatId, zk, { repondre, arg, superUser, msgRepondu, auteurMsgRepondu }) => { 
  if (!superUser) {
    return repondre("❌ This command is reserved for the bot owner only");
  }
  
  let userJid;
  if (msgRepondu) {
    userJid = auteurMsgRepondu;
  } else if (arg && arg[0]) {
    userJid = extractJID(arg[0]);
    if (!userJid) {
      return repondre("ℹ️ Usage: .promote @user\nOr reply to user's message with .promote");
    }
  } else {
    return repondre("ℹ️ Usage: .promote @user\nOr reply to user's message with .promote");
  }

  try {
    await zk.groupParticipantsUpdate(chatId, [userJid], "promote");
    repondre(`✅ @${userJid.split('@')[0]} has been promoted to admin`, { mentions: [userJid] });
  } catch (error) {
    repondre(`❌ Failed to promote user: ${error.message}`);
  }
});

// Demote member (owner only)
adams({ nomCom: "demote", categorie: 'Group', reaction: "⬇️", nomFichier: __filename }, async (chatId, zk, { repondre, arg, superUser, msgRepondu, auteurMsgRepondu }) => { 
  if (!superUser) {
    return repondre("❌ This command is reserved for the bot owner only");
  }
  
  let userJid;
  if (msgRepondu) {
    userJid = auteurMsgRepondu;
  } else if (arg && arg[0]) {
    userJid = extractJID(arg[0]);
    if (!userJid) {
      return repondre("ℹ️ Usage: .demote @user\nOr reply to user's message with .demote");
    }
  } else {
    return repondre("ℹ️ Usage: .demote @user\nOr reply to user's message with .demote");
  }

  try {
    await zk.groupParticipantsUpdate(chatId, [userJid], "demote");
    repondre(`✅ @${userJid.split('@')[0]} has been demoted`, { mentions: [userJid] });
  } catch (error) {
    repondre(`❌ Failed to demote user: ${error.message}`);
  }
});

// Change group name (owner only)
adams({ nomCom: "groupn", categorie: 'Group', reaction: "✏️", nomFichier: __filename }, async (chatId, zk, { repondre, arg, superUser }) => { 
  if (!superUser) {
    return repondre("❌ This command is reserved for the bot owner only");
  }
  
  if (!arg || !arg[0]) {
    return repondre("ℹ️ Usage: !groupn New Group Name\nExample: !groupn My Awesome Group");
  }
  
  try {
    const newName = arg.join(" ");
    await zk.groupUpdateSubject(chatId, newName);
    repondre(`✅ Group name changed to: ${newName}`);
  } catch (error) {
    repondre(`❌ Failed to change group name: ${error.message}`);
  }
});

// Change group description (owner only)
adams({ nomCom: "groupd", categorie: 'Group', reaction: "📝", nomFichier: __filename }, async (chatId, zk, { repondre, arg, superUser }) => { 
  if (!superUser) {
    return repondre("❌ This command is reserved for the bot owner only");
  }
  
  if (!arg || !arg[0]) {
    return repondre("ℹ️ Usage: !groupd New Description\nExample: !groupd Official group for our community");
  }
  
  try {
    const newDesc = arg.join(" ");
    await zk.groupUpdateDescription(chatId, newDesc);
    repondre("✅ Group description has been updated");
  } catch (error) {
    repondre(`❌ Failed to update description: ${error.message}`);
  }
});
// Get group info
adams({ nomCom: "ginfo", categorie: 'Group', reaction: "ℹ️", nomFichier: __filename }, async (chatId, zk, { repondre }) => {
  try {
    const metadata = await zk.groupMetadata(chatId);
    const participants = metadata.participants;
    
    const infoMessage = `ℹ️ *Group Information*\n\n` +
                      `🔖 Name: ${metadata.subject}\n` +
                      `🆔 ID: ${metadata.id}\n` +
                      `👥 Participants: ${participants.length}\n` +
                      `🛡️ Admins: ${participants.filter(p => p.admin).length}\n` +
                      `📅 Created: ${new Date(metadata.creation * 1000).toLocaleString()}\n` +
                      `👑 Owner: ${metadata.owner ? metadata.owner.split('@')[0] : 'Unknown'}`;
    
    repondre(infoMessage);
  } catch (error) {
    repondre(`❌ Failed to get group info: ${error.message}`);
  }
});
