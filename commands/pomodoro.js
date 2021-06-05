const Discord = require('discord.js');
const schedule = require('node-schedule');

// Converting minutes to miliseconds:
function getMinutes(min) {
    return min*60000
}

function leaveSession(message, s_stats, pomodoro_stats, loc, client, embed, desc) {
    pomodoro_stats.splice(loc, 1);
    s_stats.pomodoroSess = pomodoro_stats.toString();
    client.setServer.run(s_stats);

    embed.description = desc;
    message.channel.send(embed);
}

module.exports = {
    name: 'pomodoro',
    pomo_start: 'To create an in-house pomodoro session',
    pomo_stop: 'To exit your current pomodoro session',
    pomo_stat: 'Provides info about session - whether it is study or break period',
    execute(message, client, time_arr, timings) {
        let s_stats = client.getAllServer.get();
        let pomodoro_stats = s_stats.pomodoroSess.split(',');
        let userid;

        if (message === 'end_relax' || message === 'end_study') {
            //timings = message.guild.channels.cache.find(c => c.name.toLowerCase() === message.content.split(" ")[1]);
            userid = time_arr; // 'time_arr' value represents user id in this case
        } else {
            userid = message.author.id;
        }

        // 'timings' represents channel id to ping user in
        switch (message) { 
            case 'end_relax':
                client.channels.cache.get(timings).send(`<@${userid}> It's time to study 📚`) // <:lofigirl:680763945489137665>
                return;
            case 'end_study':
                client.channels.cache.get(timings).send(`<@${userid}> It's time to take a break :game_die:`) // <:lofigirl:680763945489137665>
                return;
        }

        const msg_arr = message.content.split(' ');
        const msgEmbed = new Discord.MessageEmbed()
            .setColor('#e397b1')

        for (i = 0; i < pomodoro_stats.length; i++) {

            // Setting new pomodoro session:
            if (pomodoro_stats[i] == userid && timings) {
                const user_key = timings + ':' + userid + ':' + `${time_arr[0]}|0`;
                pomodoro_stats.splice(i, 1, user_key);
                s_stats.pomodoroSess = pomodoro_stats.toString();
                client.setServer.run(s_stats);
                const successEmbed = new Discord.MessageEmbed()
                    .setColor('#e397b1')
                    .setDescription(`You've chosen:
                    ------------------
                    ${time_arr[0]} minutes of Studying followed by ${time_arr[1]} minutes of Relaxation
                    We hope you have a productive session!`)
                    .setFooter('Your session will begin in 10 seconds', 'https://i.imgur.com/vhSA4TX.jpg')
                message.channel.send(successEmbed).then(msg => msg.delete({timeout: 12000}));

                const ping_job = schedule.scheduleJob({ start: Date.now() + 10000, rule: '* * * * * *' }, function(){
                    ping_job.cancel();

                    s_stats = client.getAllServer.get();
                    pomodoro_stats = s_stats.pomodoroSess.split(',');
                    if (pomodoro_stats[i] == user_key) {
                        message.channel.send(`<@${userid}> It's time to study 📚`); // <:lofigirl:680763945489137665>
                    }
                });
                return;

            // A pomodoro session exists:
            } else if (pomodoro_stats[i].includes(userid) && pomodoro_stats[i].length != userid.length) {
                if (msg_arr.length == 2 && msg_arr[1] === 'stop') {
                    leaveSession(message, s_stats, pomodoro_stats, i, client, msgEmbed, `Leaving current pomodoro session`)
                    return;
                } else if (msg_arr.length == 2 && msg_arr[1] === 'status') {
                    const time_config = pomodoro_stats[i].split(':')[2].split('|');

                    // Relaxation
                    if (time_config[0] == '0') {
                        msgEmbed.description = `You should currently be Relaxing
                        Your study session will resume in ${time_config[1]} minutes`;
                    // Studying
                    } else {
                        msgEmbed.description = `You should currently be Studying
                        Your break period will resume in ${time_config[0]} minutes`;
                    }
                    message.channel.send(msgEmbed);
                    return;
                }
                msgEmbed.description = `You are already in a pomodoro session.
                Do you wish to leave your current session?

                If so, use command +pomodoro stop`;
                message.channel.send(msgEmbed);
                return;

            // User has not requested a pomodoro session
            } else if (pomodoro_stats[i] == userid && !timings) {
                if (msg_arr.length == 2 && msg_arr[1] === 'stop') {
                    leaveSession(message, s_stats, pomodoro_stats, i, client, msgEmbed, `Withdrawing pomodoro session request`)
                    return;
                }
                msgEmbed.description = `You have already requeted a pomodoro session
                
                Use command +minutes|minutes
                Example: +45|30
                Means 45 min of study followed by a 30 min break period.`;
                message.channel.send(msgEmbed);
                return;
            }
        }

        if (msg_arr.length == 2 && msg_arr[1] === 'start') {
            // Request pomodoro session:
            if (pomodoro_stats.length == 1 && pomodoro_stats[0] === ``) {
                pomodoro_stats[0] = userid;
            } else {
                pomodoro_stats.push(userid);
            }

            s_stats.pomodoroSess = pomodoro_stats.toString();
            client.setServer.run(s_stats);

            const requestEmbed = new Discord.MessageEmbed()
                .setColor('#e397b1')
                .setDescription(`How long do you wish to study | relax?
            
                Enter your answer as: +minutes|minutes
                Example: +45|30
                Means 45 min of study followed by a 30 min break period.`)
                .setFooter('Your pomodoro request will expire in 1 minute', 'https://i.imgur.com/vhSA4TX.jpg')
            message.channel.send(requestEmbed);

            const collector = new Discord.MessageCollector(message.channel, m => m.author.id === userid, { time: getMinutes(1) });
            collector.on('end', (collected, reason) => {
                s_stats = client.getAllServer.get();
                pomodoro_stats = s_stats.pomodoroSess.split(',');

                let loc = pomodoro_stats.indexOf(userid)
                if (loc != -1) {
                    pomodoro_stats.splice(loc, 1);
                    s_stats.pomodoroSess = pomodoro_stats.toString();
                    client.setServer.run(s_stats);

                    msgEmbed.description = `Pomodoro Request Canceled`;
                    message.channel.send(msgEmbed);
                    return;
                }
            });
            return;
        }

        msgEmbed.description = `Invalid Request:
        - You are not in a pomodoro session
        
        Use command +pomodoro start
        To request a study | break session`;
        message.channel.send(msgEmbed);

    }
}