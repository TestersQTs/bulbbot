module.exports = {
	Warn: async (client, guildId, target, moderator, reason) => {},
	Mute: async (client, guildId, target, moderator, reason) => {},
	Kick: async (client, guildId, target, moderator, reason) => {
		let guild = client.guilds.cache.get(guildId);
		let user = guild.member(target);
		if (user.kickable) {
			await user.kick(`Moderator: ${moderator.username}#${moderator.discriminator} (${moderator.id}) | Target: ${target} | Reason: ${reason}`);
			return true;
		} else return false;
	},
	Ban: async (client, guildId, target, moderator, reason) => {
		let guild = client.guilds.cache.get(guildId);
		let user = guild.member(target);

		if (user.bannable) {
			await user.ban({
				reason: `Moderator: ${moderator.username}#${moderator.discriminator} (${moderator.id}) | Target: ${target} | Reason: ${reason}`,
			});
			return true;
		} else return false;
	},
	ForceBan: async (client, guildId, target, moderator, reason) => {
		let guild = client.guilds.cache.get(guildId);

		try {
			await guild.members.ban(target, {
				reason: `Moderator: ${moderator.username}#${moderator.discriminator} (${moderator.id}) | Target: ${target} | Reason: ${reason}`,
			});
			return true;
		} catch (error) {
			return false;
		}
	},
};
