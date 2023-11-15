const { SlashCommandBuilder, chatInputApplicationCommandMention } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
//import { setTimeout as wait} from 'timers/promises';
module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		await interaction.reply({ content: 'Secret Pong!', ephemeral: true });
		await wait(2000);
		await interaction.editReply({ content: 'pong!', ephemeral: true });
	},
};
