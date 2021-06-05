const Discord = require('discord.js');

module.exports = {
    name: 'links',
    description: 'Shows a list of all lo-fi social links',
    
    execute(message, links) { // Can be made to look better

        const linksEmbed = new Discord.MessageEmbed()
            .setColor('#e397b1')
            .setTitle('lo-fi Quicklinks:')
            .setThumbnail('https://i.imgur.com/vhSA4TX.jpg')
            .addFields(
                { name: 'Linktree:', value: links.linktree},
                { name: 'Youtube:', value: links.youtube},
                { name: 'Facebook:', value: links.facebook},
                { name: 'Insta:', value: links.insta},
                { name: 'Mixtape:', value: links.mixtape},
                { name: 'Discord:', value: links.discord}
            )
        message.channel.send(linksEmbed);
    }
}