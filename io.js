module.exports = function(server)
{
    var io = require('socket.io')(server);
    var ent = require('ent');
    var chatModel = require('./models/chatM');
    var userModel = require('./models/userM');
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
    function escapeHtml(text) {
        var map = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        };
      
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
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
            //socket.leave(socket.room);
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
            var date = formatAMPM(new Date());
            chatModel.isValidData(data).then(result => {
                console.log(result);
                if (result)
                {
                    data['user'] = escapeHtml(data.user);
                    data['userImg'] = escapeHtml(data.userImg);
                    data['dst'] = escapeHtml(data.dst);
                    data['dstImg'] = escapeHtml(data.dstImg);
                    data['msg'] = escapeHtml(data.msg);
                    var destId = users[data.dst];
                    var userId = users[data.user];
                    if (userId)
                    {   
                        var usuarios = [];
                        usuarios.push(userModel.getIdUser(data.user));
                        usuarios.push(userModel.getIdUser(data.dst));
                        Promise.all(usuarios).then(resultado => {
                            if (destId)
                            {
                                data['date'] = date;
                                console.log(data);
                                socket.to(destId).emit('newMessage', data);
                            }
                            chatModel.newMsg(resultado[0].id, resultado[1].id, data.msg, new Date()).then(resultado =>
                            {
                                console.log(resultado);
                            });
                        });
                    }
                }
            });
        });
    });
    

};