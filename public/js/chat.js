$(function(){
    
    var login = $('#desplegable').text();
    var img = $('#userImg').attr('src');
    
    socket.emit('conectado', login);

    // socket.emit('subscribe', '5', 'Leonardo');

    $("#addClass").click(function () {
        $('#qnimate').addClass('popup-box-on');
    });
        
    $("#removeClass").click(function () {
        $('#qnimate').removeClass('popup-box-on');
    });

    $("#status_message").on("keydown", function(e){
        if (e.which == 13){
            var text = $(this).val();
            if (text !== ""){
                insertChat();              
                $(this).val('');
            }
        }
    });
    $("#enviar").click(function(){
        insertChat();
        $('#status_message').val('');
    });

    function insertChat()
    {
        var message = $.trim($('#status_message').val());
        var destinatario = $('#login').text();
        if (message != "")
        {
            var elemento = "\
            <div>\
                <div class=\"direct-chat-info clearfix\">\
                    <span class=\"direct-chat-name pull-left\">" + login + "</span>\
                </div>\
                <!-- /.direct-chat-info -->\
                <img alt=\"message user image\" src=\"" + img + "\"class=\"direct-chat-img\"><!-- /.direct-chat-img -->\
                <div class=\"triangulo-izq\"></div>\
                <div class=\"direct-chat-text\">"
                + message +                
                "</div>\
                <div class=\"direct-chat-info clearfix\">\
                <span class=\"direct-chat-timestamp pull-right\">" + "hora" + "</span>\
                </div>\
                <div class=\"direct-chat-info clearfix\"></div>\
                <!-- /.direct-chat-text -->\
            </div>";
            $('.direct-chat-messages').append(elemento);
            $(".popup-messages").animate({ scrollTop: $(".popup-messages").prop('scrollHeight')}, 'slow');

            socket.emit('newMsg', {dst: destinatario, msg: message, user: login, foto: img});
        }
    }
    socket.on('newMessage', function(data)
    {
        if (data.msg != "")
        {
            var elemento = "\
            <div>\
                <div class=\"direct-chat-info clearfix\">\
                    <span class=\"direct-chat-name-right pull-right\">" + data.user + "</span>\
                </div>\
                <!-- /.direct-chat-info -->\
                <img alt=\"message user image\" src=\"" + data.foto + "\"class=\"direct-chat-img-right\"><!-- /.direct-chat-img -->\
                <div class=\"triangulo-der\"></div>\
                <div class=\"direct-chat-text-right\">"
                + data.msg +                
                "</div>\
                <div class=\"direct-chat-info clearfix\">\
                <span class=\"direct-chat-timestamp pull-left\">" + "hora" + "</span>\
                </div>\
                <div class=\"direct-chat-info clearfix\"></div>\
                <!-- /.direct-chat-text -->\
            </div>";
            $('.direct-chat-messages').append(elemento);
            $(".popup-messages").animate({ scrollTop: $(".popup-messages").prop('scrollHeight')}, 'slow');
        }
    });
});