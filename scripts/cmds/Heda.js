const axios = require("axios");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
 name: "heda",
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
	onStart: async function ({ globalGoat, message, args, event, threadsData, download }) {
		const moment = require("moment-timezone");
		const { statSync, existsSync, createReadStream } = require("fs-extra");
		const axios = require("axios");
		const { threadID } = event;
		const dataThread = await threadsData.getData(threadID);
		const prefix = dataThread.prefix || globalGoat.config.prefix;
		let sortHelp = dataThread.sortHelp || "name";
		if (!["category", "name"].includes(sortHelp)) sortHelp = "name";
		const commandName = args[0] || "";
		const command = globalGoat.commands.get(commandName.toLowerCase()) || globalGoat.commands.get(globalGoat.shortNameCommands.get(commandName));

		// ———————————————— LIST ALL COMMAND ——————————————— //
		if (!command && !args[0] || !isNaN(args[0])) {
			const arrayInfo = [];
			let msg = "";
			if (sortHelp == "name") {
				const page = parseInt(args[0]) || 1;
				const numberOfOnePage = 20;
				let i = 0;
				for (var [name, value] of (globalGoat.commands)) {
					value.config.shortDescription && value.config.shortDescription.length < 40 ? name += ` → ${value.config.shortDescription.charAt(0).toUpperCase() + value.config.shortDescription.slice(1)}` : "";
					arrayInfo.push({
						data: name,
						priority: value.priority || 0
					});
				}
				arrayInfo.sort((a, b) => a.data - b.data);
				arrayInfo.sort((a, b) => (a.priority > b.priority ? -1 : 1));
				const startSlice = numberOfOnePage * page - numberOfOnePage;
				i = startSlice;
				const returnArray = arrayInfo.slice(startSlice, startSlice + numberOfOnePage);
				const characters = "━━━━━━━━━━━━━";

				msg += returnArray.reduce((text, item) => text += `【${++i}】 ${item.data}\n`, '');

				const doNotDelete = "[ 🐐 | Project Goat Bot ]";
				message.reply(`${characters}\n${msg}${characters}\nTrang [ ${page}/${Math.ceil(arrayInfo.length / numberOfOnePage)} ]\nHiện tại bot có ${globalGoat.commands.size} lệnh có thể sử dụng\n► Gõ ${prefix}help <số trang> để xem danh sách lệnh\n► Gõ ${prefix}help <tên lệnh> để xem chi tiết cách sử dụng lệnh đó\n${characters}\n${doNotDelete}`);
			}
			else if (sortHelp == "category") {
				for (const [name, value] of globalGoat.commands) {
					if (arrayInfo.some(item => item.category == value.config.category.toLowerCase())) arrayInfo[arrayInfo.findIndex(item => item.category == value.config.category.toLowerCase())].names.push(value.config.name);
					else arrayInfo.push({
						category: value.config.category.toLowerCase(),
						names: [value.config.name]
					});
				}
				arrayInfo.sort((a, b) => (a.category < b.category ? -1 : 1));
				for (const data of arrayInfo) {
					let categoryUpcase = "- " + data.category.toUpperCase() + ":";
					data.names.sort();
					msg += `${categoryUpcase}\n${data.names.join(", ")}\n\n`;
				}
				const characters = "━━━━━━━━━━━━━";
				const doNotDelete = "[ 🐐 | Project Goat Bot ]";
				message.reply(`${msg}${characters}\n► Hiện tại bot có ${globalGoat.commands.size} lệnh có thể sử dụng, gõ ${prefix}help <tên lệnh> để xem chi tiết cách sử dụng lệnh đó\n${characters}\n${doNotDelete}`);
			}
		}
		// ———————————— COMMAND DOES NOT EXIST ———————————— //
		else if (!command && args[0]) {
			return message.reply(`Lệnh "${args[0]}" không tồn tại`);
		}
		// ————————————————— HELP COMMAND ————————————————— //
		else {
			const configCommand = command.config;
			let author = "", contacts = "";
			if (
				configCommand.author
				&& typeof (configCommand.author) == "object"
				&& !Array.isArray(configCommand.author)
			) {
				author = configCommand.author.name || "";
				contacts = configCommand.author.contacts || "";
			}
			else if (
				configCommand.author
				&& typeof (configCommand.author) == "object"
				&& Array.isArray(configCommand.author)
			) {
				author = configCommand.author[0];
				contacts = configCommand.author[1];
			}
			else if (typeof (configCommand.author) == "string") author = configCommand.author;

			const nameUpperCase = configCommand.name.toUpperCase();
			const title = "━━━━━━━━━━━━━"
				+ "\n" + nameUpperCase
				+ "\n" + "━━━━━━━━━━━━━";

			let msg = `${title}\n► Mô tả: ${configCommand.longDescription || "Không có"}`
				+ `\n► Version: ${configCommand.version}`
				+ `${configCommand.shortName ? `\n\n► Tên gọi khác: ${typeof configCommand.shortName == "string" ? configCommand.shortName : configCommand.shortName.join(", ")}` : ""}`
				+ `\n\n► Role: ${((configCommand.role == 0) ? "Tất cả người dùng" : (configCommand.role == 1) ? "Quản trị viên nhóm" : "Admin bot")}`
				+ `\n► Thời gian mỗi lần dùng lệnh: ${configCommand.cooldowns || 1}s`
				+ `\n► Phân loại: ${configCommand.category || "Không có phân loại"}`
				+ (author ? `\n► Author: ${author}` : "")
				+ (contacts ? `\n► Contacts: ${contacts}` : "");
			let guide = configCommand.guide || {
				body: ""
			};
			if (typeof (guide) == "string") guide = {
				body: guide
			};
			msg += '\n━━━━━━━━━━━━━\n'
				+ '► Hướng dẫn cách dùng:\n'
				+ guide.body
					.replace(/\{prefix\}|\{p\}/g, prefix)
					.replace(/\{name\}|\{n\}/g, configCommand.name)
				+ '\n━━━━━━━━━━━━━\n'
				+ '► Chú thích:\n• Nội dung bên trong <XXXXX> là có thể thay đổi\n• Nội dung bên trong [a|b|c] là a hoặc b hoặc c';

			const formSendMessage = {
				body: msg
			};

			if (guide.attachment) {
				if (guide.attachment && typeof (guide.attachment) == 'object' && !Array.isArray(guide.attachment)) {
					formSendMessage.attachment = [];
					for (const pathFile in guide.attachment) {
						if (!existsSync(pathFile)) await download(guide.attachment[pathFile], pathFile);
						formSendMessage.attachment.push(createReadStream(pathFile));
					}
				}
			}

			return message.reply(formSendMessage);
		}
	}
};
