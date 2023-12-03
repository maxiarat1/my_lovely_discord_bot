const { SlashCommandBuilder } = require('@discordjs/builders');
const { AttachmentBuilder } = require('discord.js');
const puppeteer = require('puppeteer');

let fetch;
(async () => {
    fetch = (await import('node-fetch')).default;
})();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('focus')
        .setDescription('Creates an image from given prompt.')
        .addStringOption(option =>
            option.setName('p_prompt')
            .setDescription('Set positive prompt.')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('n_prompt')
            .setDescription('Set negative prompt.')),

    async execute(interaction) {
        await interaction.deferReply();
        const user_sent_ID = interaction.member.voice.channel;
        if (!user_sent_ID) {
            return interaction.reply('You need to be in a voice channel to create an image.');
        }

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto('http://127.0.0.1:7865/');

        const p_prompt_str = interaction.options.get("p_prompt").value;
        await page.type('.scroll-hide.svelte-1f354aw', p_prompt_str);
        await page.click('#generate_button');

        //const n_prompt_str = interaction.options.get("n_prompt").value;

        const firstImageSelector = 'button.thumbnail-item.thumbnail-lg.svelte-1b19cri img';
        const secondImageSelector = 'button.thumbnail-item.thumbnail-lg.svelte-1b19cri:nth-of-type(2) img';
        await page.waitForSelector(firstImageSelector);
        await page.waitForSelector(secondImageSelector);

        // Function to download image and create attachment
        async function downloadImage(url) {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            return new AttachmentBuilder(buffer, 'image.png');
        }

        try {
            const first_ImageUrl = await page.evaluate(selector => document.querySelector(selector).getAttribute('src'), firstImageSelector);
            const second_ImageUrl = await page.evaluate(selector => document.querySelector(selector).getAttribute('src'), secondImageSelector);

            const firstImageAttachment = await downloadImage(first_ImageUrl);
            const secondImageAttachment = await downloadImage(second_ImageUrl);

            await interaction.channel.send({ files: [firstImageAttachment] });
            await interaction.channel.send({ files: [secondImageAttachment] });

            // Close the browser
            await browser.close();
            await interaction.editReply(`${'Positive prompt:\n'+p_prompt_str+'\nNegative prompt:'}`);
        } catch (error) {
            console.error("Failed to send images:", error);
            await interaction.followUp('An error occurred while sending the images.');
        }
    },
};
