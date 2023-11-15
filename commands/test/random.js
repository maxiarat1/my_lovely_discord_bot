const {Client, SlashCommandBuilder } = require("discord.js");


module.exports ={
    data: new SlashCommandBuilder()
        .setName("random")
        .setDescription("Creates Random value"),
    async execute(){
        await interaction.deferReply();
        Client.emit("guildMemberAdd", guildMember);
        
    },
};