var id = parseId(location.href);
var position = {};

function show() {
    async()
        .op("GET")
        .url("/api/wall/" + id)
        .success(showData)
        .send();
}

function showData(json) {
    var data = json;
    var title = document.querySelector(".name")
    title.textContent = "Edit wall " + data.name;
    title.setAttribute("id", id);

    document.getElementById("name").value = data.name;
    if (data.location && data.location.longitude && data.location.latitude) {
        document.getElementById("location").value = data.location.latitude + "," + data.location.longitude;
        position.longitude = data.location.longitude;
        position.latitude = data.location.latitude;
    } else {
        document.getElementById("location").value = "";
    }

    document.getElementById("desc").textContent = data.desc ? data.desc : "";

    if (data.images) {
        showImages(data.images.map(function(e) { return e.id; }));
    }
}

function submit() {
    var data = {};
    data.id = id;
    data.name = document.getElementById("name").value;
    data.desc = document.getElementById("desc").value;
    data.location = position;
    data.images = imageIds;

    var spinner = new Spinner(spinner_opts.submit);

    async()
        .op("PUT")
        .url("/api/wall")
        .data(data)
        .after(function() {
            document.querySelector("#btn-submit").setAttribute("disabled", "disabled");
            spinner.spin(document.querySelector(".btn-spinner"));
        })
        .success(function(result) { window.location.href = "/web/wall.html#" + result.id; })
        .anyway(function() { spinner.stop(); })
        .send();
}

$("#myModal").on("shown.bs.modal", function(e) {

    frames[0].showMap("map", position.longitude, position.latitude)

});

function ok() {
    position.longitude = frames[0].current.getPosition().lng;
    position.latitude = frames[0].current.getPosition().lat;
    document.getElementById("location").value = "" + position.longitude + "," + position.latitude;
}

show();
