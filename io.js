module.exports = function(server)
{
    var io = require('socket.io')(server);
    var ent = require('ent');
    var users = [];

    function formatAMPM(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }
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
            var date = formatAMPM(new Date());
            if (destId)
            {
                data['date'] = date;
                console.log(data);
                socket.to(destId).emit('newMessage', data);
                socket.to(destId).emit('newNot', "una notificación");
            }
        });
    });
    

};