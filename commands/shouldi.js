const Discord = require('discord.js');

module.exports = {
    name: 'shouldi',
    description: 'Lost for choice? Allow lo-fi chan to choose for you',
    execute(message) {

        // Some interesting... pre-text options:
        const pre_text = [
            'I am thinking',
            'My mind leans toward',
            'Eeny meeny miny moe, I pick',
            'My brain is telling me',
            'I strongly recommend',
            'You have no other option but',
            'No better time for/to',
            `Today's a great day for/to`,
            'I think it is in your best interest to',
            'Honestly,',
            'Idk anymore, try',
            'Let me flip a coin... Aha! you should',
            'You should',
            'Come on... Just',
            'Are you that bored? Just',
            'Let me ask my friend... She said',
            'Sheeeeesh, definitely',
            'My 8ball tells me you should',
            'This fortune cookie suggests',
            `My mind's telling me no... But my body... My body's telling me`,
        ]

        // Picking 'random' choice:
        const choices = message.content.substring(9).split(',');
        const choice_num = Math.floor(Math.random() * choices.length);
        const pre_num = Math.floor(Math.random() * pre_text.length);
        let choice = choices[choice_num];
        
        // Check for and remove (n) spaces before user choice:
        for (i = 0; i < choice.length; i++) {
            if (choice.charAt(i) != ' ') {
                choice = choice.substring(i);
                break;
            }
        }

        const resetEmbed = new Discord.MessageEmbed()
            .setColor('#e397b1')
            .setDescription(pre_text[pre_num] + ' ' + choice)
        message.channel.send(resetEmbed);
    }
}