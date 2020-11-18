module.exports = function(io: any) {

    // io.on('connection', function(socket) {
    //     console.log('user connected');
    //     io.sockets.emit('WELCOME_MESSAGE', 'Hi everyone!')

    //     //socket.on == espera un client.emit()
    //     socket.on('USER_LOGGED', function(user){
    //         //io.emit == envia un evento al/los client/s
    //         // MAIN SOCKET LISTEN
    //         socket.user = user;
    //     });

    //     socket.on('disconnect', () => {
    //         console.log('user disconnected');
    //     });
    // });
    

    const workspaces = io.of(/^\/\w+$/);

    workspaces.on('connection', socket => {
        const workspace = socket.nsp;
        socket.emit('CONTACT_REQUEST', 'asd');        
    });
}
