const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports= {
    data: new SlashCommandBuilder() //get the user input
        .setName("kick")
        .setDescription("Select a member and kick them.")
        .addUserOption( option =>
            option
            .setName("target")
            .setDescription("The member to kick")
            .setRequired(true))
        .addUserOption( option => 
            option
            .setName("reason")
            .setDescription("The reason for kick"))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDMPermission(false),
    async execute(interaction){//get the interaction from user and use it
        const targetUserId = interaction.options.get("target").value;
        const reason = interaction.options.get("reason")?.value || "No reason provided";
        
        await interaction.deferReply();//loading symbol
        const targetUser = await interaction.guild.members.fetch(targetUserId);

        if(!targetUser){
            await interaction.editReply("That user doesn't exist in this server.");
            return;
        }
        if(targetUser.id === interaction.guild.ownerID){
            await interaction.editReply("You can't kick that user because they're the server owner.");
            return;
        }
        const targetUserRolePosition = targetUser.roles.highest.position;
        const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of the user running the cmd
		const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot
        if (targetUserRolePosition >= requestUserRolePosition) {
            await interaction.editReply(
                "You can't kick that user because they have the same/higher role than you.");
        }
		if (targetUserRolePosition >= botRolePosition) {
            await interaction.editReply(
              "I can't kick that user because they have the same/higher role than me."
            );
            return;
          }
        		// Ban the targetUser
		try {
            await targetUser.kick({ reason });
            await interaction.editReply(
              `User ${targetUser} was kicked\nReason: ${reason}`
            );
          } catch (error) {
            console.log(`There was an error when kicking: ${error}`);
          }
    },
};