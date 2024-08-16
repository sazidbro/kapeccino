const axios = require('axios');

module.exports = {
  config: {
    name: "gfx3",
    version: "1.0",
    author: "ᴍʀ.ᴀʏᴀɴ",
    countDown: 10,
    role: 0,
    shortDescription: "Make A gfx logo",
    longDescription: "Make A gfx logo",
    category: "utility ",
    guide: {
      en: "{p}{n} name | subname",
    }
  },

  onStart: async function ({ message, event, api }) {
    const info = event.body.slice(event.body.indexOf(' ') + 1);
    if (!info) {
      return message.reply("Please enter in the format: .ngfx3  name | subname");
    }

    const [text, text1] = info.split("|").map((item) => item.trim());

    await message.reply("ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ ʙᴀʙᴜ...😘");

    const img = `https://tanjiro-api.onrender.com/gfx3?text=${text}&text2=${text1}&api_key=tanjiro`;
    const form = {
      body: "☆ ʜᴇʀᴇ's ʏᴏᴜʀ ɢғx ʟᴏɢᴏ ☆",
      attachment: [await global.utils.getStreamFromURL(img)]
    };

    message.reply(form);
    }
 };
