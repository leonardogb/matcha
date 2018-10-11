$(document).ready(function() {
            
    var readURL = function(input, nbImg) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                if (nbImg == "img0")
                    $('.img0').attr('src', e.target.result);
                else if (nbImg == "img1")
                    $('.img1').attr('src', e.target.result);
                else if (nbImg == "img2")
                    $('.img2').attr('src', e.target.result);
                else if (nbImg == "img3")
                    $('.img3').attr('src', e.target.result);
                else if (nbImg == "img4")
                    $('.img4').attr('src', e.target.result);
            }

            reader.readAsDataURL(input.files[0]);
        }
    }

    $(".img0").on('click', function()
    {
        $("input[id='imgInput0']").click();
        $("#imgInput0").on('change', function()
        {
            
            readURL(this, "img0");
        });
    });

    $(".img1").on('click', function()
    {
        $("input[id='imgInput1']").click();
        $("#imgInput1").on('change', function()
        {
            readURL(this, "img1");
        });
    });
    $(".img2").on('click', function()
    {
        $("input[id='imgInput2']").click();
        $("#imgInput2").on('change', function()
        {
            readURL(this, "img2");
        });
    });
    $(".img3").on('click', function()
    {
        $("input[id='imgInput3']").click();
        $("#imgInput3").on('change', function()
        {
            readURL(this, "img3");
        });
    });
    $(".img4").on('click', function()
    {
        $("input[id='imgInput4']").click();
        $("#imgInput4").on('change', function()
        {
            readURL(this, "img4");
        });
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    function showPosition(position)
    {
        //alert(position.coords.latitude + ", " + position.coords.longitude);
        $('#lat').val(position.coords.latitude);
        $('#lon').val(position.coords.longitude);
        $.getJSON('https://nominatim.openstreetmap.org/reverse', {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            format: 'json',
        }, function (result) {
            console.log(result);
            $('#location').text(result.address.city_district);
        });
    }
});