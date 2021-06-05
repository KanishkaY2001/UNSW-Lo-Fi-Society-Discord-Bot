const Discord = require('discord.js');

module.exports = {
    name: 'invalid',
    description: `The following command format is invalid / does not exist`,

    execute(message, type) {
        const resetEmbed = new Discord.MessageEmbed()
            .setColor('#e397b1')
            .setDescription(`The following command format is invalid / does not exist.\nEnter +help for command list.`)
        switch (type) {
            case 'pomodoro':
                resetEmbed.description = `Ensure that:
                - Number is above or equal to 5
                - No decimal point is used
                - Number does not begin with 0`;
                break;
        }
        message.channel.send(resetEmbed);
    }
}