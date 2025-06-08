
const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const ytSearch = require("yt-search");

// Random images for newsletter
const randomImages = [
  "https://files.catbox.moe/2kcb4s.jpeg",
  "https://files.catbox.moe/2kcb4s.jpeg",
  "https://files.catbox.moe/2kcb4s.jpeg"
];

adams({
  'nomCom': "movie",
  'categorie': 'Search',
  'reaction': '🎬'
}, async (dest, zk, commandOptions) => {
  const { arg, repondre, ms } = commandOptions;
  
  if (!arg[0]) {
    return repondre("Please provide a movie name.");
  }

  const query = arg.join(" ");
  let movieData = null;
  let trailerData = null;

  // Get random image for newsletter
  const randomImage = randomImages[Math.floor(Math.random() * randomImages.length)];

  // Step 1: Try to get movie info from OMDB API
  try {
    const omdbResponse = await axios.get(`http://www.omdbapi.com/?apikey=742b2d09&t=${encodeURIComponent(query)}&plot=full`);
    if (omdbResponse.data.Response === "True") {
      movieData = omdbResponse.data;
    }
  } catch (error) {
    console.error("OMDB API error:", error);
  }

  // Step 2: Try to find trailer on YouTube
  try {
    const searchResults = await ytSearch(`${query} official trailer`);
    if (searchResults.videos.length > 0) {
      trailerData = searchResults.videos[0];
      
      // Get download link from your API
      const apiResponse = await axios.get(
        `https://api.bwmxmd.online/api/download/ytmp4?apikey=ibraah-tech&url=${encodeURIComponent(trailerData.url)}`
      );
      
      if (apiResponse.data?.success) {
        trailerData.downloadUrl = apiResponse.data.result.download_url;
      }
    }
  } catch (error) {
    console.error("YouTube search error:", error);
  }


  // Common newsletter footer
  const newsletterFooter = `
════════════════
*BWM XMD MOVIE SEARCH*
════════════════
🎥 *Download full movies in my telegram channel for free*
> https://t.me/ibrahimtechai
> ©Ibrahim Adams 
════════════════
${movieData?.imdbID ? `📌 *IMDb Trailer:* https://www.imdb.com/title/${movieData.imdbID}/` : ''}
${trailerData?.url ? `📌 *YouTube Trailer:* ${trailerData.url}` : ''}
════════════════

`.trim();

  // Step 3: Send the best available response
  if (trailerData?.downloadUrl && movieData) {
    // Case 1: Both trailer and movie info available
    const movieInfo = `
${newsletterFooter}
🎬 *${movieData.Title}* (${movieData.Year})
⭐ Rating: ${movieData.imdbRating || 'N/A'} • ${movieData.Rated || 'N/A'}
⏳ Runtime: ${movieData.Runtime || 'N/A'}
🎭 Genre: ${movieData.Genre || 'N/A'}
📅 Released: ${movieData.Released || 'N/A'}
🎥 Director: ${movieData.Director || 'N/A'}
👨‍👩‍👧‍👦 Actors: ${movieData.Actors || 'N/A'}
📜 Plot: ${movieData.Plot || 'N/A'}
    `.trim();

    await zk.sendMessage(dest, {
      video: { url: trailerData.downloadUrl },
      mimetype: "video/mp4",
      caption: movieInfo,
      contextInfo: {
        mentionedJid: [],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363285388090068@newsletter",
          newsletterName: "BWM-XMD",
          serverMessageId: Math.floor(100000 + Math.random() * 900000),
        },
        externalAdReply: {
          title: movieData.Title,
          body: `🎬 ${movieData.Year} • ${movieData.Runtime || ''}`,
          mediaType: 2,
          thumbnailUrl: movieData.Poster || trailerData.thumbnail,
          sourceUrl: trailerData.url,
          renderLargerThumbnail: true,
          showAdAttribution: true
        }
      }
    }, { quoted: ms });

  } else if (trailerData?.downloadUrl) {
    // Case 2: Only trailer available
    await zk.sendMessage(dest, {
      video: { url: trailerData.downloadUrl },
      mimetype: "video/mp4",
      caption: `🎥 *${trailerData.title}*\n⏳ Duration: ${trailerData.timestamp}\n\n${newsletterFooter}`,
      contextInfo: {
        mentionedJid: [],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363285388090068@newsletter",
          newsletterName: "BWM-XMD",
          serverMessageId: Math.floor(100000 + Math.random() * 900000),
        },
        externalAdReply: {
          title: trailerData.title,
          body: `🎥 ${query} Trailer`,
          mediaType: 2,
          thumbnailUrl: trailerData.thumbnail,
          sourceUrl: trailerData.url,
          renderLargerThumbnail: true,
          showAdAttribution: true
        }
      }
    }, { quoted: ms });

  } else if (movieData) {
    // Case 3: Only movie info available
    const movieInfo = `
${newsletterFooter}
🎬 *${movieData.Title}* (${movieData.Year})
⭐ Rating: ${movieData.imdbRating || 'N/A'} • ${movieData.Rated || 'N/A'}
⏳ Runtime: ${movieData.Runtime || 'N/A'}
🎭 Genre: ${movieData.Genre || 'N/A'}
📅 Released: ${movieData.Released || 'N/A'}
🎥 Director: ${movieData.Director || 'N/A'}
👨‍👩‍👧‍👦 Actors: ${movieData.Actors || 'N/A'}
📜 Plot: ${movieData.Plot || 'N/A'}
    `.trim();

    await zk.sendMessage(dest, {
      image: { url: movieData.Poster || randomImage },
      caption: movieInfo,
      contextInfo: {
        mentionedJid: [],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363285388090068@newsletter",
          newsletterName: "BWM-XMD",
          serverMessageId: Math.floor(100000 + Math.random() * 900000),
        }
      }
    }, { quoted: ms });

  } else {
    // Case 4: Nothing found - send just newsletter info
    await zk.sendMessage(dest, {
      image: { url: randomImage },
      caption: `❌ Couldn't find any information for "${query}"\n\n${newsletterFooter}`,
      contextInfo: {
        mentionedJid: [],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363285388090068@newsletter",
          newsletterName: "BWM-XMD",
          serverMessageId: Math.floor(100000 + Math.random() * 900000),
        }
      }
    }, { quoted: ms });
  }
});
