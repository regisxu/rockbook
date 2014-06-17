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
        document.getElementById("desc").textContent = data.desc;
        if (data.location) {
            var url = "http://api.map.baidu.com/staticimage?center=" + data.location.longitude + "," + data.location.latitude + "&width=300&height=200&zoom=13"
            document.getElementById("location").innerHTML = "<img src=\"" + url + "\" height=\"150\" width=\"200\">";
        }

        if (data.images) {
        var pic = d3.select(".pics")
            .selectAll(".pic")
            .data(data.images);
        pic.enter()
            .append("div")
            .attr("class", "pic col-md-4")
            .append("a")
            .attr("href", function(d) { return "../api/image/" + d.id; })
            .attr("target", "_blank")
            .append("img")
            .attr("src", function(d) { return "../api/image/" + d.id + "?size=0x400"; })
            .attr("height", 200);
        }

        if (data.topo) {
            topo = new Topo(data.topo);
            var svg = topo.svg;
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
                .selectAll("th").data(["Name", "Level", "Length", "Bolts"])
                .enter()
                .append("th")
                .text(function(d) { return d; });

            var tbody = table.append("tbody");
            var route = tbody.selectAll("tr").data(data.routes);
            route.enter()
                .append("tr")
                .attr("class", "tr-route")
                .attr("id", function(d) { return d.id; })
                .attr("onclick", function(d) { return "clickRoute('" + d.id + "')"; })
                .attr("onmouseover", function(d) { return "topo.highlight('" + d.id + "')"; })
                .attr("onmouseout", function(d) { return "topo.unhighlight('" + d.id + "')"; })
                .selectAll("td").data(function(d) { return [d.name, d.level, d.length, d.bolts]; })
                .enter()
                .append("td")
                .text(function(d) { return d; });
        } else {
            routes.append("div")
                .attr("class", "alert alert-warning")
                .text("There is no routes info for this wall.");
        }
    });
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
