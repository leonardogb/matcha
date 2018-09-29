//boton para liker
$(document).ready(function(){
    $("#mylike").on('click', function(){
        var login = $("#mylike").val();
        // $.get("/profile/addlike/" + login);
        // $("#like").attr('class', 'btn btn-danger');
        $.ajax({url: "/profile/like/" + login, success: function(result)
        {
            if (result == "added")
                $('#mylike').attr('class', 'btn btn-danger').html("<span class=\"fa fa-heart\"></span> Je suis liké(e)");
            else if (result == "removed")
                $('#mylike').attr('class', 'btn btn-outline-danger').html("<span class=\"fa fa-heart\"></span> Like-moi !");
        }});
        
    });
});
