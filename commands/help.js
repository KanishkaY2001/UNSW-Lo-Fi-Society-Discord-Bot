const Discord = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Shows a list of commands for lo-fi bot',
    
    execute(message, admin, bot_cmds) { // Can be made to look better

        let help_text = `----------------------`;
        let admin_text = `--------------------`;

        for (const [cmd, arr] of Object.entries(bot_cmds)) {
            if (arr[0]) {
                admin_text = admin_text + `\n` + '***+' + cmd + '***  : ' + '*' + arr[1] + `*\n`;
            } else {
                help_text = help_text + `\n` + '***+' + cmd + '***  : ' + '*' + arr[1] + `*\n`;
            }
        } 

        const helpEmbed = new Discord.MessageEmbed()
            .setColor('#e397b1')
            .setTitle('lo-fi chan is here to help!')
            .setThumbnail('https://i.imgur.com/vhSA4TX.jpg')
            .addFields(
                { name: 'lo-fam Commands:', value: help_text },
            )

        if (admin) {
            helpEmbed.addField('\u200B', '\u200B');
            helpEmbed.addField('Exec Commands:', admin_text);
        }
        
        message.channel.send(helpEmbed);
    }
}