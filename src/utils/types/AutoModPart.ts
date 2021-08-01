enum AutoModPart {
	word, token,
	website, invite,
	mention, message,
}
export default AutoModPart;

export type AutoModListPart = AutoModPart.word | AutoModPart.token | AutoModPart.website | AutoModPart.invite;
export type AutoModAntiSpamPart = AutoModPart.message | AutoModPart.mention;