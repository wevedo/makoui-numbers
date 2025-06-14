

const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const ytSearch = require("yt-search");

// Audio command configuration
adams(
  {
    nomCom: "play2",
    aliases: ["song2", "audio", "mp3", "dlmp3", "sound"],
    categorie: "Search",
    reaction: "🎵",
  },
  async (dest, zk, commandOptions) => {
    const { arg, ms, repondre } = commandOptions;

    if (!arg[0]) {
      return repondre("Please provide a song name.");
    }

    const query = arg.join(" ");
    let waitMessage = null;

    try {
      // Send initial message
      waitMessage = await zk.sendMessage(
        dest, 
        { text: "🔍 Finding your song... Please wait" }, 
        { 
          quoted: ms,
          disappearingMessagesInChat: true,
          ephemeralExpiration: 24*60*60
        }
      );

      // 1. First try YouTube
      try {
        const searchResults = await ytSearch(query);
        if (searchResults.videos.length > 0) {
          const video = searchResults.videos[0];
          const videoUrl = video.url;
          const videoTitle = video.title || query;
          const videoDuration = video.timestamp || "Unknown";
          const videoThumbnail = video.thumbnail || "https://files.catbox.moe/sd49da.jpg";

          await zk.sendMessage(
            dest, 
            { 
              text: "⬇️ Getting your audio ready...",
              edit: waitMessage.key 
            },
            {
              disappearingMessagesInChat: true,
              ephemeralExpiration: 24*60*60
            }
          );

          const apiKey = '_0x5aff35,_0x1876stqr';
          const encodedUrl = encodeURIComponent(videoUrl);
          
          const audioApis = [
              `https://api.giftedtech.web.id/api/download/ytmp3?apikey=${apiKey}&url=`,
  `https://apis.davidcyriltech.web.id/download/ytmp3?url=`,
  `https://api.giftedtech.web.id/api/download/ytmusic?apikey=${apiKey}&url=`,
  `https://apis.davidcyriltech.web.id/youtube/mp3?url=`,
  `https://api.giftedtech.web.id/api/download/ytmp3?apikey=${apiKey}&url=`
          ];

          let downloadUrl = null;
          
          // Try each API until one works
          for (const api of audioApis) {
            try {
              const response = await axios.get(api);
              if (response.data?.result?.download_url || response.data?.url) {
                downloadUrl = response.data.result?.download_url || response.data.url;
                break;
              }
            } catch (e) {
              console.log(`API ${api} failed, trying next one...`);
            }
          }

          if (downloadUrl) {
            await sendAudio(
              downloadUrl,
              videoTitle,
              videoDuration,
              videoThumbnail,
              videoUrl,
              "YouTube"
            );
            return;
          }
        }
      } catch (ytError) {
        console.log("YouTube download failed, trying SoundCloud...");
      }

      // 2. Try SoundCloud if YouTube fails
      try {
        await zk.sendMessage(
          dest, 
          { 
            text: "🔍 Checking another source...",
            edit: waitMessage.key 
          },
          {
            disappearingMessagesInChat: true,
            ephemeralExpiration: 24*60*60
          }
        );

        // Search SoundCloud
        const scSearch = await axios.get(`https://apis-keith.vercel.app/search/soundcloud?q=${encodeURIComponent(query)}`);
        
        if (scSearch.data?.status && scSearch.data?.result?.result?.length > 0) {
          const track = scSearch.data.result.result[0];
          const trackUrl = track.url;
          const trackTitle = track.title || query;
          const trackDuration = track.timestamp || "Unknown";
          const trackThumbnail = track.thumb || "https://files.catbox.moe/sd49da.jpg";
          const artist = track.artist || "Unknown Artist";

          await zk.sendMessage(
            dest, 
            { 
              text: "⬇️ Preparing your track...",
              edit: waitMessage.key 
            },
            {
              disappearingMessagesInChat: true,
              ephemeralExpiration: 24*60*60
            }
          );

          // Get download URL from SoundCloud
          const scDownload = await axios.get(`https://apis-keith.vercel.app/download/soundcloud?url=${encodeURIComponent(trackUrl)}`);
          
          if (scDownload.data?.result?.downloadUrl) {
            await sendAudio(
              scDownload.data.result.downloadUrl,
              `${trackTitle} - ${artist}`,
              trackDuration,
              trackThumbnail,
              trackUrl,
              "SoundCloud"
            );
            return;
          }
        }
      } catch (scError) {
        console.log("SoundCloud download failed, trying Spotify...");
      }

      // 3. Try Spotify as last resort
      try {
        await zk.sendMessage(
          dest, 
          { 
            text: "🔍 Looking for your song...",
            edit: waitMessage.key 
          },
          {
            disappearingMessagesInChat: true,
            ephemeralExpiration: 24*60*60
          }
        );

        const spotifyResponse = await axios.get(`https://api.dreaded.site/api/spotifydl?title=${encodeURIComponent(query)}`);
        
        if (spotifyResponse.data?.success) {
          await sendAudio(
            spotifyResponse.data.result.downloadLink,
            spotifyResponse.data.result.title || query,
            "Unknown",
            "https://files.catbox.moe/sd49da.jpg",
            `https://open.spotify.com/search/${encodeURIComponent(query)}`,
            "Spotify"
          );
          return;
        }
      } catch (spotifyError) {
        console.log("Spotify download failed");
      }

      // If all methods fail
      throw new Error("Couldn't find the song");

    } catch (error) {
      console.error("Error during download process:", error.message);
      
      await zk.sendMessage(
        dest, 
        { 
          text: "😢 Sorry, I couldn't get that song. Please try a different one." 
        },
        {
          quoted: ms,
          disappearingMessagesInChat: true,
          ephemeralExpiration: 24*60*60
        }
      );
    }

    async function sendAudio(url, title, duration, thumbnail, sourceUrl, source) {
      title = title || "Unknown Track";
      duration = duration || "Unknown";
      thumbnail = thumbnail || "https://files.catbox.moe/sd49da.jpg";
      sourceUrl = sourceUrl || "https://example.com";

      const downloadingMessage = {
        text: `
=========================
 *BWM XMD DOWNLOADER*
=========================
 *Source :* ${source}
=========================
 *Title :* ${title}
 *Duration :* ${duration}
=========================

> © Sir Ibrahim Adams
        `,
        contextInfo: {
          mentionedJid: [ms.sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363285388090068@newsletter',
            newsletterName: "BWM-XMD",
            serverMessageId: 143,
          },
          externalAdReply: {
            title: title,
            body: `From ${source}`,
            mediaType: 1,
            thumbnailUrl: thumbnail,
            sourceUrl: sourceUrl,
            renderLargerThumbnail: false,
            showAdAttribution: true,
          },
        },
      };

      await zk.sendMessage(dest, downloadingMessage, { quoted: ms });

      const audioPayload = {
        audio: { url },
        mimetype: "audio/mpeg",
        fileName: `${title.substring(0, 50)}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: title,
            body: `🎶 ${title}`,
            mediaType: 1,
            sourceUrl: sourceUrl,
            thumbnailUrl: thumbnail,
            renderLargerThumbnail: true,
            showAdAttribution: true,
          },
        },
      };

      await zk.sendMessage(dest, audioPayload, { quoted: ms });
    }
  }
);

// Video command configuration
adams(
  {
    nomCom: "video2",
    aliases: ["vida", "mp4", "ytmp4", "dlmp4"],
    categorie: "Search",
    reaction: "🎥",
  },
  async (dest, zk, commandOptions) => {
    const { arg, ms, repondre } = commandOptions;

    if (!arg[0]) {
      return repondre("Please provide a video name.");
    }

    const query = arg.join(" ");

    try {
      // Search for the video on YouTube
      const searchResults = await ytSearch(query);
      if (!searchResults.videos.length) {
        return repondre("No video found for your search.");
      }

      const firstVideo = searchResults.videos[0];
      const videoUrl = firstVideo.url;
      const videoTitle = firstVideo.title;
      const videoDuration = firstVideo.timestamp;
      const videoViews = firstVideo.views;
      const videoThumbnail = firstVideo.thumbnail;

      // Format the downloading message
      const downloadingMessage = {
        text: `
=========================
 *BWM XMD DOWNLOADER*
=========================
=========================
 *Title :* ${videoTitle}
 *Duration :* ${videoDuration}
 *Views :* ${videoViews}
=========================

> © Sir Ibrahim Adams
        `,
        contextInfo: {
          mentionedJid: [ms.sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363285388090068@newsletter',
            newsletterName: "BWM-XMD",
            serverMessageId: 143,
          },
          externalAdReply: {
            title: videoTitle,
            body: "BWM XMD Downloader",
            mediaType: 1,
            thumbnailUrl: "https://files.catbox.moe/sd49da.jpg",
            sourceUrl: videoUrl,
            renderLargerThumbnail: false,
            showAdAttribution: true,
          },
        },
      };
      await zk.sendMessage(dest, downloadingMessage, { quoted: ms });

      // Send wait message (updated to be editable)
      const waitMessage = await zk.sendMessage(
        dest, 
        { text: "📥 Just a moment, your video is coming..." }, 
        { 
          quoted: ms,
          disappearingMessagesInChat: true,
          ephemeralExpiration: 24*60*60
        }
      );

      const apiKey = 'gifted_api_6kuv56877d';
      const encodedUrl = encodeURIComponent(videoUrl);
      
      const videoApis = [
        `https://api.giftedtech.my.id/api/download/ytmp4?apikey=${apiKey}&url=${encodedUrl}`,
        `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodedUrl}`,
        `https://api.giftedtech.my.id/api/download/ytv?apikey=${apiKey}&url=${encodedUrl}`,
        `https://apis.davidcyriltech.my.id/youtube/mp4?url=${encodedUrl}`,
        `https://api.giftedtech.my.id/api/download/ytvideo?apikey=${apiKey}&url=${encodedUrl}`
      ];

      let downloadUrl = null;
      
      // Try each API until one works
      for (const api of videoApis) {
        try {
          const response = await axios.get(api);
          if (response.data?.result?.download_url || response.data?.url) {
            downloadUrl = response.data.result?.download_url || response.data.url;
            break;
          }
        } catch (e) {
          console.log(`API ${api} failed, trying next one...`);
        }
      }

      if (!downloadUrl) {
        // Edit wait message to show error
        await zk.sendMessage(
          dest,
          {
            text: "❌ Sorry, couldn't download the video. Please try again later.",
            edit: waitMessage.key
          },
          {
            disappearingMessagesInChat: true,
            ephemeralExpiration: 24*60*60
          }
        );
        return;
      }

      // Edit wait message to show success before sending video
      await zk.sendMessage(
        dest,
        {
          text: "✅ Your video is ready!",
          edit: waitMessage.key
        },
        {
          disappearingMessagesInChat: true,
          ephemeralExpiration: 24*60*60
        }
      );

      // Send the video file
      const videoPayload = {
        video: { url: downloadUrl },
        mimetype: "video/mp4",
        caption: `🎥 *${videoTitle}*\n⏳ *Duration:* ${videoDuration}`,
        contextInfo: {
          externalAdReply: {
            title: videoTitle,
            body: `🎥 ${videoTitle}`,
            mediaType: 1,
            sourceUrl: videoUrl,
            thumbnailUrl: videoThumbnail,
            renderLargerThumbnail: true,
            showAdAttribution: true,
          },
        },
      };

      await zk.sendMessage(dest, videoPayload, { quoted: ms });
    } catch (error) {
      console.error("Error during download process:", error.message);
      return repondre("Oops! Something went wrong. Please try again.");
    }
  }
);
