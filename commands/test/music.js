const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const { ActionRowBuilder,ButtonBuilder, ButtonStyle } = require('discord.js');
var fs = require('fs');
const path = require('node:path');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays an MP3 file in your voice channel'),
    async execute(interaction) {
        
        const play = new ButtonBuilder()
			.setCustomId('play')
			.setLabel('Continue')
			.setStyle(ButtonStyle.Success);

		const stop = new ButtonBuilder()
			.setCustomId('stop')
			.setLabel('Stop')
			.setStyle(ButtonStyle.Danger);
        
        const pause = new ButtonBuilder()
            .setCustomId('pause')
            .setLabel('Pause')
            .setStyle(ButtonStyle.Secondary);
        
        const row = new ActionRowBuilder()
        .addComponents(play, pause, stop);

        // Join the same voice channel of the author of the message
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply('You need to be in a voice channel to play music!');
        }

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        // Create an audio player
        const player = createAudioPlayer();

        // Subscribe the connection to the audio player (will play audio on the voice connection)
        const subscription = connection.subscribe(player);

        const foldersPath = path.join(__dirname,"../sounds");
        const tracks = fs.readdirSync(foldersPath)
                               .filter(file => file.endsWith('.mp3')) // Filter for .mp3 files
                               .map(file => path.join(foldersPath, file));

        console.log("loaded tracks: "+fs.readdirSync(foldersPath));


        // Create an audio resource from the MP3 file
        currentTrackIndex=0;
        await interaction.deferReply();//loading symbol to acomplish reply for editreplay function
        async function play_song(){
            const resource = createAudioResource(tracks[currentTrackIndex],{ inlineVolume: true });
            resource.volume.setVolume(1);
            player.play(resource);
            

            //create button choice
            await interaction.editReply({
                content: `Play | Pause | Stop\nDuration: ${tracks[currentTrackIndex]} ms\nVolume: ${(resource.volume.volume)*100} \nControls:`,
                components: [row],
            });
            currentTrackIndex++;
            //end of the playlist shutdown music bot
            if (currentTrackIndex >= tracks.length) {
                await destroy_bot(subscription,connection,interaction);
            }
        };
        play_song(); // Start playing the first song
        player.on(AudioPlayerStatus.Idle, () => play_song());//after playin if idle the continue

        player.on('error', error => {
            console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
        });

        // Handle button interactions
        const filter = i => ['play', 'pause', 'stop'].includes(i.customId) && i.user.id === interaction.user.id;

        const collector = await interaction.channel.createMessageComponentCollector({ filter});

        collector.on('collect', async i => {
            await i.deferReply();
            if (i.customId === 'play') {
                if (player.state.status === AudioPlayerStatus.Paused) {
                    player.unpause();
                }
                await i.editReply({ content: 'Resumed playing!', ephemeral: true });
                setTimeout(() => i.deleteReply(), 3000);
            } else if (i.customId === 'pause') {
                if (player.state.status === AudioPlayerStatus.Playing) {
                    player.pause();
                }
                await i.editReply({ content: 'Paused!', ephemeral: true });
                setTimeout(() => i.deleteReply(), 3000);
            } else if (i.customId === 'stop') {
                player.stop();
                await i.editReply({ content: 'Stopped playing!', ephemeral: true });
                setTimeout(() => i.deleteReply(), 3000);
                collector.stop();
                await destroy_bot(subscription,connection,interaction);
            }
        });

        async function destroy_bot(subscription,connection,interaction) {
            //player.on(AudioPlayerStatus.Idle, () => {
                console.log('The audio player has finished playing!');
                setTimeout(async() => await interaction.deleteReply(), 1000);
                await subscription.unsubscribe();
                await connection.destroy();
            //});
        }

        collector.on('end', collected => console.log(`Collected ${collected.size} interactions.`));
    },
};
