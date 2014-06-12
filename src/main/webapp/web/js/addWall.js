
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
}

