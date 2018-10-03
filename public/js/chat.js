$(function(){
    
    // var login = $('#desplegable').text(); ya esta en el header
    var userImg = $('#userImg').attr('src');
    var destinoImg = $('#imgAvatar').attr('src');

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
            $('.direct-chat-messages').append(elemento);
            $(".popup-messages").animate({ scrollTop: $(".popup-messages").prop('scrollHeight')}, 'slow');

            socket.emit('newMsg', {user: login, userImg: userImg, dst: destinatario, dstImg: destinoImg, msg: message});
        }
    }
    socket.on('newMessage', function(data)
    {
        if (data.msg != "")
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
            $('.direct-chat-messages').append(elemento);
            $(".popup-messages").animate({ scrollTop: $(".popup-messages").prop('scrollHeight')}, 'slow');
        }
    });
});