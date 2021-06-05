const Discord = require('discord.js');

module.exports = {
    name: 'mywenkiss',
    description: `Shows your wenkiss points (wenkisses)`,

    execute(message, wenscore, rank, award_emotes) {
        
        
        if (rank == '0th') {
            rank = 'Unranked';
        }

        const award_array = wenscore.awards.split(',');
        const awards_text = 
        `〈 ${award_emotes[0]} | ${award_array[0]} 〉\
        \n〈 ${award_emotes[1]} | ${award_array[1]} 〉\
        \n〈 ${award_emotes[2]} | ${award_array[2]} 〉\
        `

        const balanceEmbed = new Discord.MessageEmbed()
            .setColor('#e397b1')
            .setTitle('Your current wenkiss balance')
            .setThumbnail('https://i.imgur.com/gQSDa8X.png')
            .addFields(
                { name: 'Wenkisses:', value: wenscore.wenkisses, inline: true },
                { name: 'Current Rank:', value: rank, inline: true },
                { name: 'Crowns and Medals:', value: awards_text}
            )
        message.channel.send(balanceEmbed);
    }
}