const Discord = require('discord.js');

module.exports = {
    name: 'takewenkiss',
    description: `Deduct wenkisses from a user`,
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

            if (wenscore.wenkisses == 0) {
                responseEmbed.description = 'This user has no wenkisses to deduct';
                message.channel.send(responseEmbed);
                return;
            }

            wenscore.wenkisses -= extra_wenkisses;
            if (wenscore.wenkisses < 0) {
                wenscore.wenkisses = 0;
            }
            client.setUser.run(wenscore);

            responseEmbed.description = `
            ${msg_arr[2]} wenkisses have been deducted from ${user.username}'s balance
            They currently have ${wenscore.wenkisses} wenkisses
            `;

            message.channel.send(responseEmbed);
            return;
        }
    
        responseEmbed.description = 'No user with the given user id exists in this server';
        message.channel.send(responseEmbed);
    }
}