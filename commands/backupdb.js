const fs = require('fs');
const Discord = require('discord.js');

module.exports = {
    name: 'backupdb',
    description: 'Create a folder containing backup DB info, useful when migrating',
    execute(message) {
        const db_arr = ['user_db', 'server_db'];
    
        function join(t, a, s) {
            function format(m) {
                let f = new Intl.DateTimeFormat('en', m);
                return f.format(t);
            }
            return a.map(format).join(s);
        }
        let a = [{day: 'numeric'}, {month: 'short'}, {year: 'numeric'}];
        let folder_name = join(new Date, a, '-');
        let final_name = `./backups/${folder_name}`;
    
        if (fs.existsSync(final_name)) {
            while (fs.existsSync(final_name)) {
                final_name = final_name + '+';
            }
        }

        const errorEmbed = new Discord.MessageEmbed()
                .setColor('#e397b1')
    
        if (!fs.existsSync(final_name)) {
            fs.mkdirSync(final_name)
            for (i = 0; i < db_arr.length; i++) {
                if (!fs.existsSync(`${final_name}/${db_arr[i]}`)) {
                    fs.mkdirSync(`${final_name}/${db_arr[i]}`)
                }
                fs.readdirSync(`./${db_arr[i]}/`).forEach((file) => {
                    if (file != 'README.md') {
                        fs.copyFile(`./${db_arr[i]}/${file}`, `${final_name}/${db_arr[i]}/${file}`, (err) => {
                            if (err) throw err;
                        });
                    }
                })
            }
            errorEmbed.description = `Data has been successfuly backed up.
            Stored in Directory: ${final_name}`;
        } else {
            errorEmbed.description = `There was an issue backing up data
            Please try again or contact Orange`;
        }
        message.channel.send(errorEmbed);
    }
}