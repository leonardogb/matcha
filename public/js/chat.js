$(function(){

    function escapeHtml(text) {
        if (text)
        {
            var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
            };
        
            return text.replace(/[&<>"']/g, function(m) { return map[m]; });
        }
        else
            return (false);
        
      }

// var login = $('#desplegable').text(); ya esta en el header
    var userImg = escapeHtml($('#monImg').attr('src'));
    var destinoImg = escapeHtml($('#imgAvatar').attr('src'));

    // $(".addClass").click(function () {
    //     $('#qnimate').addClass('popup-box-on');
    // });
        
    // $(".removeClass").click(function () {
    //     $('#qnimate').removeClass('popup-box-on');
    // });

    $(".addClass").click(function () {
        var midiv = $(this).closest('div');
        $(midiv).prev().addClass('popup-box-on');
    });

    $(".removeClass").click(function () {
        $(this).closest('.popup-box').removeClass('popup-box-on');
    });

    // $("#status_message").on("keydown", function(e) {
    //     if (e.which == 13){
    //         var text = $(this).val();
    //         if (text !== ""){
    //             insertChat();
    //             $(this).val('');
    //         }
    //     }
    // });
    // $("#enviar").click(function(){
    //     insertChat();
    //     $('#status_message').val('');
    // });
/*
    $("textarea").keydown(function(e){
        if (e.which == 13){
            var user = $(this).closest('.blockChat').attr('id');
            var text = $(this).val();
            if (text !== ""){
                text = escapeHtml(text);
                insertChat(text, user);              
                $(this).val('');
            }
        }
    });
    $(".enviar").click(function(){
        var user = $(this).closest('.blockChat').attr('id');
        var text = $(this).prev().val();
        text = escapeHtml(text);
        insertChat(text, user);
        $(this).prev().val('');
    });
*/
    $(".blockFixe").on("keydown", "textarea", function(e){
        if (e.which == 13){
            var user = $(this).closest('.blockChat').attr('id');
            var text = $(this).val();
            if (text !== ""){
                text = escapeHtml(text);
                if (text && user)
                    insertChat(text, user);              
                $(this).val('');
            }
        }
    });

    $(".blockFixe").on("click", ".enviar", function(){
        var user = $(this).closest('.blockChat').attr('id');
        var text = $(this).prev().val();
        text = escapeHtml(text);
        if (text && user)
            insertChat(text, user);
        $(this).prev().val('');
    });
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

    function insertChat(text, userDst)
    {
        var message = $.trim(text);
        var destinatario = userDst;
        login = escapeHtml(login);
        if (message != "")
        {
            var hora = formatAMPM(new Date());
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
                <span class="direct-chat-timestamp pull-right">` + hora + `</span>
                </div>
                <div class="direct-chat-info clearfix"></div>
                <!-- /.direct-chat-text -->
            </div>`;
            if (destinatario == $('#login').text() && ($('#mylike').text() == "  Like-moi ! " || $('#yourlike').text() == " Je ne te like pas ! "))
            {
                alert("Attention ! Vous devez matcher avec " + destinatario + " pour utiliser le chat.")
            }
            else
            {
                $('#' + userDst + ' .chat-popup .popup-messages .direct-chat-messages').append(elemento);
                $(".popup-messages").animate({ scrollTop: $(".popup-messages").prop('scrollHeight')}, 'slow');
            }

            socket.emit('newMsg', {user: login, userImg: userImg, dst: destinatario, dstImg: destinoImg, msg: message});
        }
    }
    socket.on('newMessage', (data) =>
    {
        if (data.msg != "")
        {
            var dest = escapeHtml($('#login').text());
            if (!$('#' + data.user).length && dest != data.user)
            {
                var d = new Date(); 
                var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
                var date = d.toLocaleDateString('fr-FR', options);
                var elemento = 
                `
                <div id="` + data.user + `" class="blockChat">
                        <div class="popup-box chat-popup popup-box-on">
                            <div class="popup-head">
                                <div class="popup-head-left pull-left">
                                    <img class="dstImg" src="` + data.userImg + `" alt="` + data.user + `"> ` + data.user +
                                    ` - ` + data.dst + ` <img class="userImg" src="` + data.dstImg + `" alt="` + data.dst + `">` +
                                ` </div>
                                <div class="popup-head-right pull-right">
                                    <button data-widget="remove"  class="removeClass chat-header-button pull-right" type="button">
                                        <i class="fa fa-power-off"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="popup-messages">
                                <div class="direct-chat-messages" id="mensajes">
                                    <div class="chat-box-single-line">
                                        <abbr class="timestamp">` + date + `</abbr>
                                    </div>
                                </div>
                            </div>
                            <div class="popup-messages-footer">
                                <textarea placeholder="Type a message..." rows="10" cols="40" name="message"></textarea>
                                <!-- <div class="btn-footer"> -->
                                <button class="enviar btn-outline-info rounded-circle boton">
                                    <i class="fa fa-share"></i>
                                </button>
                            </div>
                            <!-- <div class="btn-footer"></div> -->
                        </div>
                        <div class="round hollow text-center botonChat">
                            <a class="addClass"><span class="fa fa-comment"></span>` + data.user + `</a>
                        </div>
                    </div>`;

                $('.contenedorChat').append(elemento);
                var parteChat = $('#' + data.user + ' .chat-popup .popup-messages');
                parteChat.animate({ scrollTop: parteChat.prop('scrollHeight')}, 'slow');
            }
            data['msg'] = escapeHtml(data.msg);
            hora = formatAMPM(new Date());
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
                <span class="direct-chat-timestamp pull-left">` + hora + `</span>
                </div>
                <div class="direct-chat-info clearfix"></div>
                <!-- /.direct-chat-text -->
            </div>`;
            $('#' + data.user + ' .popup-box .popup-messages .direct-chat-messages').append(elemento);
            //$('.direct-chat-messages').append(elemento);
            $(".popup-messages").animate({ scrollTop: $(".popup-messages").prop('scrollHeight')}, 'slow');
        }
        // $("textarea").keydown(function(e){
        //     if (e.which == 13){
        //         alert('Intro pulsado');
        //         var user = $(this).closest('.blockChat').attr('id');
        //         var text = $(this).val();
        //         if (text !== ""){
        //             text = escapeHtml(text);
        //             insertChat(text, user);              
        //             $(this).val('');
        //         }
        //     }
        // });
        // $(".enviar").click(function(){
        //     var user = $(this).closest('.blockChat').attr('id');
        //     var text = $(this).prev().val();
        //     text = escapeHtml(text);
        //     insertChat(text, user);
        //     $(this).prev().val('');
        // });
    });

    socket.on('newOnline', (newUser) =>
    {
        if (newUser == $('#login').text())
        {
            $('#imgAvatar').removeClass('offline');
            $('#imgAvatar').addClass('online');
        }
    });
    socket.on('newOffline', (newUser) =>
    {
        if (newUser == $('#login').text())
        {
            $('#imgAvatar').removeClass('online');
            //$('#imgAvatar').addClass('offline');
        }
    });
});