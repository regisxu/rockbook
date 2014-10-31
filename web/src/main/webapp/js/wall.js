var id = parseId(location.href);
var data = {};
var topo = null;

function show() {
    var spinner = new Spinner(spinner_opts.page_loading);

    async()
        .op("GET")
        .url("/api/wall/" + id)
        .before(function() { spinner.spin(document.querySelector(".tab-content")); })
        .success(showData)
        .anyway(function() { spinner.stop(); })
        .send();
}

function showData(json) {
    data = json;
    document.querySelector("title").textContent = data["name"];
    var title = document.querySelector(".name")
    title.textContent = data["name"];
    title.setAttribute("id", id);
    document.getElementById("desc").textContent = data.desc;
    if (data.location) {
        showMapImage("#location", data.location, data.name);
    }

    if (data.images) {
        var pic = d3.select(".pics")
            .selectAll(".pic")
            .data(data.images);
        pic.enter()
            .append("div")
            .attr("class", "pic col-md-4")
            .append("a")
            .attr("href", function(d) { return "../api/image/" + d.id + "?size=0x" + screen.height; })
            .attr("target", "_blank")
            .append("img")
            .attr("src", function(d) { return "../api/image/" + d.id + "?size=0x400"; })
            .attr("height", 200);

        gallery("gallery")
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
    if (data.routes && data.routes.length > 0) {
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
        d3.select("#btn-edit-routes").style("display", null);
    }
}

function edit() {
    window.location = "editWall.html#" + id;
}

function editRoutes() {
    window.location = "editRoutesOnWall.html#" + id;
}

function deleteWall() {
    async()
        .url("/api/wall/" + id)
        .op("DELETE")
        .success(function() { window.location.href = "/web/start.html"; })
        .send();
}

function clickRoute(rid) {
    window.open("./route.html#" + rid);
}

show();
