var id = parseId(location.href);
var position = {};
var data = {};
var photos = {};

function show() {
    async()
        .op("GET")
        .url(api_location + "/area/" + id)
        .success(showData)
        .send();
}

function showData(json) {
    data = json;
    var title = document.querySelector(".name")
    title.textContent = "Edit area " + data.name;
    title.setAttribute("id", id);
    document.getElementsByTagName("title")[0].textContent = "Edit area " + data.name;
    document.getElementById("name").value = data.name;

    showLocation(data.location);

    document.getElementById("desc").textContent = data.desc ? data.desc : "";

    showSubList();

    photos = new Images(data.images ? data.images.map(function(e) { return e.id; }) : [], ".images");
    photos.show();
}

function showSubList() {
    var subs = data.walls ? (data.areas ? data.walls.concat(data.areas) : data.walls) : (data.areas ? data.areas : null);

    if (subs) {

        var sub = d3.select(".subs-list tbody").selectAll("tr").data(subs, function(d) { return d.id; });
        sub.enter()
            .append(function() { return document.querySelector(".template .tr-sub").cloneNode(true); })
            .attr("id", function(d) { return d.id; })
            .selectAll(".td-sub").data(function(d) { return [d.name, typeOf(d.id), d.desc, "__button__"]; })
            .text(function(d) { return d; });

        sub.exit().remove();

    }

}

function typeOf(id) {
    for (var i = 0; data.walls && i < data.walls.length; ++i) {
        if (id == data.walls[i].id) {
            return "wall";
        }
    }

    for (var i = 0; data.areas && i < data.areas.length; ++i) {
        if (id == data.areas[i].id) {
            return "area";
        }
    }
    // TODO handle error
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
    data.location = position;
    data.images = photos.ids;

    var spinner = new Spinner(spinner_opts.submit);

    async()
        .op("PUT")
        .url(api_location + "/area")
        .data(data)
        .after(function() {
            document.querySelector("#btn-submit").setAttribute("disabled", "disabled");
            spinner.spin(document.querySelector(".btn-spinner"));
        })
        .success(function(result) { window.location.href = "area.html#" + result.id; })
        .anyway(function() { spinner.stop(); })
        .send();
}

$("#myModal").on("shown.bs.modal", function(e) {

    frames[0].showMap("map", position.longitude, position.latitude)

});

function ok() {
    showLocation({ longitude: frames[0].current.getPosition().lng, latitude: frames[0].current.getPosition().lat});
}

function add() {
    if (!document.querySelector(".subs-list .tr-edit")) {
        var row = document.querySelector(".template .tr-edit").cloneNode(true);
        document.querySelector(".subs-list tbody").appendChild(row);
    }
}


function addSub() {
    var sub = {};
    sub.name = document.querySelector(".td-edit .name").value;
    sub.desc = document.querySelector(".td-edit .desc").value;
    var type = document.querySelector(".td-edit .type").value;
    if ("wall" == type || "area" == type) {
        async()
            .op("POST")
            .url(api_location + "/" + type)
            .data(sub)
            .success(function(newSub) {
                removeRow();
                if ("wall" == type) {
                    if (!data.walls) {
                        data.walls = [];
                    }
                    data.walls.push(newSub);
                } else if ("area" == type) {
                    if (!data.areas) {
                        data.areas = [];
                    }
                    data.areas.push(newSub);
                }

                showSubList();
            })
            .send();
    }
    // TODO handle error type or make type selectable.
}

function removeRow() {
    d3.select(".tr-edit").remove();
}

function removeSub(sub) {
    for (var i = 0; data.walls && i < data.walls.length; ++i) {
        if (data.walls[i].id == sub) {
            data.walls.splice(i, 1);
            break;
        }
    }
    for (var i = 0; data.areas && i < data.areas.length; ++i) {
        if (data.areas[i].id == sub) {
            data.areas.splice(i, 1);
            break;
        }
    }
    showSubList();
}

show();
