$(function(){

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

// var login = $('#desplegable').text(); ya esta en el header
    var userImg = escapeHtml($('#userImg').attr('src'));
    var destinoImg = escapeHtml($('#imgAvatar').attr('src'));

    $("#addClass").click(function () {
        $('#qnimate').addClass('popup-box-on');
    });
        
    $("#removeClass").click(function () {
        $('#qnimate').removeClass('popup-box-on');
    });

    $("#status_message").on("keydown", function(e) {
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

    function insertChat()
    {
        var message = escapeHtml($.trim($('#status_message').val()));
        var destinatario = escapeHtml($('#login').text());
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
            $('.direct-chat-messages').append(elemento);
            $(".popup-messages").animate({ scrollTop: $(".popup-messages").prop('scrollHeight')}, 'slow');

            socket.emit('newMsg', {user: login, userImg: userImg, dst: destinatario, dstImg: destinoImg, msg: message});
        }
    }
    socket.on('newMessage', (data) =>
    {
        if (data.msg != "")
        {
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
            $('.direct-chat-messages').append(elemento);
            $(".popup-messages").animate({ scrollTop: $(".popup-messages").prop('scrollHeight')}, 'slow');
        }
    });
});