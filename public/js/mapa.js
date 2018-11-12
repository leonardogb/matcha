$(document).ready(function(){
    $("#botonMapa").on('click', function(){
        $.ajax({url: "/profile/map/", success: function(result)
        {
            mapboxgl.accessToken = result.key;

            unwired.key = mapboxgl.accessToken;

            var map = new mapboxgl.Map({
                container: 'mapa',
                attributionControl: false, //need this to show a compact attribution icon (i) instead of the whole text
                style: unwired.getLayer("streets"), //get Unwired's style template
                zoom: 17,
                center: [result.lon, result.lat]
            });

            var layers = ["streets", "earth", "hybrid"];
            map.addControl(new unwiredLayerControl({
                key: unwired.key,
                layers: layers
            }), 'top-left');

            var nav = new mapboxgl.NavigationControl();
            map.addControl(nav, 'top-right');

            map.addControl(new mapboxgl.ScaleControl({
                maxWidth: 80,
                unit: 'metric' //imperial for miles
            }));
        }});
    });
});
