
const { Client, interaction, ApplicationCommandOptionType, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Select a member and ban them.')
		.addUserOption(option =>
			option
				.setName('target')
				.setDescription('The member to ban')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('reason')
				.setDescription('The reason for banning'))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.setDMPermission(false),
	async execute(interaction) {
		const targetUserId = interaction.options.get('target').value;
		const reason =
		  interaction.options.get('reason')?.value || 'No reason provided';
	
		await interaction.deferReply();
	
		const targetUser = await interaction.guild.members.fetch(targetUserId);
	
		if (!targetUser) {
		  await interaction.editReply("That user doesn't exist in this server.");
		  return;
		}
	
		if (targetUser.id === interaction.guild.ownerId) {
		  await interaction.editReply(
			"You can't ban that user because they're the server owner."
		  );
		  return;
		}
	
		const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of the target user
		const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of the user running the cmd
		const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot
	
		if (targetUserRolePosition >= requestUserRolePosition) {
		  await interaction.editReply(
			"You can't ban that user because they have the same/higher role than you."
		  );
		  return;
		}
	
		if (targetUserRolePosition >= botRolePosition) {
		  await interaction.editReply(
			"I can't ban that user because they have the same/higher role than me."
		  );
		  return;
		}
	
		// Ban the targetUser
		try {
		  await targetUser.ban({ reason });
		  await interaction.editReply(
			`User ${targetUser} was banned\nReason: ${reason}`
		  );
		} catch (error) {
		  console.log(`There was an error when banning: ${error}`);
		}
	},
};