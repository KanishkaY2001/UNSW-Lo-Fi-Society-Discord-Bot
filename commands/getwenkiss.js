const Discord = require('discord.js');

module.exports = {
    name: 'getwenkiss',
    description: `Retrieves a user's current wenkisses`,
    execute(message, client) {
        const userid = message.content.substring(12);
        const user = client.users.cache.get(userid);
        const responseEmbed = new Discord.MessageEmbed()
            .setColor('#e397b1')
            
        if (user) {
            let wenscore = client.getUser.get(userid, message.guild.id);
            if (wenscore) {
                responseEmbed.description = `${user.username} currently has ${wenscore.wenkisses} wenkisses`;
                message.channel.send(responseEmbed);
                return;
            }
            responseEmbed.description = 'User has no wenkisses';
            message.channel.send(responseEmbed);
            return;
        }
 
        responseEmbed.description = 'No user with the given user id exists in this server';
        message.channel.send(responseEmbed);
    }
}