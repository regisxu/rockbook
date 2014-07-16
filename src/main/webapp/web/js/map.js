var map = {};
var current = {};

function showMap(id, x, y) {
    var spinner = new Spinner(spinner_opts.page_loading);
    spinner.spin(document.getElementById(id));

    if (!x || !y) {
        currentPosition(function(position) {
            spinner.stop();
            var coords = position.coords;    
            x = coords.longitude;
            y = coords.latitude;
            show(id, x, y);
        }, function(error) {
            spinner.stop();
            switch(error.code) {
            case error.TIMEOUT:
                console.error("A timeout occured! Please try again!");
                break;
            case error.POSITION_UNAVAILABLE:
                console.error('We can\'t detect your location. Sorry!');
                break;
            case error.PERMISSION_DENIED:
                console.error('Please allow geolocation access for this to work.');
                break;
            case error.UNKNOWN_ERROR:
                console.error('An unknown error occured!');
                break;
            }
            x = 116.4035;
            y = 39.915;
            show(id, x, y);
        });
    } else {
        show(id, x, y);
        spinner.stop();
    }
}

function show(id, x, y) {
    map = new BMap.Map(id);
    map.centerAndZoom(new BMap.Point(x,y), 15);
    map.enableScrollWheelZoom();
    setMarker(x, y);
    map.addEventListener("click", function(e){
        removeMarker(current)
        current = addMarker(e.point.lng, e.point.lat);
    });
}

function setMarker(x, y) {
    removeMarker(current);
    current = addMarker(x, y);
}

function addMarker(x, y) {
    var marker = new BMap.Marker(new BMap.Point(x, y));
    map.addOverlay(marker);
    return marker;
}

function removeMarker(marker) {
    map.removeOverlay(marker);
}

function search(value, panel) {
    var local = new BMap.LocalSearch("È«¹ú", {
        renderOptions: {
            map: map,
            panel : panel,
            autoViewport: true,
            selectFirstResult: true
        }
    });
    local.search(value);
}

function currentPosition(callback, error) {
    var locationError = error;

    var locationSuccess = callback;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(locationSuccess, locationError,{
            enableHighAcuracy: true,
            timeout: 5000,
            maximumAge: 3000
        });
    } else {
        alert("Your browser does not support Geolocation!");
    }
}
