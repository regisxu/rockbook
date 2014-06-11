var id = parseId(location.href);
var data = {};
var topo = null;

function show() {
    d3.json("/api/wall/" + id, function(error, json) {
	    if (error) {
            return console.warn(error);
        }

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
        }

        showRouteList();
    });
}

function showRouteList() {
    var routes = d3.select(".routes-list");

    if (data.routes) {
        routes.select(".no-route").style("display", "none");

        var route = d3.select(".routes-list tbody").selectAll("tr").data(data.routes, function(d) { return d.id; });
        route.enter()
            .append(function() { return document.querySelector(".template .tr-route").cloneNode(true); })
            .attr("id", function(d) { return d.id; })
            .selectAll(".td-route").data(function(d) { return [d.name, d.level, d.length, d.bolts, "__button__"]; })
            .text(function(d) { return d; });

        route.exit().remove();

    } else {
        routes.select(".no-route").style("display", null);
    }
}

function submit() {
    console.log("submit");
    var form = document.getElementById("wall");

    var request = new XMLHttpRequest();
    request.open("PUT", "/api/wall", true);
    request.setRequestHeader("Content-Type", "application/json");
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

    var form = document.getElementById("wall");

    var request = new XMLHttpRequest();
    request.open("PUT", "/api/topo/" + t.id, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.onload = function(event) {
        if (request.status == 200) {
            console.log("Success!");
        } else {
            console.log("error code: ", request.status);
        }
    };

    request.send(JSON.stringify(t));
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
    var request = new XMLHttpRequest();
    request.open("POST", "/api/route", true);
    request.setRequestHeader("Content-Type", "application/json");
    var route = {};
    route.name = document.querySelector(".td-edit .name").value;
    route.level = document.querySelector(".td-edit .level").value;
    route.length = document.querySelector(".td-edit .length").value;
    route.bolts = document.querySelector(".td-edit .bolts").value;


    request.onload = function(event) {
        if (request.status == 200) {
            console.log("Success!");
            removeRow();
            var newRoute = JSON.parse(request.responseText);
            if (!data.routes) {
                data.routes = [];
            }
            data.routes.push(newRoute);
            showRouteList();
        } else {
            console.log("error code: ", request.status);
        }
    };

    request.send(JSON.stringify(route));

}

function removeRow() {
    d3.select(".tr-edit").remove();
}

function parseId(url) {
    var index = url.lastIndexOf("#");
    if (index === -1) {
        return "";
    }
    return index === -1 ? "" : url.substring(index + 1);
}
