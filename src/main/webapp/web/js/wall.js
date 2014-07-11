var id = parseId(location.href);
var data = {};
var topo = null;

function show() {
    var opts = {
        lines: 10, // The number of lines to draw
        length: 10, // The length of each line
        width: 5, // The line thickness
        radius: 15, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#000', // #rgb or #rrggbb or array of colors
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: '50%', // Top position relative to parent
        left: '50%' // Left position relative to parent
    };
    var spinner = new Spinner(opts);

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

function parseId(url) {
    var index = url.lastIndexOf("#");
    if (index === -1) {
        return "";
    }
    return index === -1 ? "" : url.substring(index + 1);
}
