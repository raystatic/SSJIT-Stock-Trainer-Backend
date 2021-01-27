const http = require('http');

const app = require('./app');

const api = require('indian-stock-exchange');

const NSEAPI = api.NSE;

const BSEAPI = api.BSE;

const port = process.env.PORT || 3000

const server = http.createServer(app);

server.listen(port, () => console.log(`server running on ${port}`));

var WebSocketServer = require('websocket').server;

var wsServer = new WebSocketServer({
    httpServer: server
});

wsServer.on('request', (request) => {
    console.log(`new request came from origin: ${request.origin}`);

    const connection = request.accept(null,request.origin);

    console.log(`ws: connected ${connection.connected}`);

    connection.on('message', (message) => {
        console.log(`Message recieved ${JSON.stringify(message)}`)
        connection.send(JSON.stringify(message));

            var i = 0;
            var test = `Test - ${i}`;
            const nseIndices = setInterval(() => {
                console.log(`function called`);
                NSEAPI.getIndices()
                .then((response) => {
                    // res.json({
                    // error:false,
                    // data:response.data
                    // });
                    i++;
                    connection.send(JSON.stringify({data:response.data,error:false, type:"NSE"}))
                })
                .catch((err) => {
                    //io.emit('nse_index',JSON.stringify({message:`Error: ${err.message}`,error:true}))
                    console.error(`NSE Error: ${err.message}`);
                });
                
            }, 5000);


            var j = 0;
            var test = `Test - ${j}`;
            const bseIndices = setInterval(() => {
                BSEAPI.getIndices()
                    .then((response) => {
                        // res.json({
                        // error:false,
                        // data:response.data
                        // });
                        j++;
                        connection.send(JSON.stringify({data:response.data,error:false, type:"BSE"}))
                    })
                    .catch((err) => {
                        console.error(`BSE Error: ${err.message}`);
                    });
                    
                }, 4000);

            });

    connection.on('close',(code, description) => {
        console.log(`closing: ${code} ${description}`);
        connection.close(code, description);
    })


});


// const io = require('socket.io')(server);
// io.on('connection', (socket) =>{
//     console.log("socket connection done");



//     // socket.on('stop_indices', () => {
//     //     clearInterval(nseIndices);
//     //     clearInterval(bseIndices);
//     // });
// });