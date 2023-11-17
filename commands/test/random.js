const { SlashCommandBuilder } = require("discord.js");
const option_count = 5 ;
module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('from given prompts selects one of them')
        .addStringOption( option => 
            option
                .setName('prompt1')
                .setDescription('give a prompt')
                .setRequired(true)   
            )
        .addStringOption(option => 
            option
                .setName('prompt2')
                .setDescription('give a prompt')
                .setRequired(true)  
            )
        .addStringOption(option => 
            option
                .setName('prompt3')
                .setDescription('give a prompt')
                .setRequired(false)  
            )
        .addStringOption(option => 
            option
                .setName('prompt4')
                .setDescription('give a prompt')
                .setRequired(false)  
            )
        .addStringOption(option => 
            option
                .setName('prompt5')
                .setDescription('give a prompt')
                .setRequired(false)  
            ),
    async execute(interaction){
        propmpt1 = interaction.options.get('prompt1').value;
        console.log(propmpt1);

        const my_list = [];
        var list_len = 0;
        for (let index = 0; index < option_count; index++) {
            my_list[index] = interaction.options.get(`prompt${1+index}`)?.value || '';
            if (my_list[index] !== '') {
                list_len++;
            };
        };
        
        console.log(list_len);
        
        function getRandomInt(min, max){
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min) + min);
        };

        await interaction.deferReply();
        a=getRandomInt(0, list_len);
        emoji_list= [`:clap:`,`:disguised_face:`,`:unamused:`, `:poop:`, `:people_holding_hands:`,`:tada:`, `:confetti_ball:` ]
        emoji_len=emoji_list.length;
        b=getRandomInt(0, emoji_len);
        console.log(a);
        await interaction.editReply(`${emoji_list[b] +' '+ my_list[a].toUpperCase()}`);

    },
};