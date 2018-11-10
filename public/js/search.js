$(document).ready(function() {
    $("#searchForm").submit(function(event){
        event.preventDefault(); //prevent default action 
        var post_url = $(this).attr("action"); //get form action url
        var form_data = $(this).serialize(); //Encode form elements for submission
        
        $.post( post_url, form_data, function( response ) {
            console.log(response);
            if (response)
            {
                $('#perfiles').empty();
                response.forEach(element => {
                    $('#perfiles').append(`<a href="/profile/user/` + element[1].login + `">
                    <div class="card">
                                <div class="box">
                                    <div class="img">
                                        <img src="` + element[1].img0 + `">
                                    </div>
                                    <h2><span>` + element[1].prenom + ` ` + element[1].nom + `</span><br></h2>
                                    <p> <strong>Genre: </strong> ` + element[1].genre + `</p>
                                    <p> <strong>Âge: </strong>` + element[1].age + `</p>
                                    <p> <strong>Orientation: </strong>` + element[1].orientation + `</p>
                                    <div class="progress progress-striped">
                                <div class="progress-bar progress-bar-success" role="progressbar" aria-valuemin="0" aria-valuemax="100" style="width: ` + element[0] + `%">
                                    <span class="textoCentro">` + element[0] + `%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </a>`);
                });
            }
        });
    });
});
