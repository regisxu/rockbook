
var id = parseId(location.href);

function load() {
    var title = document.querySelector(".name")
    if (id) {
        title.textContent = "Add new route for wall " + id;
    } else {
        title.textContent = "Add new route";
    }

}

function parseId(url) {
    var index = url.lastIndexOf("#");
    if (index === -1) {
        return "";
    }
    return index === -1 ? "" : url.substring(index + 1);
}

function submit() {
    var form = document.getElementById("route");

    var request = new XMLHttpRequest();
    request.open("POST", "/api/route", true);
    request.setRequestHeader("Content-Type", "application/json");
    var data = {};
    data.name = document.getElementById("name").value;
    data.desc = document.getElementById("desc").value;
    data.level = document.getElementById("level").value;
    data.length = document.getElementById("length").value;
    data.bolts = document.getElementById("bolts").value;
    data.location = position;
    data.images = imageIds;

    request.onload = function(event) {
        if (request.status == 200) {
            console.log("Success!");
            window.location.href = "/web/route.html#" + JSON.parse(request.responseText).id;
        } else {
            console.log("error code: ", request.status);
        }
    };

    request.send(JSON.stringify(data));
}
