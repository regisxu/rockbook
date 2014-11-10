var id = parseId(location.href);
var data = {};

function show() {
    var spinner = new Spinner(spinner_opts.page_loading);

    async()
        .op("GET")
        .url(api_location + "/area/" + id)
        .before(function() { spinner.spin(document.querySelector(".tab-content")); })
        .success(showData)
        .anyway(function() { spinner.stop(); })
        .send();
}

function showData(json) {
    data = json;
    buildBreadcrumbs(data);
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
            .attr("href", function(d) { return api_location + "/image/" + d.id + "?size=0x" + screen.height; })
            .attr("target", "_blank")
            .append("img")
            .attr("src", function(d) { return api_location + "/image/" + d.id + "?size=0x400"; })
            .attr("height", 200);

        gallery("gallery")
    }

    var walls = d3.select(".walls-list");
    if (data.walls && data.walls.length > 0) {
        var table = walls.append("table")
            .attr("class", "table table-hover table-responsive");
        table.append("thead")
            .append("tr")
            .selectAll("th").data(["Name"])
            .enter()
            .append("th")
            .text(function(d) { return d; });

        var tbody = table.append("tbody");
        var wall = tbody.selectAll("tr").data(data.walls);
        wall.enter()
            .append("tr")
            .attr("class", "tr-wall")
            .attr("id", function(d) { return d.id; })
            .attr("onclick", function(d) { return "clickWall('" + d.id + "')"; })
            .selectAll("td").data(function(d) { return [d.name]; })
            .enter()
            .append("td")
            .text(function(d) { return d; });
    } else {
        d3.select("#btn-edit-walls").style("display", null);
    }
}

function buildBreadcrumbs(data) {
    var breadcrumb = d3.select(".breadcrumb");
    breadcrumb
        .append("li")
        .append("a")
        .attr("href", "start.html")
        .text("Home");
    breadcrumb
        .append("li")
        .attr("class", "active")
        .text(data.name);
}

function edit() {
    window.location = "editArea.html#" + id;
}

function deleteArea() {
    async()
        .url(api_location + "/area/" + id)
        .op("DELETE")
        .success(function() { window.location.href = "start.html"; })
        .send();
}

function clickWall(wid) {
    window.open("./wall.html#" + rid);
}

function clickArea(aid) {
    window.open("./area.html#" + rid);
}

show();
