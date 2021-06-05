const Discord = require('discord.js');

module.exports = {
    name: 'resetdb',
    description: `Clears the existing database. DO NOT use this lightly`,

    execute(message, u_sql, s_sql, admin, client) {
        if (admin) {

            let deleteUser = u_sql.prepare(`DELETE FROM userStats`);
            deleteUser.run();

            let deleteServer = s_sql.prepare(`DELETE FROM serverStats`);
            deleteServer.run();
            let s_stats = client.getAllServer.get();
            s_stats = {id: 'lo-fi', wenkissBoard: ``, pomodoroSess: `` };
            client.setServer.run(s_stats);

            const resetEmbed = new Discord.MessageEmbed()
                .setColor('#e397b1')
                .setDescription('DB has been reset')
            message.channel.send(resetEmbed);
        }
    }
}