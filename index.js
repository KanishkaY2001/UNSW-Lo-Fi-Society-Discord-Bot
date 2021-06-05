const Discord = require('discord.js');

const {prefix, token} = require('./config.json');
const client = new Discord.Client();
const SQLite = require("better-sqlite3");
const u_sql = new SQLite('./user_db/userStats.sqlite');
const s_sql = new SQLite('./server_db/serverStats.sqlite');
const schedule = require('node-schedule');

const fs = require('fs');
const { parse } = require("path")

// Initializing commands directory
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}


// Preparing db and initializing:
client.on('ready', () => {

    // User DB:
    const user_table = u_sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'userStats';").get();

    if (!user_table['count(*)']) {
        u_sql.prepare("CREATE TABLE userStats (id TEXT PRIMARY KEY, user TEXT, guild TEXT, wenkisses INTEGER, awards TEXT);").run();
        u_sql.prepare("CREATE UNIQUE INDEX idx_userStats_id ON userStats (id);").run();
        u_sql.pragma("synchronous = 1");
        u_sql.pragma("journal_mode = wal");
    }

    client.getAllUser = u_sql.prepare("SELECT * FROM userStats");
    client.getUser = u_sql.prepare("SELECT * FROM userStats WHERE user = ? AND guild = ?");
    client.setUser = u_sql.prepare("INSERT OR REPLACE INTO userStats (id, user, guild, wenkisses, awards) VALUES (@id, @user, @guild, @wenkisses, @awards);");

    // Server DB:
    const server_table = s_sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'serverStats';").get();

    if (!server_table['count(*)']) {
        s_sql.prepare("CREATE TABLE serverStats (id TEXT PRIMARY KEY, wenkissBoard TEXT, pomodoroSess TEXT);").run();
        s_sql.prepare("CREATE UNIQUE INDEX idx_serverStats_id ON serverStats (id);").run();
        s_sql.pragma("synchronous = 1");
        s_sql.pragma("journal_mode = wal");
    }

    client.getAllServer = s_sql.prepare("SELECT * FROM serverStats");
    client.setServer = s_sql.prepare("INSERT OR REPLACE INTO serverStats (id, wenkissBoard, pomodoroSess) VALUES (@id, @wenkissBoard, @pomodoroSess);");

    // Daily wenkiss board reset:
    const wenkiss_job = schedule.scheduleJob('50 59 23 * * 0-6', function(){
        resetWenkissBoard();
        console.log("clearing leaderboard");
    });

    // Update pomodoro sessions:
    const pomodoro_job = schedule.scheduleJob({ start: Date.now(), rule: '*/1 * * * *' }, function(){
        let s_stats = client.getAllServer.get();
        let pomodoro_stats = s_stats.pomodoroSess.split(',');

        if (pomodoro_stats[0] != ``) {
            for (i = 0; i < pomodoro_stats.length; i++) {
                let user_key = pomodoro_stats[i].split(':');
                if (user_key.length == 3) {
                    const preset_text = user_key[0];
                    const preset_config = user_key[0].split('|');
                    let temp_id = user_key[1];
                    let time_config = user_key[2].split('|');
                    let study_time = parseInt(time_config[0]);
                    let relax_time = parseInt(time_config[1]);

                    // Session Status: Relaxing
                    if (study_time == 0) {
                        if (relax_time - 1 == 0) {
                            user_key = preset_text + ':' + temp_id + ':' + `${preset_config[0]}|0`
                            client.commands.get('pomodoro').execute('end_relax', client, temp_id, def_channel);
                        } else {
                            user_key = preset_text + ':' + temp_id + ':' + `0|${relax_time-1}`
                        }
                        pomodoro_stats.splice(i, 1, user_key);

                    // Session Status: Studying
                    } else if (relax_time == 0) {
                        if (study_time - 1 == 0) {
                            user_key = preset_text + ':' + temp_id + ':' + `0|${preset_config[1]}`
                            client.commands.get('pomodoro').execute('end_study', client, temp_id, def_channel);
                        } else {
                            user_key = preset_text + ':' + temp_id + ':' + `${study_time-1}|0`
                        }
                        pomodoro_stats.splice(i, 1, user_key);
                    }
                    s_stats.pomodoroSess = pomodoro_stats.toString();
                    client.setServer.run(s_stats);
                }
            }
        }
    });

    console.log(`Logged in as ${client.user.tag}`);
});

// General Variables:
const date = new Date(); // date object
const admin_role = 'admin'; // role name for admin
const everyone_cmd = '@everyone';
const here_cmd = '@here';
const bants_channel = 'bot-test-spam'; // lnb channel
const announcements_channel = 'test-announc'; // to be replaced with 'announcements'
const def_channel = '845945846905569310'; // to be replaced with channel id of bot's default channel


// Automatic reacts:
const common_reacts = [
    '🎨', // <:lofilove:747112355212689478>
    '☹️', // <:kyuublessed:681333315776938007>
    '🥁', // <:blobthumbsup:813653989375475732>
    '⏰', // <:usagi_uwu:741844115624427613>
    '🌇' // <:anoeto:756055180188975136>
];


// Wenkiss Leaderboard Config:
const wenkiss_emote = '👿'; // to be replaced with <:wenkiss:846024675472965662>
const award_emotes = ['👑','🥈','🥉']; // award emotes
const wenkiss_hours =  [0, 23]; // 0 -> 2 to account from 12am - 1am
const board_cap = 20; // capacity for users awarded for wenkiss per night


// Quicklinks:
const links = {
    linktree: '[lo-fi Linktree](https://linktr.ee/lofisoc)',
    youtube: '[lo-fi Youtube](https://www.youtube.com/channel/UCxGMlT2u_SqddMwRbeyWugQ/featured)',
    facebook: '[lo-fi Facebook](http://fb.com/unswlofisoc)',
    insta: '[lo-fi Instagram](https://www.instagram.com/unsw.lofi/)',
    mixtape: '[lo-fi 2020 Mixtape](https://open.spotify.com/album/63QTtFLlZ07YgUDUrhevKa?si=BUHxOiZHQhqjKyMLr2PzjQ&nd=1)',
    discord: '[lo-fi Discord](https://discord.gg/84YRm5R56E)',
};

// Converting minutes to miliseconds:
function getMinutes(min) {
    return min*60000
}

// Returns server stats:
function getServerStats() {
    let s_stats = client.getAllServer.get();
    if (!s_stats) {
        s_stats = {id: 'lo-fi', wenkissBoard: ``, pomodoroSess: `` };
    }
    return s_stats;
}

// Reset wenkiss leaderboard
function resetWenkissBoard() {
    let s_stats = getServerStats();
    s_stats.wenkissBoard = ``;
    client.setServer.run(s_stats);
}


// Returns a user's wenkiss score details:
function getWenkiss(userid, guildid) {
    let wenscore = client.getUser.get(userid, guildid);
    if (!wenscore) {
        wenscore = { id: `${guildid}-${userid}`, user: userid, guild: guildid, wenkisses: 0, awards: '0,0,0' }
    }
    return wenscore;
}


// Returns number followed by ordinal:
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


// Returns an array of users' alltime wenkiss ranks:
function wenkissRanksArray() {
    let points_dict = {};
    for (const score of client.getAllUser.iterate()) {
        points_dict[score.user] = score.wenkisses;
    }

    let wenscore_array = Object.keys(points_dict).map(function(key) {
        return [key, points_dict[key]];
    });

    wenscore_array.sort(function(f, s) {
        return s[1] - f[1];
    });
    return wenscore_array
}


// Returns a user's alltime wenkiss rank:
function myWenkissRank(userid) {
    let wenscore_array = wenkissRanksArray()

    for (rank = 0; rank < wenscore_array.length; rank++) {
        if (wenscore_array[rank][0] == userid) {
            return rank+1;
        }
    }
    return 0;
}


// Bot command list:
const bot_cmds = { // command : [admin_only, help_descsription]
    'links': [false, client.commands.get('links').description],
    'help': [false, client.commands.get('help').description],
    'botspeak': [true, client.commands.get('botspeak').description],
    'mywenkiss': [false, client.commands.get('mywenkiss').description],
    'wentop alltime': [false, client.commands.get('wentop').description],
    'wentop today': [false, client.commands.get('wentop').description_2],
    'shouldi': [false, client.commands.get('shouldi').description],
    'say': [false, client.commands.get('say').description],
    'getwenkiss': [true, client.commands.get('getwenkiss').description],
    'takewenkiss': [true, client.commands.get('takewenkiss').description],
    'givewenkiss': [true, client.commands.get('givewenkiss').description],
    'pomodoro start': [false, client.commands.get('pomodoro').pomo_start],
    'pomodoro stop': [false, client.commands.get('pomodoro').pomo_stop],
    'pomodoro status': [false, client.commands.get('pomodoro').pomo_stat],
    'resetdb': [true, client.commands.get('resetdb').description],
    'backupdb': [true, client.commands.get('backupdb').description],
    'migratedb': [true, client.commands.get('migratedb').description]
};


// Message input response:
client.on('message', message => {
    if (message.author.bot) return;
    let userid = message.author.id;
    let guildid = message.guild.id;

    // Wenkiss function:
    if (!message.content.startsWith(prefix) && message.guild) {
        if (message.channel.name == bants_channel && date.getHours() >= wenkiss_hours[0] && date.getHours() < wenkiss_hours[1]) {
            if (message.content.includes(wenkiss_emote)) {
                let s_stats = getServerStats();
                let wenkiss_board = s_stats.wenkissBoard.split(',');
                
                if (!wenkiss_board.includes(userid) && wenkiss_board.length < board_cap) { // Check for duplicates and max capacity

                    // Setting daily wenkiss rank:
                    if (wenkiss_board.length == 1 && wenkiss_board[0] === ``) {
                        wenkiss_board[0] = userid;
                    } else {
                        wenkiss_board.push(userid);
                    }
                    s_stats.wenkissBoard = wenkiss_board.toString();

                    /*
                    Wenkisses Calculation (c):
                    ----------------------
                    -> First 20 reacts receive Wenkisses with -5 decrement per ranking from 100 Wenkisses
                        --[[ Rank 1: 100c, Rank 2: 95c ... Rank 20: 5c ]]--

                    -> Reacts between 12am-1am receive Wenkisses with -1 decrement per minute from 60 Wenkisses
                        --[[ 12am: 60c, 12:05am: 55c, 12:56am: 4c ]]--
                    */
                    
                    // Calculating wenkiss reward/awards:
                    let total_kisses = (100 - (wenkiss_board.length - 1) * 5) + (60 - date.getMinutes()); // Wenkisses formula
                    let wenscore = getWenkiss(userid, guildid);
                    wenscore.wenkisses += total_kisses;

                    if (award_emotes[wenkiss_board.length-1]) {
                        let award_array = wenscore.awards.split(',');
                        let num = +award_array[wenkiss_board.length-1] + 1;

                        award_array[wenkiss_board.length-1] = num;
                        wenscore.awards = award_array.toString();
                    }

                    // Updating database:
                    client.setUser.run(wenscore);
                    client.setServer.run(s_stats);
                    client.commands.get('emoteresponse').execute(message, true, getPlacement(wenkiss_board.length), wenscore.wenkisses, award_emotes);
                    return;
                }
                // This is an error message which is sent when user tries to wenkiss more than once. Is it necessary?
                //client.commands.get('emoteresponse').execute(message, false);
            }
        } else if (message.channel.name == announcements_channel && (message.content.includes(everyone_cmd) || message.content.includes(here_cmd))) {
            for (i = 0; i < common_reacts.length; i++) {
                message.react(common_reacts[i]);
            }
        }
        return;
    }

    // Bot command filter:
    const args = message.content.slice(prefix.length).split()
    const command = args.shift().toLowerCase();
    const var_command = command.split(' ')[0]

    if (command.split('|').length == 2) {
        const timings = command.split('|')

        for (i = 0; i < timings.length; i++) {
            let num_str = timings[i].toString();
            if ((num_str.length > 1 && num_str[0] == '0') || isNaN(timings[i]) || timings[i] < 1) {
                client.commands.get('invalid').execute(message, 'pomodoro');
                return;
            }
        }
        client.commands.get('pomodoro').execute(message, client, timings, command);
        return;
    }

    switch(var_command) {
        case 'botspeak':
            client.commands.get('botspeak').execute(message, message.member.roles.cache.some(r => r.name === admin_role));
            return;
        case 'shouldi':
            client.commands.get('shouldi').execute(message);
            return;
        case 'say':
            client.commands.get('say').execute(message, userid);
            return;
        case 'getwenkiss':
            client.commands.get('getwenkiss').execute(message, client);
            return;
        case 'takewenkiss':
            client.commands.get('takewenkiss').execute(message, client);
            return;
        case 'givewenkiss':
            client.commands.get('givewenkiss').execute(message, client);
            return;
        case 'pomodoro':
            client.commands.get('pomodoro').execute(message, client);
            return;
        case 'migratedb':
            client.commands.get('migratedb').execute(message, u_sql, s_sql, client);
            return;
    }

    switch(command) {
        case 'links':
            client.commands.get('links').execute(message, links);
            return;
        case 'mywenkiss':
            client.commands.get('mywenkiss').execute(message, getWenkiss(userid, guildid), getPlacement(myWenkissRank(userid)), award_emotes);
            return;
        case 'resetdb':
            client.commands.get('resetdb').execute(message, u_sql, s_sql, message.member.roles.cache.some(r => r.name === admin_role), client);
            return;
        case 'wentop alltime':
            client.commands.get('wentop').execute(message, award_emotes, wenkissRanksArray(), client);
            return;
        case 'wentop today':
            client.commands.get('wentop').execute(message, award_emotes, wenkissRanksArray(), client, getServerStats().wenkissBoard.split(','));
            return;
        case 'help':
            client.commands.get('help').execute(message, message.member.roles.cache.some(r => r.name === admin_role), bot_cmds);
            return;
        case 'backupdb':
            client.commands.get('backupdb').execute(message);
            return;
    }

    client.commands.get('invalid').execute(message);

});

client.login(token);