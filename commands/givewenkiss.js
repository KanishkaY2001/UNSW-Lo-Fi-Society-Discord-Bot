const Discord = require('discord.js');

module.exports = {
    name: 'givewenkiss',
    description: `Give a certain user, by userid, wenkisses`,
    execute(message, client) {
        const msg_arr = message.content.split(' ');
        const userid = msg_arr[1];
        const user = client.users.cache.get(userid);
        const responseEmbed = new Discord.MessageEmbed()
            .setColor('#e397b1')

        if (user) {
            let wenscore = client.getUser.get(userid, message.guild.id);
            if (!wenscore) {
                wenscore = { id: `${message.guild.id}-${userid}`, user: userid, guild: message.guild.id, wenkisses: 0, awards: '0,0,0' }
            }

            const extra_wenkisses = parseInt(msg_arr[2])
            if (isNaN(extra_wenkisses)) {
                responseEmbed.description = 'Not a valid number';
                return;
            }

            wenscore.wenkisses += extra_wenkisses
            client.setUser.run(wenscore);

            responseEmbed.description = `
            ${user.username} was given ${msg_arr[2]} wenkisses
            They currently have ${wenscore.wenkisses} wenkisses
            `;

            message.channel.send(responseEmbed);
            return;
        }
    
        responseEmbed.description = 'No user with the given user id exists in this server';
        message.channel.send(responseEmbed);
    }
}