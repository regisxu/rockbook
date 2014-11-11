var id = parseId(location.href);
var data = {};
var topo = null;

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
    title.textContent = data["name"];
    title.setAttribute("id", id);

    showSubList();
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

function submit() {
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
    for (var i = 0; i < data.walls && data.walls.length; ++i) {
        if (data.walls[i].id == sub) {
            data.walls.splice(i, 1);
            break;
        }
    }
    for (var i = 0; i < data.areas && data.areas.length; ++i) {
        if (data.areas[i].id == sub) {
            data.areas.splice(i, 1);
            break;
        }
    }
    showSubList();
}

show();
