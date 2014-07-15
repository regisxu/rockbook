var position = {};

function submit() {
    var data = {};
    data.name = document.getElementById("name").value;
    data.desc = document.getElementById("desc").value;
    data.location = position;
    data.images = imageIds;

    var spinner = new Spinner(spinner_opts.submit);

    async()
        .op("POST")
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

function ok() {
    position.longitude = frames[0].current.getPosition().lng;
    position.latitude = frames[0].current.getPosition().lat;
    document.getElementById("location").value = "" + position.longitude + "," + position.latitude;
}

$("#myModal").on("shown.bs.modal", function(e) {

    frames[0].showMap("map", position.longitude, position.latitude)

});

