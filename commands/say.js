const fetch = require('node-fetch').default;

module.exports = {
    name: 'say',
    description: 'Feeling bored? Have a curious chit chat with lo-fi chan',
    execute(message, userid) {

        // Fetching response from chat bot API:
        fetch(`https://api.monkedev.com/fun/chat?msg=${message.content.substring(5)}&uid=${userid}&key=2VIadH6EW3DrzVW5UlS7v63Pa`)
            .then(response => response.json())
            .then(data =>{
                message.channel.send(data.response)
            })
            .catch(() => {
                message.channel.send(`I'm having trouble understanding. Could you reword that?`);
            })
    }
}