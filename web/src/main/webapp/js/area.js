var id = parseId(location.href);
var data = {};

function show() {
    var spinner = new Spinner(spinner_opts.page_loading);

    async()
        .op("GET")
        .url(api_location + "/area/" + id)
        .before(function() { spinner.spin(document.querySelector(".detail")); })
        .success(showData)
        .anyway(function() { spinner.stop(); })
        .send();
}

function showData(json) {
    data = json;
    buildBreadcrumb(data);
    document.querySelector("title").textContent = data["name"];
    var title = document.querySelector(".name")
    title.textContent = data["name"];
    title.setAttribute("id", id);
    document.getElementById("desc").textContent = data.desc;
    if (data.location) {
        showMapImage("#location", data.location, data.name);
    }

    if (data.images && data.images.length > 0) {
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
    } else {
        d3.select("#gallery-container").style("display", "none");
    }

    var subs = data.walls ? (data.areas ? data.walls.concat(data.areas) : data.walls) : (data.areas ? data.areas : null);
    if (subs && subs.length > 0) {
        var table = d3.select(".subs-list").append("table")
            .attr("class", "table table-hover table-responsive");
        table.append("thead")
            .append("tr")
            .selectAll("th").data(["Name", "Type", "Description"])
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
            .selectAll("td").data(function(d) { return [d.name, typeOf(d.id), d.desc]; })
            .enter()
            .append("td")
            .text(function(d) { return d; });
    } else {
        d3.select(".subs").style("display", "none");
    }
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
