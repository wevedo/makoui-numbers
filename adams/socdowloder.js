const { adams } = require('../Ibrahim/adams');
const axios = require('axios');
const fs = require('fs-extra');
const { mediafireDl } = require("../Ibrahim/Function");
const conf = require(__dirname + "/../config");
const ffmpeg = require("fluent-ffmpeg");
const gis = require('g-i-s');
const ytSearch = require("yt-search");

// Helper function to extract response from various API formats
function extractResponse(data) {
    const possibleFields = ['download_url', 'alternativeUrl', 'url', 'HD', 'hd', 'withoutwatermark', 'result', 'response', 'BK9', 'message', 'data', 'video', 'audio'];
    for (const field of possibleFields) {
        if (data[field]) {
            if (typeof data[field] === 'object') {
                return extractResponse(data[field]); // Recursively check nested objects
            }
            return data[field];
        }
    }
    return data; // Return the entire response if no known field found
}

// Generic Downloader Command
adams({
    nomCom: "download",
    aliases: ["dl"],
    desc: "Download content from various platforms",
    categorie: "Download"
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg } = commandeOptions;
    const url = arg.join(' ');

    if (!url) return repondre('Please provide a valid URL');

    try {
        // Detect platform and select appropriate endpoint
        let apiUrl;
        if (url.includes('twitter.com') || url.includes('x.com')) {
            apiUrl = `https://bk9.fun/download/twitter?url=${encodeURIComponent(url)}`;
        } else if (url.includes('tiktok.com')) {
            apiUrl = `https://bk9.fun/download/tiktok?url=${encodeURIComponent(url)}`;
        } else if (url.includes('instagram.com')) {
            apiUrl = `https://bk9.fun/download/instagram?url=${encodeURIComponent(url)}`;
        } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
            apiUrl = `https://bk9.fun/download/youtube?url=${encodeURIComponent(url)}`;
        } else if (url.includes('facebook.com')) {
            apiUrl = `https://bk9.fun/download/fb?url=${encodeURIComponent(url)}`;
        } else if (url.includes('pinterest.com') || url.includes('pin.it')) {
            apiUrl = `https://bk9.fun/download/pinterest?url=${encodeURIComponent(url)}`;
        } else if (url.includes('likee.video')) {
            apiUrl = `https://bk9.fun/download/likee?url=${encodeURIComponent(url)}`;
        } else if (url.includes('mediafire.com')) {
            apiUrl = `https://bk9.fun/download/mediafire?url=${encodeURIComponent(url)}`;
        } else {
            return repondre('Unsupported platform. Supported: Twitter, TikTok, Instagram, YouTube, Facebook, Pinterest, Likee, Mediafire');
        }

        const response = await axios.get(apiUrl, {
            timeout: 15000,
            validateStatus: function (status) {
                return status < 500; // Reject only if status code is >= 500
            }
        });

        // Handle various API response formats
        const responseData = response.data || {};
        const downloadUrl = extractResponse(responseData);

        if (!downloadUrl) {
            return repondre('No downloadable content found in the response');
        }

        // Determine content type
        const isVideo = downloadUrl.includes('.mp4') || downloadUrl.includes('.mov');
        const isAudio = downloadUrl.includes('.mp3') || downloadUrl.includes('.m4a');
        const isImage = downloadUrl.includes('.jpg') || downloadUrl.includes('.png') || downloadUrl.includes('.webp');

        // Send appropriate media type
        if (isVideo) {
            await zk.sendMessage(dest, {
                video: { url: downloadUrl },
                caption: 'Downloaded by BWM XMD',
                gifPlayback: false
            }, { quoted: ms });
        } else if (isAudio) {
            await zk.sendMessage(dest, {
                audio: { url: downloadUrl },
                mimetype: 'audio/mpeg',
                fileName: 'downloaded_audio.mp3'
            }, { quoted: ms });
        } else if (isImage) {
            await zk.sendMessage(dest, {
                image: { url: downloadUrl },
                caption: 'Downloaded by BWM XMD'
            }, { quoted: ms });
        } else {
            // Default to document for unknown types
            await zk.sendMessage(dest, {
                document: { url: downloadUrl },
                fileName: 'downloaded_file'
            }, { quoted: ms });
        }

    } catch (error) {
        console.error('Download error:', error);
        
        let errorMessage = 'Failed to download content';
        if (error.response) {
            // Handle HTTP errors
            if (error.response.status === 400) {
                errorMessage = 'Invalid URL or request format';
            } else if (error.response.status === 404) {
                errorMessage = 'Content not found';
            } else if (error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Request timed out. Please try again.';
        }
        
        repondre(`❌ ${errorMessage}`);
    }
});

function extractField(data, field) {
    if (data[field]) return data[field];
    if (typeof data === 'object') {
        for (const key in data) {
            if (typeof data[key] === 'object') {
                const result = extractField(data[key], field);
                if (result) return result;
            }
        }
    }
    return null;
}

adams({
    nomCom: "ytmp3",
    aliases: ["ytaudio"],
    desc: "Download YouTube audio as MP3",
    categorie: "Download"
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg } = commandeOptions;
    const url = arg.join(' ');

    if (!url) return repondre('Please provide a YouTube URL');

    try {
        const response = await axios.get(`https://bk9.fun/download/ytmp3?url=${encodeURIComponent(url)}&type=mp3`);
        const audioUrl = extractField(response.data, 'downloadUrl') || extractField(response.data, 'url') || extractField(response.data, 'audio');
        
        if (!audioUrl) throw new Error('No audio URL found in response');

        await zk.sendMessage(dest, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: 'youtube_audio.mp3',
            caption: 'YouTube audio downloaded by BWM XMD'
        }, { quoted: ms });

    } catch (error) {
        console.error('YouTube MP3 download error:', error);
        repondre('❌ Failed to download YouTube audio. Please check the URL and try again.');
    }
});


adams({
    nomCom: "ringtone",
    aliases: ["rtone"],
    desc: "Download ringtones",
    categorie: "Download"
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg } = commandeOptions;
    const query = arg.join(' ');

    if (!query) return repondre('Please provide a search term (e.g. Quran)');

    try {
        const response = await axios.get(`https://bk9.fun/download/RingTone?q=${encodeURIComponent(query)}`);
        const audioUrl = extractField(response.data, 'audio') || extractField(response.data, 'url') || extractField(response.data, 'download_url');
        
        if (!audioUrl) throw new Error('No audio URL found in response');

        await zk.sendMessage(dest, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: 'ringtone.mp3',
            caption: 'Ringtone downloaded by BWM XMD'
        }, { quoted: ms });

    } catch (error) {
        console.error('Ringtone download error:', error);
        repondre('❌ Failed to download ringtone. Please try a different search term.');
    }
});


// APK Downloader (Specialized)
adams({
    nomCom: "apk",
    aliases: ["apkdl"],
    desc: "Download APK files",
    categorie: "Download"
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg } = commandeOptions;
    const packageName = arg.join(' ');

    if (!packageName) return repondre('Please provide an app package name (e.g. com.whatsapp)');

    try {
        const response = await axios.get(`https://bk9.fun/download/apk?id=${encodeURIComponent(packageName)}`, {
            timeout: 20000 // Longer timeout for APK downloads
        });

        const responseData = response.data || {};
        const apkUrl = extractResponse(responseData);
        const appName = responseData.name || 'app';

        if (!apkUrl) {
            return repondre('APK not found for the specified package');
        }

        await zk.sendMessage(dest, {
            document: { url: apkUrl },
            mimetype: 'application/vnd.android.package-archive',
            fileName: `${appName}.apk`,
            caption: `${appName} APK`
        }, { quoted: ms });

    } catch (error) {
        console.error('APK download error:', error);
        repondre('❌ Failed to download APK. Please check the package name and try again.');
    }
});


adams(
  {
    nomCom: "img",
    categorie: "Search",
    categorie: "Download",
    reaction: "🌎"
     
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, ms, arg } = commandeOptions;

    if (!arg[0]) {
      return repondre('Which image? Please provide a search term!');
    }

    const searchTerm = arg.join(" ");
    repondre(`Bwm xmd searching your images: "${searchTerm}"...`);

    try {
      gis(searchTerm, async (error, results) => {
        if (error) {
          console.error("Image search error:", error);
          return repondre('Oops! An error occurred while searching for images.');
        }

        if (!results || results.length === 0) {
          return repondre('No images found for your search term.');
        }

        // Limit the number of images sent to avoid overloading the bot or WhatsApp.
        const maxImages = 10; // Adjust the limit as needed
        const imagesToSend = results.slice(0, maxImages);

        for (const image of imagesToSend) {
          try {
            await zk.sendMessage(
              dest,
              { image: { url: image.url }, caption: `Bwm xmd result: "${searchTerm}"` },
              { quoted: ms }
            );
          } catch (sendError) {
            console.error("Error sending image:", sendError);
          }
        }
      });
    } catch (mainError) {
      console.error("Main error:", mainError);
      repondre('An unexpected error occurred. Please try again.');
    }
  }
);





    

