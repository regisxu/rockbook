var id = parseId(location.href);
var position = {};

function show() {
    d3.json("/api/route/" + id, function(error, json) {
	    if (error) {
            return console.warn(error);
        }

        data = json;
        var title = document.querySelector(".name")
        title.textContent = "Edit route " + data.name;
        title.setAttribute("id", id);

        document.getElementById("name").value = data.name;
        if (data.location && data.location.longitude && data.location.latitude) {
            document.getElementById("location").value = data.location.longitude + "," + data.location.latitude;
            position.longitude = data.location.longitude;
            position.latitude = data.location.latitude;
        } else {
            document.getElementById("location").value = "";
        }

        document.getElementById("level").value = data.level ? data.level : "";
        document.getElementById("length").value = data.length ? data.length : "";
        document.getElementById("bolts").value = data.bolts ? data.bolts : "";
        document.getElementById("desc").textContent = data.desc ? data.desc : "";

        if (data.images) {
            showImages(data.images.map(function(e) { return e.id; }));
        }
    });
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
    request.open("PUT", "/api/route", true);
    request.setRequestHeader("Content-Type", "application/json");
    var data = {};
    data.id = id;
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

