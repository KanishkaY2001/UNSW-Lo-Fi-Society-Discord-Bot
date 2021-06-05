module.exports = {
    name: 'botspeak',
    description: 'Chat through lo-fi bot (joke cmd)',
    execute(message, admin) {
        const txt_channel = message.guild.channels.cache.find(c => c.name.toLowerCase() === message.content.split(" ")[1]);
        if (admin && txt_channel && txt_channel.type === 'text') {
            const channel_length = message.content.split(" ")[1].length;
            const bot_message = message.content.substring(11 + channel_length);
            // message.delete(); (lacks bot permission)
            txt_channel.send(bot_message);
        }
    }
}