const Guild = require("../models/guild");
const Database = require("../handlers/Database");
const mongoose = require("mongoose");

module.exports = async (client, message) => {
	Guild.findOne(
		{
			guildID: message.guild.id,
		},
		async (err, guild) => {
			if (guild == null) {
				Database.AddGuild(message.guild);
			}
			let prefix;
			try {
				prefix = guild.guildPrefix;
			} catch (error) {
				prefix = process.env.PREFIX;
			}

			if (message.author.bot) return;
			if (!message.guild) return;
			if (!message.content.startsWith(prefix)) return;
			if (!message.member) message.member = await message.guild.fetchMember(message);

			const args = message.content.slice(prefix.length).trim().split(/ +/g);
			const cmd = args.shift().toLowerCase();

			if (cmd.length === 0) return;

			let command = client.commands.get(cmd);
			if (!command) command = client.commands.get(client.aliases.get(cmd));

			if (command) command.run(client, message, args);
		}
	);
};
