const Discord = require('discord.js');

function getUsername(client, userid) {
    const user = client.users.cache.get(userid);
    if (user) {
        const username = user.username + '#' + user.discriminator;
        return username;
    }
    return null;
}

function getPlacement(num) {
    const chk_1 = num % 10;
    const chk_2 = num % 100;
    if (chk_1 == 1 && chk_2 != 11) {
        return num + 'st';
    } else if (chk_1 == 2 && chk_2 != 12) {
        return num + 'nd';
    } else if (chk_1 == 3 && chk_2 != 13) {
        return num + 'rd';
    }
    return num + 'th';
}

module.exports = {
    name: 'wentop',
    description: `A showcase of the top 10 all time wenkissers`,
    description_2: `A showcase of the top 10 daily wenkissers`,

    execute(message, award_emotes, ranks_array, client, wenkiss_board) {
        if (ranks_array.length == 0 || (wenkiss_board && wenkiss_board.length == 0)) {
            const noArrayEmbed = new Discord.MessageEmbed()
                .setColor('#e397b1')
                .setDescription(`There are no wenkissers yet. Become the first!`)
            message.channel.send(noArrayEmbed);
            return;
        }

        const leaderboardEmbed = new Discord.MessageEmbed()
            .setColor('#e397b1')
            .setTitle('Top Wenkissers Leaderboard:')

        const rankDisplays = {
            0: 'Wenkiss King',
            1: 'Silver Wenkiss',
            2: 'Bronze Wenkiss'
        };

        if (!wenkiss_board) {
            for (rank = 0; rank < ranks_array.length; rank++) {
                const name = getUsername(client, ranks_array[rank][0]);
                if (name) {
                    if (award_emotes[rank]) {
                        leaderboardEmbed.addField(`${award_emotes[rank]} ${rankDisplays[rank]} ${award_emotes[rank]}`, name);
                    } else {
                        leaderboardEmbed.addField(`${getPlacement(rank+1)} Wenkiss`, name ,true);
                    }
                }
            }
        } else {
            for (rank = 0; rank < wenkiss_board.length; rank++) {
                const name = getUsername(client, wenkiss_board[rank]);
                if (name) {
                    leaderboardEmbed.addField(`${getPlacement(rank+1)} Wenkiss`, name ,true);
                }
            }
        }
        
        message.channel.send(leaderboardEmbed);
    }
}