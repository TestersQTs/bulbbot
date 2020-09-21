const Discord = require("discord.js");
const Guild = require("../../handlers/configuration/guild");
const Log = require("../../handlers/configuration/logs");
const Role = require("../../handlers/configuration/roles");
const Setting = require("../../handlers/configuration/settings");
const Emotes = require("../../emotes.json");

module.exports = {
	name: "configure",
	aliases: ["cfg", "setting", "config"],
	category: "configuration",
	description: "Modify settings on the bot in your guild",
	run: async (client, message, args) => {
		if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send(":lock: Missing permission ``ADMINISTRATOR``"); // I know best has permssion lol
		if (args[0] === undefined || args[0] === null) return message.channel.send(`${Emotes.actions.warn} Missing required argument \`\`setting\`\`\n${Emotes.other.tools} Correct usage of command: \`\`configure|cfg|setting|config <setting> <new value>\`\``);
		if (args[1] === undefined || args[1] === null) return message.channel.send(`${Emotes.actions.warn} Missing required argument \`\`new value\`\`\n${Emotes.other.tools} Correct usage of command: \`\`configure|cfg|setting|config <setting> <new value>\`\``);
		const setting = args[0].toLowerCase();
		const newValue = args[1];

		switch (setting) {
			// Guild configuration
			case "prefix": // Change the bot prefix
				Guild.Change_Prefix(message.guild.id, newValue);
				message.channel.send(`Successfully updated the prefix to \`\`${newValue}\`\` in **${message.guild.name}**`);
				break;

			case "track_analytics":
				Guild.Track_Analytics(message.guild.id, newValue);
				message.channel.send(`Successfully update the state of tracking analytics to  \`\`${newValue}\`\` in **${message.guild.name}**`);
				break;

			// Log configuration
			case "mod_action":
				Log.Change_Mod_Action(client, message.guild.id, newValue.replace(/\D/g, ""));
				message.channel.send(`Now logging \`\`mod actions\`\` in ${newValue} in **${message.guild.name}**`);
				break;
			case "message":
				Log.Change_Message(client, message.guild.id, newValue.replace(/\D/g, ""));
				message.channel.send(`Now logging \`\`message logs\`\` in ${newValue} in **${message.guild.name}**`);
				break;
			case "role":
			case "role_update":
				Log.Change_Role(client, message.guild.id, newValue.replace(/\D/g, ""));
				message.channel.send(`Now logging \`\`role updates\`\` in ${newValue} in **${message.guild.name}**`);
				break;
			case "member_update":
			case "member":
				Log.Change_Member(client, message.guild.id, newValue.replace(/\D/g, ""));
				message.channel.send(`Now logging \`\`member updates\`\` in ${newValue} in **${message.guild.name}**`);
				break;
			case "channel_update":
			case "channel":
				Log.Change_Channel(client, message.guild.id, newValue.replace(/\D/g, ""));
				message.channel.send(`Now logging \`\`channel updates\`\` in ${newValue} in **${message.guild.name}**`);
				break;
			case "join_leave":
				Log.Change_Join_Leave(client, message.guild.id, newValue.replace(/\D/g, ""));
				message.channel.send(`Now logging \`\`join leave logs\`\` in ${newValue} in **${message.guild.name}**`);
				break;

			// Role configuration
			case "admin":
				message.channel.send(`\`\`${newValue}\`\` in **${message.guild.name}**`);
				break;
			case "mod":
			case "moderator":
				message.channel.send(`\`\`${newValue}\`\` in **${message.guild.name}**`);
				break;
			case "mute":
				message.channel.send(`\`\`${newValue}\`\` in **${message.guild.name}**`);
				break;
			case "trusted":
				message.channel.send(`\`\`${newValue}\`\` in **${message.guild.name}**`);
				break;

			// Setting configuration
			case "lang":
			case "language":
				message.channel.send(`\`\`${newValue}\`\` in **${message.guild.name}**`);
				break;
			case "delete_server_invites":
				message.channel.send(`\`\`${newValue}\`\` in **${message.guild.name}**`);
				break;
			case "trusted_server_invites":
				message.channel.send(`\`\`${newValue}\`\` in **${message.guild.name}**`);
				break;
			case "allow_non_latin_usernames":
				message.channel.send(`\`\`${newValue}\`\` in **${message.guild.name}**`);
				break;
			case "dm_on_action":
				message.channel.send(`\`\`${newValue}\`\` in **${message.guild.name}**`);
				break;
			case "censored_words":
				message.channel.send(`\`\`${newValue}\`\` in **${message.guild.name}**`);
				break;
			case "delete_links":
				message.channel.send(`\`\`${newValue}\`\` in **${message.guild.name}**`);
				break;
			case "trusted_links":
				message.channel.send(`\`\`${newValue}\`\` in **${message.guild.name}**`);
				break;
			default:
				break;
		}
	},
};
