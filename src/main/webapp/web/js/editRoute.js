var id = parseId(location.href);
var position = {};

function show() {
    async()
        .op("GET")
        .url("/api/route/" + id)
        .success(showData)
        .send();
}

function showData(json) {
    var data = json;
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

}

function submit() {
    var data = {};
    data.id = id;
    data.name = document.getElementById("name").value;
    data.desc = document.getElementById("desc").value;
    data.level = document.getElementById("level").value;
    data.length = document.getElementById("length").value;
    data.bolts = document.getElementById("bolts").value;
    data.location = position;
    data.images = imageIds;

    var spinner = new Spinner(spinner_opts.submit);

    async()
        .op("PUT")
        .url("/api/route")
        .data(data)
        .after(function() {
            document.querySelector("#btn-submit").setAttribute("disabled", "disabled");
            spinner.spin(document.querySelector(".btn-spinner"));
        })
        .success(function(result) { window.location.href = "/web/route.html#" + result.id; })
        .anyway(function() { spinner.stop(); })
        .send();
}

function ok() {
    position.longitude = frames[0].current.getPosition().lng;
    position.latitude = frames[0].current.getPosition().lat;
    document.getElementById("location").value = "" + position.longitude + "," + position.latitude;
}

$("#myModal").on("shown.bs.modal", function(e) {

    frames[0].showMap("map", position.longitude, position.latitude)

});

show();
