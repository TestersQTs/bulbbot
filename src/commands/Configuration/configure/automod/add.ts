import { Message, MessageActionRow, MessageButton, MessageComponentInteraction, MessageSelectMenu, MessageSelectOptionData, Snowflake } from "discord.js";
import BulbBotClient from "../../../../structures/BulbBotClient";
import DatabaseManager from "../../../../utils/managers/DatabaseManager";
import { AutoModConfiguration } from "../../../../utils/types/DatabaseStructures";
import AutoModPart from "../../../../utils/types/AutoModPart";

const databaseManager: DatabaseManager = new DatabaseManager();

async function add(interaction: MessageComponentInteraction, client: BulbBotClient, category?: string, items?: string[]): Promise<void> {
	const config: AutoModConfiguration = await databaseManager.getAutoModConfig(interaction.guild?.id as Snowflake);
	let pages: MessageSelectOptionData[][] | undefined;
	let currPage: number = 0;

	let selectedCategory: string | undefined = category;
	let selectedItems: string[] | undefined = items;

	if (selectedCategory) {
		pages = config[selectedCategory].reduce((resultArray: any[], item: any, index: number) => {
			const chunkIndex = Math.floor(index / 25);

			if (!resultArray[chunkIndex]) {
				resultArray[chunkIndex] = []; // start a new chunk
			}

			resultArray[chunkIndex].push({ label: item, value: item, default: items?.includes(item) });

			return resultArray;
		}, []);
	}

	const [header, back, buttonAdd, buttonRemove] = [
		await client.bulbutils.translate("config_automod_add_remove_header", interaction.guild?.id, {}),
		await client.bulbutils.translate("config_button_back", interaction.guild?.id, {}),
		await client.bulbutils.translate("config_automod_add_remove_button_add", interaction.guild?.id, {}),
		await client.bulbutils.translate("config_automod_add_remove_button_remove", interaction.guild?.id, {}),
	];

	const categoryRow = new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.setCustomId("category")
			.setPlaceholder(await client.bulbutils.translate("config_automod_add_remove_category_placeholder", interaction.guild?.id, {}))
			.setOptions([
				{ label: "Website filter", value: "websiteWhitelist", default: selectedCategory === "websiteWhitelist" },
				{ label: "Invite filter", value: "inviteWhitelist", default: selectedCategory === "inviteWhitelist" },
				{ label: "Word filter", value: "wordBlacklist", default: selectedCategory === "wordBlacklist" },
				{ label: "Word_token filter", value: "wordBlacklistToken", default: selectedCategory === "wordBlacklistToken" },
				{ label: "Avatar hashes", value: "avatarHashes", default: selectedCategory === "avatarHashes" },
				{ label: "Ignore channels", value: "ignoreChannels", default: selectedCategory === "ignoreChannels" },
				{ label: "Ignore roles", value: "ignoreRoles", default: selectedCategory === "ignoreRoles" },
				{ label: "Ignore users", value: "ignoreUsers", default: selectedCategory === "ignoreUsers" },
			]),
	);

	const listRow = new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.setCustomId("list")
			.setOptions(pages && pages.length ? pages[currPage] : [{ label: "placeholder", value: "placeholder" }])
			.setMinValues(1)
			.setDisabled(selectedCategory === undefined || config[selectedCategory].length === 0),
	);

	const scrollRow = new MessageActionRow().addComponents([
		new MessageButton()
			.setCustomId("left")
			.setLabel("<")
			.setStyle("PRIMARY")
			.setDisabled(currPage === 0 || !pages || pages.length === 0),
		new MessageButton()
			.setCustomId("right")
			.setLabel(">")
			.setStyle("PRIMARY")
			.setDisabled(!pages || pages.length === 0 || currPage === pages.length - 1),
	]);

	const buttonRow = new MessageActionRow().addComponents([
		new MessageButton().setCustomId("back").setLabel(back).setStyle("DANGER"),
		new MessageButton().setCustomId("add").setLabel(buttonAdd).setStyle("SUCCESS").setDisabled(!selectedCategory),
		new MessageButton().setCustomId("remove").setLabel(buttonRemove).setStyle("PRIMARY").setDisabled(!selectedItems),
	]);

	interaction.deferred
		? await interaction.editReply({ content: header, components: [categoryRow, listRow, scrollRow, buttonRow] })
		: await interaction.update({ content: header, components: [categoryRow, listRow, scrollRow, buttonRow] });

	const filter = i => i.user.id === interaction.user.id;
	const collector = interaction.channel?.createMessageComponentCollector({ filter, time: 60000 });

	collector?.on("collect", async (i: MessageComponentInteraction) => {
		if (i.isButton()) {
			switch (i.customId) {
				case "back":
					collector.stop();
					await require("../automod").default(i, client);
					break;
				case "remove":
					collector.stop();

					await databaseManager.automodRemove(interaction.guild?.id as Snowflake, categories[selectedCategory!!], selectedItems as string[]);
					await interaction.followUp({
						content: await client.bulbutils.translate("config_automod_add_remove_remove_success", interaction.guild?.id, {}),
						ephemeral: true,
					});

					await add(i, client, selectedCategory);
					break;
				case "add":
					collector.stop();
					await i.deferUpdate();

					await interaction.followUp({
						content: await client.bulbutils.translate("config_automod_add_remove_add_prompt", interaction.guild?.id, {}),
						ephemeral: true,
					});

					const msgFilter = (m: Message) => m.author.id === interaction.user.id;
					const msgCollector = interaction.channel?.createMessageCollector({ filter: msgFilter, time: 60000, max: 1 });

					msgCollector?.on("collect", async (m: Message) => {
						await m.delete();
						if (config[selectedCategory!!].includes(m.content)) {
							await interaction.followUp({
								content: await client.bulbutils.translate("config_automod_add_remove_add_already_exists", interaction.guild?.id, {
									item: m.content,
								}),
								ephemeral: true,
							});
							return add(i, client, selectedCategory);
						}

						await databaseManager.automodAppend(interaction.guild?.id as Snowflake, categories[selectedCategory!!], [m.content]);

						await interaction.followUp({
							content: await client.bulbutils.translate("config_automod_add_remove_add_success", interaction.guild?.id, {}),
							ephemeral: true,
						});
						await add(i, client, selectedCategory);
					});

					break;
			}
		} else if (i.isSelectMenu()) {
			if (i.customId === "category") {
				collector.stop();
				await add(i, client, i.values[0]);
			} else if (i.customId === "list") {
				collector.stop();
				await add(i, client, selectedCategory, i.values);
			}
		}
	});
}

const categories = {
	websiteWhitelist: AutoModPart.website,
	inviteWhitelist: AutoModPart.invite,
	wordBlacklist: AutoModPart.word,
	wordBlacklistToken: AutoModPart.token,
	ignoreChannels: AutoModPart.ignore_channel,
	ignoreRoles: AutoModPart.ignore_role,
	ignoreUsers: AutoModPart.ignore_user,
	avatarHashes: AutoModPart.avatars,
};

export default add;
