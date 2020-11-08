const Guild = require("../../utils/configuration/guild");
const GuildModel = require("../../models/guild");
const Log = require("../../utils/configuration/logs");
const Emotes = require("../../emotes.json");
const Logger = require("../../utils/other/winston");
const Translator = require("../../utils/lang/translator")

module.exports = {
	name: "configure",
	aliases: ["cfg", "setting", "config"],
	category: "configuration",
	description: "Modify settings on the bot in your guild",
	usage: "configure <setting> <new value>",
	clientPermissions: ["SEND_MESSAGES", "VIEW_CHANNEL", "USE_EXTERNAL_EMOJIS"],
	userPermissions: [],
	clearanceLevel: 75,
	run: async (client, message, args) => {
		if (args[0] === undefined || args[0] === null)
			return message.channel.send(Translator.Translate("configure_missing_arg_setting",
				{
					emote_warn: Emotes.actions.warn,
					emote_tools: Emotes.other.tools
				}));
		if (args[1] === undefined || args[1] === null)
			return message.channel.send(Translator.Translate("configure_missing_arg_new_value",
				{
					emote_warn: Emotes.actions.warn,
					emote_tools: Emotes.other.tools
				}));
		const setting = args[0].toLowerCase();
		const newValue = args[1];

		switch (setting) {
			// Guild configuration
			case "prefix": // Change the bot prefix
				Prefix(message, newValue);
				break;

			case "track_analytics":
				Track_analytics(message, newValue);
				break;

			// Log configuration
			case "mod_action":
				Mod_action(client, message, newValue);
				break;
			case "message":
				Message(client, message, newValue);
				break;
			case "role":
			case "role_update":
				Role_update(client, message, newValue);
				break;
			case "member":
			case "member_update":
				Member_update(client, message, newValue);
				break;
			case "channel":
			case "channel_update":
				Channel_update(client, message, newValue);
				break;
			case "join_leave":
				Join_leave(client, message, newValue);
				break;

			// Roles
			case "mute":
				if (
					message.guild.roles.cache.get(newValue.replace(/\D/g, "")) ===
					undefined
				)
					return message.channel.send(Translator.Translate("configure_invalid_muterole",
						{
							emote_warn: Emotes.actions.warn
						}));

				GuildModel.findOneAndUpdate(
					{ guildID: message.guild.id },
					{
						$set: { "roles.mute": newValue.replace(/\D/g, "") },
					},
					function (err) {
						if (err) Logger.error(err);
					}
				);
				message.channel.send(Translator.Translate("configure_muterole_changed",
					{
						emote_success: Emotes.actions.confirm,
						role: newValue.replace(/\D/g, ""),
						guild: message.guild.name
					}));
				break;

			default:
				message.channel.send(Translator.Translate("configure_default_help",
					{
						emote_warn: Emotes.actions.warn,
						emote_tools: Emotes.actions.confirm
					}));
				break;
		}
	},
};

// Helper functions
function isChannel(message, channel) {
	return (
		message.guild.channels.cache.get(channel.replace(/\D/g, "")) !== undefined
	);
}

// Guild configuration
function Prefix(message, newValue) {
	Guild.Change_Prefix(message.guild.id, newValue);
	message.channel.send(
		`Successfully updated the prefix to \`\`${newValue}\`\` in **${message.guild.name}**`
	);
}

function Track_analytics(message, newValue) {
	if (newValue === "true" || newValue === "false") {
		Guild.Track_Analytics(message.guild.id, newValue);
		message.channel.send(
			`Successfully update the state of tracking analytics to  \`\`${newValue}\`\` in **${message.guild.name}**`
		);
	} else
		message.channel.send("Invalid value, allowed values ``true`` or ``false``");
}

// Logging configuration
function Mod_action(client, message, newValue) {
	if (newValue === "disable") {
		newValue = "";
		message.channel.send(
			`Stopped logging \`\`mod actions\`\` in **${message.guild.name}**`
		);
	} else if (!isChannel(message, newValue))
		return message.channel.send(
			`${Emotes.actions.warn} Invalid \`\`channel\`\``
		);
	else {
		newValue = newValue.replace(/\D/g, "");
		message.channel.send(
			`Now logging \`\`mod actions\`\` in ${newValue} in **${message.guild.name}**`
		);
	}
	Log.Change_Mod_Action(client, message.guild.id, newValue.replace(/\D/g, ""));
}

function Message(client, message, newValue) {
	if (newValue === "disable") {
		newValue = "";
		message.channel.send(
			`Stopped logging \`\`message\`\` in **${message.guild.name}**`
		);
	} else if (!isChannel(message, newValue))
		return message.channel.send(
			`${Emotes.actions.warn} Invalid \`\`channel\`\``
		);
	else {
		newValue = newValue.replace(/\D/g, "");
		message.channel.send(
			`Now logging \`\`message\`\` in ${newValue} in **${message.guild.name}**`
		);
	}

	Log.Change_Message(client, message.guild.id, newValue);
}

function Role_update(client, message, newValue) {
	if (newValue === "disable") {
		newValue = "";
		message.channel.send(
			`Stopped logging \`\`role updates\`\` in **${message.guild.name}**`
		);
	} else if (!isChannel(message, newValue))
		return message.channel.send(
			`${Emotes.actions.warn} Invalid \`\`channel\`\``
		);
	else {
		newValue = newValue.replace(/\D/g, "");
		message.channel.send(
			`Now logging \`\`role updates\`\` in ${newValue} in **${message.guild.name}**`
		);
	}

	Log.Change_Role(client, message.guild.id, newValue.replace(/\D/g, ""));
}

function Member_update(client, message, newValue) {
	if (newValue === "disable") {
		newValue = "";
		message.channel.send(
			`Stopped logging \`\`member updates\`\` in **${message.guild.name}**`
		);
	} else if (!isChannel(message, newValue))
		return message.channel.send(
			`${Emotes.actions.warn} Invalid \`\`channel\`\``
		);
	else {
		newValue = newValue.replace(/\D/g, "");
		message.channel.send(
			`Now logging \`\`member updates\`\` in ${newValue} in **${message.guild.name}**`
		);
	}

	Log.Change_Member(client, message.guild.id, newValue.replace(/\D/g, ""));
}

function Channel_update(client, message, newValue) {
	if (newValue === "disable") {
		newValue = "";
		message.channel.send(
			`Stopped logging \`\`channel updates\`\` in **${message.guild.name}**`
		);
	} else if (!isChannel(message, newValue))
		return message.channel.send(
			`${Emotes.actions.warn} Invalid \`\`channel\`\``
		);
	else {
		newValue = newValue.replace(/\D/g, "");
		message.channel.send(
			`Now logging \`\`channel updates\`\` in ${newValue} in **${message.guild.name}**`
		);
	}

	Log.Change_Channel(client, message.guild.id, newValue.replace(/\D/g, ""));
}

function Join_leave(client, message, newValue) {
	if (newValue === "disable") {
		newValue = "";
		message.channel.send(
			`Stopped logging \`\`join leave\`\` in **${message.guild.name}**`
		);
	} else if (!isChannel(message, newValue))
		return message.channel.send(
			`${Emotes.actions.warn} Invalid \`\`channel\`\``
		);
	else {
		newValue = newValue.replace(/\D/g, "");
		message.channel.send(
			`Now logging \`\`join leave\`\` in ${newValue} in **${message.guild.name}**`
		);
	}

	Log.Change_Join_Leave(client, message.guild.id, newValue.replace(/\D/g, ""));
}
