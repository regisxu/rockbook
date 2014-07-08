
var position = {};

function submit() {
    var form = document.getElementById("wall");

    var request = new XMLHttpRequest();
    request.open("POST", "/api/wall", true);
    request.setRequestHeader("Content-Type", "application/json");
    var data = {};
    data.name = document.getElementById("name").value;
    data.desc = document.getElementById("desc").value;
    data.location = position;
    data.images = imageIds;

    request.onload = function(event) {
        if (request.status == 200) {
            console.log("Success!");
            window.location.href = "/web/wall.html#" + JSON.parse(request.responseText).id;
        } else {
            console.log("error code: ", request.status);
        }
    };

    request.send(JSON.stringify(data));

    document.querySelector("#btn-submit").setAttribute("disabled", "disabled");
    var opts = {
        lines: 10, // The number of lines to draw
        length: 8, // The length of each line
        width: 3, // The line thickness
        radius: 8, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#000', // #rgb or #rrggbb or array of colors
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: '50%', // Top position relative to parent
        left: '50%' // Left position relative to parent
    };
    var spinner = new Spinner(opts);
    spinner.spin(document.querySelector(".btn-spinner"));
}

