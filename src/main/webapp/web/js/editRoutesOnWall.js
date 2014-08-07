var id = parseId(location.href);
var data = {};
var topo = null;

function show() {
    async()
        .op("GET")
        .url("/api/wall/" + id)
        .success(showData)
        .send();
}

function showData(json) {
    data = json;
    var title = document.querySelector(".name")
    title.textContent = data["name"];
    title.setAttribute("id", id);

    if (data.topo) {
        topo = new Topo(data.topo);
        var svg = topo.svg;
        var height = svg.getAttribute("height");
        var scale = 300 / height;
        svg.setAttribute("height", height * scale);
        svg.querySelector("#canvas").setAttribute("transform", "scale(" + scale + ")");
    } else {
        d3.select("#topo-add").style("display", null);
    }

    showRouteList();
}

function addTopoPhoto(input) {
    d3.select(".img-add").style("display", "none");
    var sd = d3.select("#spinner").style("display", null);
    var spinner = new Spinner(spinner_opts.image_loading);
    spinner.spin(sd.node());

    upload(new FormData(document.getElementById("photo")), function(d) {
        d3.select("#spinner").style("display", "none");
        spinner.stop();

        data.topo = {};
        data.topo.pic = {};
        data.topo.pic.id = d.id;
        data.topo.pic.height = d.height;
        data.topo.pic.width = d.width;
        topo = new Topo(data.topo);
        var svg = topo.svg;
        var height = svg.getAttribute("height");
        var scale = 300 / height;
        svg.setAttribute("height", height * scale);
        svg.querySelector("#canvas").setAttribute("transform", "scale(" + scale + ")");
    });
}

function showRouteList() {
    var routes = d3.select(".routes-list");

    if (data.routes) {

        var route = d3.select(".routes-list tbody").selectAll("tr").data(data.routes, function(d) { return d.id; });
        route.enter()
            .append(function() { return document.querySelector(".template .tr-route").cloneNode(true); })
            .attr("id", function(d) { return d.id; })
            .selectAll(".td-route").data(function(d) { return [d.name, d.level, d.length, d.bolts, "__button__"]; })
            .text(function(d) { return d; });

        route.exit().remove();

    }
}

function submit() {
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

function draw(route) {
    d3.select("#" + route + " .glyphicon-pencil").style("display", "none");
    d3.select("#" + route + " .glyphicon-ok").style("display", null);
    topo.edit(route);
}

function done(route) {
    d3.select("#" + route + " .glyphicon-ok").style("display", "none");
    d3.select("#" + route + " .glyphicon-pencil").style("display", null);
    topo.finish();

    var t = {};
    t.pid = data.topo.pic.id;
    t.height = data.topo.pic.height;
    t.width = data.topo.pic.width;
    t.rid = route;
    for (var i = 0; i < data.topo.routes.length; ++i) {
        if (data.topo.routes[i].id == route) {
            t.id = data.topo.routes[i].tid;
            t.bolts = data.topo.routes[i].bolts;
        }
    }

    async()
        .op(t.id ? "PUT" : "POST")
        .url("/api/topo/" + (t.id ? t.id : ""))
        .data(t)
        .success(function(response) {
            for (var i = 0; i < data.topo.routes.length; ++i) {
                if (data.topo.routes[i].id == route) {
                    data.topo.routes[i].tid = response.id
                }
            }
        })
        .send();
}

function removeRoute(route) {
    for (var i = 0; i < data.routes.length; ++i) {
        if (data.routes[i].id == route) {
            data.routes.splice(i, 1);
            break;
        }
    }
    showRouteList();

    if (data.topo) {
        var routes = data.topo.routes;
        for (var i = 0; i < routes.length; ++i) {
            if (routes[i].id == route) {
                routes.splice(i, 1);
                topo.remove(route);
                break;
            }
        }
    }
}

function edit() {
    window.location = "editWall.html#" + id;
}

function add() {
    if (!document.querySelector(".routes-list .tr-edit")) {
        var row = document.querySelector(".template .tr-edit").cloneNode(true);
        document.querySelector(".routes-list tbody").appendChild(row);
    }
}

function addRoute() {
    var route = {};
    route.name = document.querySelector(".td-edit .name").value;
    route.level = document.querySelector(".td-edit .level").value;
    route.length = document.querySelector(".td-edit .length").value;
    route.bolts = document.querySelector(".td-edit .bolts").value;

    async()
        .op("POST")
        .url("/api/route")
        .data(route)
        .success(function(newRoute) {
            if (!data.routes) {
                data.routes = [];
            }
            data.routes.push(newRoute);
            showRouteList();
        })
        .send();
}

function removeRow() {
    d3.select(".tr-edit").remove();
}

show();
