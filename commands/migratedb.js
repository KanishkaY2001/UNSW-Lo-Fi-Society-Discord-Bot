const fs = require('fs');
const Discord = require('discord.js');
const SQLite = require("better-sqlite3");

module.exports = {
    name: 'migratedb',
    description: `Migrate to backup DB info - useful restoration command '+migratedb {backupDir}'`,
    execute(message, u_sql, s_sql, client) {
        const msg_arr = message.content.split(' ');
        const msgEmbed = new Discord.MessageEmbed()
            .setColor('#e397b1')

        if (msg_arr.length == 2 && fs.existsSync(msg_arr[1])) {

            // Delete all data from old DBs
            let deleteUser = u_sql.prepare(`DELETE FROM userStats`);
            deleteUser.run();

            let deleteServer = s_sql.prepare(`DELETE FROM serverStats`);
            deleteServer.run();

            let s_stats = client.getAllServer.get();
            s_stats = {id: 'lo-fi', wenkissBoard: ``, pomodoroSess: `` };
            client.setServer.run(s_stats);

            // Define Backups
            const mu_sql = new SQLite(`${msg_arr[1]}/user_db/userStats.sqlite`);
            const ms_sql = new SQLite(`${msg_arr[1]}/server_db/serverStats.sqlite`);

            // Getting Backups Data
            const migrateUser = mu_sql.prepare("SELECT * FROM userStats");
            const migrateServer = ms_sql.prepare("SELECT * FROM serverStats").get();

            // Updating DBs with Backups
            client.setServer.run(migrateServer);
            for (const user_key of migrateUser.iterate()) {
                client.setUser.run(user_key);
            }

            msgEmbed.description = `Successfully migrated to backup database!`;
            message.channel.send(msgEmbed);
            return;
        }
        msgEmbed.description = `Something went wrong!
        Failed to migrate backup
        
        - Ensure that the directory exists`;
            message.channel.send(msgEmbed);
    }
}