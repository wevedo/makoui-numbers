const {
  adams
} = require("../Ibrahim/adams");
adams(
  { nomCom: "github", reaction: "💻", nomFichier: __filename },
  async (dest, zk, commandeOptions) => {
    const { ms, arg } = commandeOptions;
    const userJid = ms?.sender || dest;

    if (!arg || arg.length === 0) {
      return await zk.sendMessage(dest, {
        text: "Please specify a GitHub username. Example: *github torvalds*",
        mentions: [userJid]
      });
    }

    try {
      const username = arg[0];
      
      // Show waiting message
      await zk.sendMessage(dest, { 
        text: `Fetching GitHub data for *${username}*... ⏳`,
        mentions: [userJid]
      });

      // Fetch GitHub user data
      const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
      const data = await response.json();

      if (data.message === "Not Found") {
        throw new Error("User not found on GitHub");
      }

      // Format GitHub information
      const githubInfo = `
👨‍💻 *GitHub Profile*: [${data.login}](${data.html_url})
📛 *Name*: ${data.name || "Not specified"}
📝 *Bio*: ${data.bio || "No bio available"}
🏢 *Company*: ${data.company || "Not specified"}
🌍 *Location*: ${data.location || "Not specified"}
📧 *Email*: ${data.email || "Not public"}
🔗 *Website*: ${data.blog || "Not specified"}

📊 *Stats*:
├─ 📂 *Public Repos*: ${data.public_repos}
├─ 🪙 *Followers*: ${data.followers}
├─ 👥 *Following*: ${data.following}
└─ 📅 *Created*: ${new Date(data.created_at).toLocaleDateString()}

${data.hireable ? "✅ Available for hire" : "❌ Not available for hire"}
      `.trim();

      // Send text info
      await zk.sendMessage(dest, {
        text: `*GitHub User Info* 💻\n${githubInfo}`,
        mentions: [userJid]
      });

      // Send profile picture if available
      if (data.avatar_url) {
        await zk.sendMessage(dest, {
          image: { url: data.avatar_url },
          caption: `Profile picture of ${data.login}`
        });
      }

    } catch (error) {
      console.error("GitHub command error:", error);
      await zk.sendMessage(dest, {
        text: `❌ Failed to get GitHub data for "${arg[0]}"\nError: ${error.message}\n\nPlease check the username and try again.`,
        mentions: [userJid]
      });
    }
  }
);
