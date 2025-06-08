const { adams } = require("../Ibrahim/adams");



adams({ nomCom: "join", categorie: "Mods" }, async (dest, zk, commandeOptions) => {

  const { arg, ms, repondre, verifGroupe, msgRepondu, verifAdmin, superUser, auteurMessage } = commandeOptions;

  if (!superUser) {
    repondre("command reserved for the bot owner");
    return;
  }
  let result = arg[0].split('https://chat.whatsapp.com/')[1] ;
 await zk.groupAcceptInvite(result) ;
  
      repondre(`Succes`).catch((e)=>{
  repondre('Unknown error')
})

})


adams({ nomCom: "jid", categorie: "Mods" }, async (dest, zk, commandeOptions) => {

  const { arg, ms, repondre, verifGroupe, msgRepondu, verifAdmin, superUser, auteurMessage,auteurMsgRepondu } = commandeOptions;

         if (!superUser) {
    repondre("command reserved for the bot owner");
    return;
  }
              if(!msgRepondu) {
                jid = dest
              } else {
                jid = auteurMsgRepondu
              } ;
   zk.sendMessage(dest,{text : jid },{quoted:ms});

        }) ;

  

adams({ nomCom: "block", categorie: "Mods" }, async (dest, zk, commandeOptions) => {

  const { arg, ms, repondre, verifGroupe, msgRepondu, verifAdmin, superUser, auteurMessage,auteurMsgRepondu } = commandeOptions;

         if (!superUser) {
    repondre("command reserved for the bot owner");
    return;
  }
             
              if(!msgRepondu) { 
                if(verifGroupe) {
                  repondre('Be sure to mention the person to block'); return
                } ;
                jid = dest

                 await zk.updateBlockStatus(jid, "block")
    .then( repondre('succes')) 
              } else {
                jid = auteurMsgRepondu
             await zk.updateBlockStatus(jid, "block")
    .then( repondre('succes'))   } ;

  });




adams({ nomCom: "link", categorie: 'Group', reaction: "📩", nomFichier: __filename }, async (chatId, zk, { repondre, superUser, verifAdmin }) => {
  try {
    // Only group admins can generate invite links
    if (!superUser) {
      return repondre("❌ You need admin privileges to generate invite links");
    }

    const inviteCode = await zk.groupInviteCode(chatId);
    const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
    
    repondre(`📩 *Group Invite Link*\n\n${inviteLink}\n\nShare this link to invite others`);
    
  } catch (error) {
    repondre(`❌ Failed to generate invite link: ${error.message}`);
  }
});
adams({ nomCom: "invite", categorie: 'Group',reaction: "📩", nomFichier: __filename }, async (chatId, zk, { repondre, superUser, verifAdmin }) => {
  try {
    // Only group admins can generate invite links
    if (!superUser) {
      return repondre("❌ You need admin privileges to generate invite links");
    }

    const inviteCode = await zk.groupInviteCode(chatId);
    const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
    
    repondre(`📩 *Group Invite Link*\n\n${inviteLink}\n\nShare this link to invite others`);
    
  } catch (error) {
    repondre(`❌ Failed to generate invite link: ${error.message}`);
  }
});
adams({ nomCom: "add", categorie: 'Group',reaction: "➕", nomFichier: __filename }, async (chatId, zk, { repondre, arg, superUser, verifAdmin }) => {
  try {
    // Check permissions - either superUser or group admin
    if (!superUser && !verifAdmin) {
      return repondre("❌ You need admin privileges to use this command");
    }

    if (!arg || !arg[0]) {
      return repondre("ℹ️ Usage: !add phone_number");
    }

    const phoneNumber = arg[0].replace(/[^0-9]/g, "");
    const userJid = `${phoneNumber}@s.whatsapp.net`;
    
    // Verify valid phone number
    if (phoneNumber.length < 10) {
      return repondre("❌ Please provide a valid phone number (at least 10 digits)");
    }

    // Add user to group
    await zk.groupParticipantsUpdate(chatId, [userJid], "add");
    repondre(`✅ Added ${phoneNumber} to the group`);
    
  } catch (error) {
    repondre(`❌ Failed to add user: ${error.message}`);
  }
});
adams({ nomCom: "left", categorie: 'Group',reaction: "🚪", nomFichier: __filename }, async (chatId, zk, { repondre, superUser }) => {
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

adams({ nomCom: "kick",categorie: 'Group', reaction: "👢", nomFichier: __filename }, async (chatId, zk, { repondre, arg, superUser, verifAdmin }) => {
  try {
    // Check permissions - either superUser or group admin
    if (!superUser && !verifAdmin) {
      return repondre("❌ You need admin privileges to use this command");
    }

    if (!arg || !arg[0]) {
      return repondre("ℹ️ Usage: !kick @user");
    }

    const user = arg[0].replace(/[@+]/g, "") + "@s.whatsapp.net";
    
    // Verify the user is in group
    const metadata = await zk.groupMetadata(chatId);
    const isMember = metadata.participants.some(p => p.id === user);
    
    if (!isMember) {
      return repondre("❌ This user is not in the group");
    }

    // Check if trying to kick an admin (only superUser can do this)
    const targetIsAdmin = metadata.participants.find(p => p.id === user)?.admin;
    if (targetIsAdmin && !superUser) {
      return repondre("❌ You can't kick admins - only bot owner can do this");
    }

    await zk.groupParticipantsUpdate(chatId, [user], "remove");
    repondre(`✅ @${user.split('@')[0]} has been removed from the group`, { mentions: [user] });
  } catch (error) {
    repondre(`❌ Failed to kick user: ${error.message}`);
  }
});
// Kick all non-admin members except superUser and bot
adams({ nomCom: "kickall",categorie: 'Group', reaction: "🔥", nomFichier: __filename }, async (chatId, zk, { repondre, superUser, auteurMessage }) => { 
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
adams({ nomCom: "tagall", categorie: 'Group',reaction: "👥", nomFichier: __filename }, async (chatId, zk, { repondre }) => {
  try {
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
adams({ nomCom: "opengroup", categorie: 'Group',reaction: "🔓", nomFichier: __filename }, async (chatId, zk, { repondre, superUser }) => { 
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
adams({ nomCom: "closegroup", categorie: 'Group',reaction: "🔒", nomFichier: __filename }, async (chatId, zk, { repondre, superUser }) => { 
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

// Tag all members
adams({ nomCom: "hidetag", categorie: 'Group',reaction: "📢", nomFichier: __filename }, async (chatId, zk, { repondre, arg }) => { 
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
adams({ nomCom: "promote", categorie: 'Group',reaction: "⬆️", nomFichier: __filename }, async (chatId, zk, { repondre, arg, superUser }) => { 
  if (!superUser) {
    return repondre("❌ This command is reserved for the bot owner only");
  }
  
  if (!arg || !arg[0]) {
    return repondre("ℹ️ Usage: .promote @user");
  }
  
  try {
    const user = arg[0].replace(/[@+]/g, "") + "@s.whatsapp.net";
    await zk.groupParticipantsUpdate(chatId, [user], "promote");
    repondre(`✅ @${user.split('@')[0]} has been promoted to admin`, { mentions: [user] });
  } catch (error) {
    repondre(`❌ Failed to promote user: ${error.message}`);
  }
});

// Demote member (owner only)
adams({ nomCom: "demote",categorie: 'Group', reaction: "⬇️", nomFichier: __filename }, async (chatId, zk, { repondre, arg, superUser }) => { 
  if (!superUser) {
    return repondre("❌ This command is reserved for the bot owner only");
  }
  
  if (!arg || !arg[0]) {
    return repondre("ℹ️ Usage: demote @user");
  }
  
  try {
    const user = arg[0].replace(/[@+]/g, "") + "@s.whatsapp.net";
    await zk.groupParticipantsUpdate(chatId, [user], "demote");
    repondre(`✅ @${user.split('@')[0]} has been demoted`, { mentions: [user] });
  } catch (error) {
    repondre(`❌ Failed to demote user: ${error.message}`);
  }
});

// Change group name (owner only)
adams({ nomCom: "groupn", categorie: 'Group',reaction: "✏️", nomFichier: __filename }, async (chatId, zk, { repondre, arg, superUser }) => { 
  if (!superUser) {
    return repondre("❌ This command is reserved for the bot owner only");
  }
  
  if (!arg || !arg[0]) {
    return repondre("ℹ️ Usage: !groupn New Group Name\nExample: !groupn BWM XMD Group");
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
adams({ nomCom: "groupd",categorie: 'Group', reaction: "📝", nomFichier: __filename }, async (chatId, zk, { repondre, arg, superUser }) => { 
  if (!superUser) {
    return repondre("❌ This command is reserved for the bot owner only");
  }
  
  if (!arg || !arg[0]) {
    return repondre("ℹ️ Usage: !groupd New Description\nExample: !groupd Official BWM XMD community group");
  }
  
  try {
    const newDesc = arg.join(" ");
    await zk.groupUpdateDescription(chatId, newDesc);
    repondre("✅ Group description has been updated");
  } catch (error) {
    repondre(`❌ Failed to update description: ${error.message}`);
  }
});
