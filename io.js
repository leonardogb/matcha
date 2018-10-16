module.exports = function(server)
{
    var io = require('socket.io')(server);
    var ent = require('ent');
    var chatModel = require('./models/chatM');
    var userModel = require('./models/userM');
    var notifModel = require('./models/notifM');
    var likesModel = require('./models/likesM');
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
            userModel.getIdUser(newUser).then(usuario => {
                if (usuario)
                {
                    userModel.setVisite(usuario.id, "on").then( visite => {
                        if (visite)
                        {
                            socket.user = newUser;
                            users[newUser] = socket.id;
                            socket.broadcast.emit('newOnline', newUser);
                            console.log(users);
                            console.log(io.engine.clientsCount);
                        }
                    });
                }
            });
            
            
        });
        socket.on('disconnect', function(desconexion)
        {
            if (users[socket.user])
            {
                userModel.getIdUser(socket.user).then(usuario => {
                    if (usuario)
                    {
                        userModel.setVisite(usuario.id, "off").then( visite => {
                            if (visite)
                            {
                                delete users[socket.user];
                                socket.broadcast.emit('newOffline', socket.user);
                                console.log(users);
                                console.log(io.engine.clientsCount);
                            }
                        });
                    }
                });
            }
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
                            chatModel.newMsg(resultado[0].id, resultado[1].id, data.msg, new Date()).then(messageOk =>
                            {
                                console.log(messageOk);
                                // if (messageOk)
                                // {
                                //     notifModel.addNotif(resultado[1].id, "Message de " + socket.user + " : " + data.msg).then(resp => {
                                //         if (resp)
                                //             socket.to(users[data.dst]).emit('newNot', "Message de " + socket.user + " : " + data.msg);
                                //     }).catch(function(err)
                                //     {
                                //         console.log(err);
                                //     });
                                // }
                            });
                        });
                    }
                }
            });
        });
        socket.on('newNotif', (notif) => {
            notif['userDst'] = escapeHtml(notif.userDst);
            notif['notif'] = escapeHtml(notif.notif);
            userModel.getIdUser(notif.userDst).then(userid => {
                if (userid.id)
                {
                    userModel.getIdUser(socket.user).then(userid1 => {
                        if (userid1.id)
                        {
                            var likes = [];
                            likes.push(likesModel.likeExists(userid1.id, userid.id));
                            likes.push(likesModel.likeExists(userid.id, userid1.id));
                            Promise.all(likes).then(lik => {
                                if (notif.notif == "addLike")
                                {
                                    if (lik[0] == 1 && lik[1] == 1)
                                    {
                                        notifModel.addNotif(userid.id, "Bravo, vous matchez avec " + socket.user).then(resp => {
                                            //emit😊
                                            if (resp)
                                                socket.to(users[notif.userDst]).emit('newNot', "Bravo, vous matchez avec " + socket.user);
                                        });
                                    }
                                    else
                                    {
                                        notifModel.addNotif(userid.id, "Vous avez un nouveau like de " + socket.user).then(resp => {
                                            //emit
                                            if (resp)
                                                socket.to(users[notif.userDst]).emit('newNot', "Vous avez un nouveau like de " + socket.user);
                                        });
                                    }
                                }
                                else if (notif.notif == "removeLike")
                                {
                                    if (lik[0] == 1 && lik[1] == 0)
                                    {
                                        notifModel.addNotif(userid.id, "Vous ne matchez plus avec " + socket.user).then(resp => {
                                            //emit 😢
                                            if (resp)
                                                socket.to(users[notif.userDst]).emit('newNot', "Vous ne matchez plus avec " + socket.user);
                                        });
                                    }
                                    else
                                    {
                                        notifModel.addNotif(userid.id, socket.user + " ne vous like plus !").then(resp => {
                                            //emit
                                            if (resp)
                                                socket.to(users[notif.userDst]).emit('newNot', socket.user + " ne vous like plus !");
                                        });
                                    }
                                }
                                else if (notif.notif == "visit")
                                {
                                    notifModel.addNotif(userid.id, socket.user + " a visité ton profil").then(resp => {
                                        if (resp)
                                                socket.to(users[notif.userDst]).emit('newNot', socket.user + " a visité ton profil");
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    });
};