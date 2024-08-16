module.exports = {
    config: {
        name: "sazid",
        version: "1.0",
        author: "MR.AYAN", //** original author fb I'd : https://m.me/MR.AYAN.2X **//
        countDown: 5,
        role: 0,
        shortDescription: "No Prefix",
        longDescription: "No Prefix",
        category: "fun",
    },
onStart: async function(){}, 
onChat: async function({
    event,
    message,
    getLang
}) {
    if (event.body && event.body.toLowerCase() == "ayan") return message.reply("Ore diye ki korben, apni amake volun ami oke vole divo. Use callad command to call my admin ");
}
}; 
