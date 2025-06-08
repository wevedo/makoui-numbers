
const { adams } = require("../Ibrahim/adams");
const conf = require("../config");

adams({ nomCom: "owner", categorie: "General", reaction: "🚘" }, async (dest, zk, commandeOptions) => {
    const { ms, mybotpic } = commandeOptions;
    
    const vcard =
        'BEGIN:VCARD\n' +
        'VERSION:3.0\n' +
        'FN:' + conf.OWNER_NAME + '\n' +
        'ORG:BWM-XMD;\n' +
        'TEL;type=CELL;type=VOICE;waid=' + conf.NUMERO_OWNER + ':+' + conf.NUMERO_OWNER + '\n' +
        'END:VCARD';
    
    zk.sendMessage(dest, {
        contacts: {
            displayName: conf.OWNER_NAME,
            contacts: [{ vcard }],
        },
    }, { quoted: ms });
});

adams({ nomCom: "dev", categorie: "General", reaction: "🚘" }, async (dest, zk, commandeOptions) => {
    const { ms, mybotpic } = commandeOptions;

    const devs = [
      { nom: "Ibrahim", number: "254710772666" }
    ];

    let message = "WELCOME TO BWM-XMD HELP CENTER! CONTACT THE DEVELOPER:\n\n";
    for (const dev of devs) {
      message += `• ${dev.nom} : https://wa.me/${dev.number}\n`;
    }
    
    var lien = mybotpic();
    if (lien.match(/\.(mp4|gif)$/i)) {
        try {
            zk.sendMessage(dest, { video: { url: lien }, caption: message }, { quoted: ms });
        }
        catch (e) {
            console.log("Error sending message: " + e);
            repondre("Error sending message: " + e);
        }
    } 
    else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
        try {
            zk.sendMessage(dest, { image: { url: lien }, caption: message }, { quoted: ms });
        }
        catch (e) {
            console.log("Error sending message: " + e);
            repondre("Error sending message: " + e);
        }
    } 
    else {
        repondre("Error: Invalid media link");
    }
});

adams({ nomCom: "support", categorie: "General" }, async (dest, zk, commandeOptions) => {
    const { ms, repondre, auteurMessage } = commandeOptions; 
    
    const supportMessage = `
THANK YOU FOR CHOOSING BWM-XMD

SUPPORT LINKS:
☉ Channel: https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y
☉ Group: https://chat.whatsapp.com/F5BXJci8EDS9AJ6sfKMXIS
☉ YouTube: https://www.youtube.com/@ibrahimaitech

Created by Ibrahim Adams
`;
    
    repondre(supportMessage);
    await zk.sendMessage(auteurMessage, {
        text: `THANK YOU FOR CHOOSING BWM-XMD, MAKE SURE YOU FOLLOW THESE LINKS.`
    }, { quoted: ms });
});