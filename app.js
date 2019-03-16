const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.get('/', (req, res) => {
    
});

io.on('connection', socket => {
    socket.on('fb watch', (msg) => {
        io.emit('fb watch', 'hello');
    })
})

server.listen(process.env.PORT || 3000, () => {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
})
