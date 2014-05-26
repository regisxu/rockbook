var id = parseId(location.href);
var data = {};

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
            topo.build(data.topo);
            var svg = document.querySelector(".topo svg");
            var height = svg.getAttribute("height");
            var scale = 300 / height;
            svg.setAttribute("height", height * scale);
            svg.querySelector("#canvas").setAttribute("transform", "scale(" + scale + ")");
        }

        var routes = d3.select(".routes-list");
        if (data.routes) {
            var table = routes.append("table")
                .attr("class", "table table-hover table-responsive");
            table.append("thead")
                .append("tr")
                .selectAll("th").data(["Name", "Level", "Length", "Bolts", ""])
                .enter()
                .append("th")
                .html(function(d) {
                    if (d == "") {
                        return "<span class='glyphicon glyphicon-plus' onclick='javascript:add()'></span>";
                    } else {
                        return d;
                    }
                });

            var tbody = table.append("tbody");
            var route = tbody.selectAll("tr").data(data.routes);
            route.enter()
                .append("tr")
                .attr("class", "tr-route")
                .attr("id", function(d) { return d.id; })
                .attr("onmouseover", function(d) { return "topo.highlight('" + d.id + "')"; })
                .attr("onmouseout", function(d) { return "topo.unhighlight('" + d.id + "')"; })
                .selectAll("td").data(function(d) { return [d.name, d.level, d.length, d.bolts, "__button__"]; })
                .enter()
                .append("td")
                .html(function(d) {
                    if (d == "__button__") {
                        return "<span class='glyphicon glyphicon-pencil' onclick='javascript:draw(this.parentNode.parentNode.id)'></span> "
                            + " <span class='glyphicon glyphicon-remove' onclick='javascript:removeRoute(this.parentNode.parentNode.id)'></span>";
                    } else {
                        return d;
                    }
                });

        } else {
            routes.append("div")
                .attr("class", "alert alert-warning")
                .text("There is no routes info for this wall.");
        }
    });
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
    console.log(route);
}

function removeRoute(route) {
    var routes = data.routes;
    for (var i = 0; i < routes.length; ++i) {
        if (routes[i].id == route) {
            routes.splice(i, 1);
            break;
        }
    }
    d3.selectAll(".routes-list tbody tr").data(data.routes, function(d) { return d.id; }).exit().remove();

    var routes = data.topo.routes;
    for (var i = 0; i < routes.length; ++i) {
        if (routes[i].id == route) {
            routes.splice(i, 1);
            topo.remove(route);
            break;
        }
    }
}

function edit() {
    window.location = "editWall.html#" + id;
}

function parseId(url) {
    var index = url.lastIndexOf("#");
    if (index === -1) {
        return "";
    }
    return index === -1 ? "" : url.substring(index + 1);
}
