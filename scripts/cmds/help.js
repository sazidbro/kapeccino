const axios = require("axios");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "1.00",
    author: "Sazid Moontasir",
    countDown: 5,
    shortDescription: {
      en: "View command usage and list all commands directly",
    },
    longDescription: {
      en: "View command usage and list all commands directly",
    },
    category: "info",
    guide: {
      en: "{p}help cmdName ",
    },
    priority: 1,
  },
  onStart: async function ({ message, args, event, threadsData }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);

    const getFormattedText = async (text, fontType) => {
      try {
        const response = await axios.get('https://global-sprak.onrender.com/api/font', {
          params: {
            text,
            fontType
          }
        });
        return response.data.result;
      } catch (error) {
        console.error(`Error fetching ${fontType} text:`, error);
        return text;
      }
    };

    if (args.length === 0) {
      const categories = {};
      let msg = "";

      for (const [name, value] of commands) {
        const category = value.config.category || "Uncategorized";
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push(name);
      }

      const formattedCategoriesList = await Promise.all(
        Object.keys(categories).map(async (category) => {
          const boldCategory = await getFormattedText(category.toUpperCase(), 'bold');
          return { category, boldCategory };
        })
      );

      const formattedCommandsList = await Promise.all(
        Object.entries(categories).map(async ([category, commands]) => {
          const sansCommands = await Promise.all(
            commands.map((command) => getFormattedText(command, 'sans'))
          );
          return { category, sansCommands };
        })
      );

      for (const { category, boldCategory } of formattedCategoriesList) {
        if (category !== "info") {
          let section = `\n╭─◊『  ${boldCategory}  』`;

          const commandsForCategory = formattedCommandsList.find(
            (cmd) => cmd.category === category
          ).sansCommands;
          for (let i = 0; i < commandsForCategory.length; i += 2) {
            const cmds = commandsForCategory.slice(i, i + 2).map((item) => `✧ ${item}`).join(" ");
            section += `\n│${cmds}`;
          }
          section += `\n╰────────────◊`;

          msg += section;
        }
      }

      // Add footer
      const totalCommands = Object.values(categories).flat().length;
      msg += `\n╭────────────◊\n`;
      msg += `│ » Total Commands: [ ${totalCommands} ]\n`;
      msg += `│ » Type [ ${prefix}help <cmd> ]\n`;
      msg += `│   to learn more about each command.\n`;
      msg += `╰───────────◊\n`;
      msg += `    「 Developed by Sazid Moontasir 」`;

      await message.reply({ body: msg });
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        await message.reply(`Command "${commandName}" not found.`);
      } else {
        const configCommand = command.config;
        const author = configCommand.author || "Unknown";

        const longDescription = configCommand.longDescription
          ? configCommand.longDescription.en || "No description"
