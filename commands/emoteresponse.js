const Discord = require('discord.js');

module.exports = {
    name: 'emoteresponse',
    description: `provides feedback to user for wenkiss input`,
    
    execute(message, success, placement, kisses, award_emotes) {
        if (success) {
            let title_text = 'Congratulations! you Wenkissed ' + placement;
            const place_num = parseInt(placement[0])-1
            if (award_emotes[place_num]) {
                message.react(award_emotes[place_num]);
                title_text = award_emotes[place_num] + '   ' + title_text + '   ' + award_emotes[place_num];
            }

            const successEmbed = new Discord.MessageEmbed()
                .setColor('#e397b1')
                .setTitle(title_text)
                .addFields(
                    { name: 'You earned:', value: kisses + ' wenkisses', inline: true }
                )

            message.channel.send(successEmbed).then(msg => msg.delete({timeout: 10000}));
            return;
        }
        const failureEmbed = new Discord.MessageEmbed()
            .setColor('#e397b1')
            .setDescription('You have already Wenkissed today. Try again tomorrow')
        message.channel.send(failureEmbed).then(msg => msg.delete({timeout: 3500}));
    }
}