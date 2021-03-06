var id = parseId(location.href);
var position = {};
var data = {};
var photos = {};

function show() {
    async()
        .op("GET")
        .url(api_location + "/route/" + id)
        .success(showData)
        .send();
}

function showData(json) {
    data = json;
    var title = document.querySelector(".name")
    title.textContent = "Edit route " + data.name;
    title.setAttribute("id", id);
    document.getElementsByTagName("title")[0].textContent = "Edit route " + data.name;
    document.getElementById("name").value = data.name;
    showLocation(data.location);

    document.getElementById("level").value = data.level ? data.level : "";
    document.getElementById("length").value = data.length ? data.length : "";
    document.getElementById("bolts").value = data.bolts ? data.bolts : "";
    document.getElementById("desc").textContent = data.desc ? data.desc : "";

    photos = new Images(data.images ? data.images.map(function(e) { return e.id; }) : [], ".images");
    photos.show();

}

function showLocation(location) {
    if (location && location.longitude && location.latitude) {
        position.longitude = location.longitude;
        position.latitude = location.latitude;

        document.getElementById("location").value = "" + position.longitude + "," + position.latitude;
        document.getElementById("map").setAttribute("src", "http://api.map.baidu.com/staticimage?center=" + position.longitude + "," + position.latitude + "&width=300&height=200&zoom=13&markers=" + position.longitude + "," + position.latitude);

        document.getElementById("location").parentNode.style.display = "none";
        document.getElementById("map").style.display = null;
    } else {
        document.getElementById("location").value = "";
        document.getElementById("location").parentNode.style.display = null;
        document.getElementById("map").style.display = "none";
    }
}

function submit() {
    data.name = document.getElementById("name").value;
    data.desc = document.getElementById("desc").value;
    data.level = document.getElementById("level").value;
    data.length = document.getElementById("length").value;
    data.bolts = document.getElementById("bolts").value;
    data.location = position;
    data.images = photos.ids;

    var spinner = new Spinner(spinner_opts.submit);

    async()
        .op("PUT")
        .url(api_location + "/route")
        .data(data)
        .after(function() {
            document.querySelector("#btn-submit").setAttribute("disabled", "disabled");
            spinner.spin(document.querySelector(".btn-spinner"));
        })
        .success(function(result) { window.location.href = "route.html#" + result.id; })
        .anyway(function() { spinner.stop(); })
        .send();
}

function ok() {
    showLocation({ longitude: frames[0].current.getPosition().lng, latitude: frames[0].current.getPosition().lat});
}

$("#myModal").on("shown.bs.modal", function(e) {

    frames[0].showMap("map", position.longitude, position.latitude)

});

show();
