$(document).ready(function(){
    $("#reportFaux").on('click', function(){
        var login = $("#reportFaux").val();
        // $.get("/profile/addlike/" + login);
        // $("#like").attr('class', 'btn btn-danger');
        $.post( "/profile/report", {report: "faux", login: login}, function( data )
        {
            alert(data);//añadir mensaje de éxito o fracaso del report
        });
    });

    $("#reportBlock").on('click', function(){
        var login = $("#reportBlock").val();
        // $.get("/profile/addlike/" + login);
        // $("#like").attr('class', 'btn btn-danger');
        $.post( "/profile/report", {report: "block", login: login}, function( data )
        {
            alert(data);//añadir mensaje de éxito o fracaso del report
        });
    });
});