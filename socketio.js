module.exports = (server) => {

    var io = require('socket.io')(server);

    console.log('here is reached')

    io.on('connection', (socket) => {
        console.log('connection done!')
        socket.on('connect', () => {
            console.log(`connect done`)
        })
    });

}