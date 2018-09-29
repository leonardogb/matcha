module.exports = function(server)
{
    var io = require('socket.io')(server);
    var ent = require('ent');
    var users = [];

    //console.log(io);
    io.on('connection', function(socket)
    {
        //console.log('Una conexión!');
        socket.on('conectado', function(newUser)
        {
            socket.user = newUser;
            users[newUser] = socket.id;
            console.log(users);
            console.log(io.engine.clientsCount);
        });
        socket.on('disconnect', function(desconexion)
        {
            delete users[socket.user];
            socket.leave(socket.room);
        });
        // socket.on('subscribe', function(room, user)
        // {
        //     console.log('joining room', room);
        //     socket.room = room;
        //     socket.join(room);
        //     //console.log(socket.adapter.rooms['5'].length);
        // });

        socket.on('newMsg', function(data)
        {
            var destId = users[data.dst];
            if (destId)
            {
                console.log(data);
                socket.to(destId).emit('newMessage', data);
                socket.to(destId).emit('newNot', "una notificación");
            }
        });
    });
    

};