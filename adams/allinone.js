

const { adams } = require('../Ibrahim/adams');
const traduire = require("../Ibrahim/traduction") ;
const { default: axios } = require('axios');
const pkg = require('@whiskeysockets/baileys');
const { generateWAMessageFromContent, proto } = pkg;

adams({
  nomCom: "mail",
  aliases: ["tempmail", "temp"], // Adding aliases
  reaction: "📧",
  categorie: "General"
}, async (dest, zk, commandeOptions) => {

  const { repondre, prefixe, ms } = commandeOptions;

  try {
    // Generate a random username for the temporary email
    const randomUsername = Math.random().toString(36).substring(2, 12);
    const tempEmail = `${randomUsername}@1secmail.com`;

    // Inform the user about their temporary email
    await zk.sendMessage(dest, { text: `Your temporary email is: ${tempEmail}\n\nYou can use this email for temporary purposes. I will notify you if you receive any emails.` }, { quoted: ms });

    // Function to extract links from email content
    const extractLinks = (text) => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      return text.match(urlRegex);
    };

    // Polling the email inbox for new emails every 30 seconds
    const checkEmails = async () => {
      try {
        const response = await fetch(`https://www.1secmail.com/api/v1/?action=getMessages&login=${randomUsername}&domain=1secmail.com`);
        const emails = await response.json();

        if (emails && emails.length > 0) {
          for (const email of emails) {
            const emailDetailsResponse = await fetch(`https://www.1secmail.com/api/v1/?action=readMessage&login=${randomUsername}&domain=1secmail.com&id=${email.id}`);
            const emailDetails = await emailDetailsResponse.json();

            const links = extractLinks(emailDetails.textBody);
            const linkText = links ? links.join('\n') : 'No links found in the email content.';

            await zk.sendMessage(dest, { text: `You have received a new email!\n\nFrom: ${emailDetails.from}\nSubject: ${emailDetails.subject}\n\n${emailDetails.textBody}\n\nLinks found:\n${linkText}` }, { quoted: ms });
          }
        }
      } catch (error) {
        console.error('Error checking temporary email:', error.message);
      }
    };

    // Start polling every 30 seconds
    const emailCheckInterval = setInterval(checkEmails, 30000);

    // Stop polling after 10 minutes (600,000 milliseconds)
    setTimeout(() => {
      clearInterval(emailCheckInterval);
      zk.sendMessage(dest, { text: 'Your temporary email session has ended. Please create a new temporary email if needed.' }, { quoted: ms });
    }, 600000); // 600000 ms = 10 minutes

  } catch (error) {
    console.error('Error generating temporary email:', error.message);
    await zk.sendMessage(dest, { text: 'Error generating temporary email. Please try again later.' }, { quoted: ms });
  }
});



adams({
  nomCom: "time",
  reaction: "⌚",
  categorie: "General"
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;

  try {
    if (!arg || arg.length === 0) {
      return repondre(`Enter the name of the country you want to know its time and date`);
    }

    const cal = arg.join(' ');
    const response = await fetch(`https://levanter.onrender.com/time?code=${cal}`);
    const data = await response.json();
    const timeA = data.result[0].name;
    const timeB = data.result[0].time;
    const timeC = data.result[0].timeZone;

    await repondre(`Live Time in *${timeA}* Stats:\n\n*Date & Time:* ${timeB}\n*TimeZone:* ${timeC}\n\n> *POWERED BY BWM-XMD*`);
  } catch (e) {
    repondre("That country name is incorrect!");
  }
});
 


  
