
    socket.on('newMessage', function(data)
    {
        if (data.msg != "")
        {
          if ($('#' + data.user).length)
          {
            var elemento = `
            <div>
                <div class="direct-chat-info clearfix">
                    <span class="direct-chat-name-right pull-right">` + data.user + `</span>
                </div>
                <!-- /.direct-chat-info -->
                <img alt="message user image" src="` + data.userImg + `"class="direct-chat-img-right"><!-- /.direct-chat-img -->
                <div class="triangulo-der"></div>
                <div class="direct-chat-text-right">`
                + data.msg +
                `</div>
                <div class="direct-chat-info clearfix">
                <span class="direct-chat-timestamp pull-left">` + "hora" + `</span>
                </div>
                <div class="direct-chat-info clearfix"></div>
                <!-- /.direct-chat-text -->
            </div>`;
            $('#' + data.user + ' .chat-popup .popup-messages .direct-chat-messages').append(elemento);
            var parteChat = $('#' + data.user + ' .chat-popup .popup-messages');
            parteChat.animate({ scrollTop: parteChat.prop('scrollHeight')}, 'slow');
          }
          else
          {
            var elemento = 
            `
              <div id="` + data.user + `" class="blockChat">
                    <div class="popup-box chat-popup popup-box-on" id="qnimate">
                        <div class="popup-head">
                            <div class="popup-head-left pull-left">
                                <img id="dstImg" src="` + data.userImg + `" alt="` + data.user + `"> ` + data.user +
                                ` - ` + data.dst + ` <img id="userImg" src="` + data.dstImg + `" alt="` + data.dst + `">` +
                            ` </div>
                            <div class="popup-head-right pull-right">
                                <button data-widget="remove" id="removeClass" class="chat-header-button pull-right" type="button">
                                    <i class="fa fa-power-off"></i>
                                </button>
                            </div>
                        </div>
                        <div class="popup-messages">
                            <div class="direct-chat-messages" id="mensajes">
                                <div class="chat-box-single-line">
                                    <abbr class="timestamp">October 8th, 2015</abbr>
                                </div>
                                <!-- Message. Default to the left -->
                                <div>
                                    <div class="direct-chat-info clearfix">
                                        <span class="direct-chat-name-right pull-right">` + data.user + `</span>
                                    </div>
                                    <!-- /.direct-chat-info -->
                                    <img alt="message user image" src="` + data.userImg + `" class="direct-chat-img-right"><!-- /.direct-chat-img -->
                                    <div class="triangulo-der"></div>
                                    <div class="direct-chat-text-right">` + data.msg + `</div>
                                    <div class="direct-chat-info clearfix">
                                        <span class="direct-chat-timestamp pull-left">3.36 PM</span>
                                    </div>
                                    <div class="direct-chat-info clearfix"></div>
                                    <!-- /.direct-chat-text -->
                                </div>
                                <!-- /.direct-chat-msg -->
                            </div>
                        </div>
                        <div class="popup-messages-footer">
                            <textarea placeholder="Type a message..." rows="10" cols="40" name="message"></textarea>
                            <!-- <div class="btn-footer"> -->
                            <button class="enviar" class="btn-outline-info rounded-circle boton">
                                <i class="fa fa-share"></i>
                            </button>
                        </div>
                        <!-- <div class="btn-footer"></div> -->
                    </div>
                    <div class="round hollow text-center botonChat">
                        <a id="addClass"><span class="fa fa-comment"></span>` + data.user + `</a>
                    </div>
                </div>`;

            $('.contenedorChat').append(elemento);
            var parteChat = $('#' + data.user + ' .chat-popup .popup-messages');
            parteChat.animate({ scrollTop: parteChat.prop('scrollHeight')}, 'slow');
          }
        
            //onclick="enviar(this)"  onkeypress="intro(this)"
            $("textarea").keydown(function(e){
                if (e.which == 13){
                    var user = $(this).closest('.blockChat').attr('id');
                    var text = $(this).val();
                    if (text !== ""){
                        insertChat(text, user);              
                        $(this).val('');
                    }
                }
            });
            $("#" + data.user + " .popup-box .popup-messages-footer .status_message .enviar").click(function(){
                insertChat();
                $('#status_message').val('');
            });
        }
    });

    // function intro(ele)
    // {
    //     if (event.key === 'Enter'){
    //         var text = ele.value;
    //         if (text !== ""){
    //             insertChat();              
    //             ele.value = '';
    //         }
    //     }
    // }

    // function enviar(ele)
    // {
    //     insertChat();
    //     ele.value = '';
    // }

    function insertChat(text, user)
    {
        var message = $.trim(text);
        var destinatario = user;
        var userImg = $('#userImg').attr('src');
        var destinoImg = $(user).attr('src')

        if (message != "")
        {
            var elemento = `
            <div>
                <div class="direct-chat-info clearfix">
                    <span class="direct-chat-name pull-left">` + login + `</span>
                </div>
                <!-- /.direct-chat-info -->
                <img alt="message user image" src="` + userImg + `"class="direct-chat-img"><!-- /.direct-chat-img -->
                <div class="triangulo-izq"></div>
                <div class="direct-chat-text">`
                + message +
                `</div>
                <div class="direct-chat-info clearfix">
                <span class="direct-chat-timestamp pull-right">` + "hora" + `</span>
                </div>
                <div class="direct-chat-info clearfix"></div>
                <!-- /.direct-chat-text -->
            </div>`;
            $('#' + destinatario + ' .chat-popup .popup-messages .direct-chat-messages').append(elemento);
            var parteChat = $('#' + destinatario + ' .chat-popup .popup-messages');
            parteChat.animate({ scrollTop: parteChat.prop('scrollHeight')}, 'slow');

            //console.log(login + " " + userImg + " " + destinatario + " " + destinoImg + " " + message);
            socket.emit('newMsg', {user: login, userImg: userImg, dst: destinatario, dstImg: destinoImg, msg: message});
        }
    }
