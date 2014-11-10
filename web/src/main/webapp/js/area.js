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

    var subs = data.walls ? (data.areas ? data.walls.concat(data.areas) : data.walls) : (data.areas ? data.areas : null);
    if (subs && subs.length > 0) {
        var table = d3.select(".subs-list").append("table")
            .attr("class", "table table-hover table-responsive");
        table.append("thead")
            .append("tr")
            .selectAll("th").data(["Name"])
            .enter()
            .append("th")
            .text(function(d) { return d; });

        var tbody = table.append("tbody");
        var sub = tbody.selectAll("tr").data(subs);
        sub.enter()
            .append("tr")
            .attr("class", "tr-sub")
            .attr("id", function(d) { return d.id; })
            .attr("onclick", function(d) { return "clickSub('" + d.id + "')"; })
            .selectAll("td").data(function(d) { return [d.name]; })
            .enter()
            .append("td")
            .text(function(d) { return d; });
    } else {
        d3.select("#btn-edit-subs").style("display", null);
    }
}

function buildBreadcrumbs(data) {
    var breadcrumb = d3.select(".breadcrumb");

    var leaf = breadcrumb
        .append("li")
        .attr("class", "last")
        .text(data.name);
    var last = leaf;
    var parent = data.parent;
    while (parent) {
        breadcrumb.insert("li", ".last")
            .attr("class", "last")
            .append("a")
            .attr("href", (parent.wid ? "wall.html#" + parent.wid : (parent.aid ? "area.html#" + parent.aid : null)))
            .text(parent.name);
        last.attr("class", null);
        parent = parent.parent;
    }

    breadcrumb
        .insert("li", ".last")
        .append("a")
        .attr("href", "start.html")
        .text("Home");
    leaf.attr("class", "active");
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

function clickSub(id) {
    if (typeOf(id) == "wall") {
        window.open("./wall.html#" + id);
    } else if (typeOf(id) == "area") {
        window.open("./area.html#" + id);
    }
}

show();
