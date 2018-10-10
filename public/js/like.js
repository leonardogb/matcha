//boton para liker
$(document).ready(function(){
    $("#mylike").on('click', function(){
        var login = $("#mylike").val();
        // $.get("/profile/addlike/" + login);
        // $("#like").attr('class', 'btn btn-danger');
        $.ajax({url: "/profile/like/" + login, success: function(result)
        {
            if (result.action == "added")
            {
                $('#mylike').attr('class', 'btn btn-danger').html("<span class=\"fa fa-heart\"></span> Je suis liké(e)");
                var nb = parseInt($('#nbPop').text());
                $('#nbPop').text(nb + result.value);
                var nb2 = parseInt($('#nbLikes').text());
                $('#nbLikes').text(nb2 + 1);
            }
            else if (result.action == "removed")
            {
                $('#mylike').attr('class', 'btn btn-outline-danger').html("<span class=\"fa fa-heart\"></span> Like-moi !");
                var nb = parseInt($('#nbPop').text());
                $('#nbPop').text(nb + result.value);
                var nb2 = parseInt($('#nbLikes').text());
                $('#nbLikes').text(nb2 - 1);
            }
        }});
        
    });
});
