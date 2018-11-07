$(document).ready(function(){
    $("#reportFaux").on('click', function(){
        var login = $("#reportFaux").val();

        $.post( "/profile/report", {report: "faux", login: login}, function( data )
        {
            if (data)
            {
                $('#messages').append(`<div class="alert alert-success">
                <a class="close" data-dismiss="alert" href="#">×</a>Vous avez bien signalé un faux profil
            </div>`);
            }
            else
            {
                $('#messages').append(`<div class="alert alert-danger">
                <a class="close" data-dismiss="alert" href="#">×</a>Ce profil a été déjà signalé
            </div>`);
            }
        });
    });

    $("#reportBlock").on('click', function(){
        var login = $("#reportBlock").val();

        $.post( "/profile/report", {report: "block", login: login}, function( data )
        {
            if (data)
            {
                $('#messages').append(`<div class="alert alert-success">
                <a class="close" data-dismiss="alert" href="#">×</a>Vous avez bloqué ce profil
            </div>`);
            }
            else
            {
                $('#messages').append(`<div class="alert alert-danger">
                <a class="close" data-dismiss="alert" href="#">×</a>Ce profil a été déjà bloqué
            </div>`);
            }
        });
    });
});