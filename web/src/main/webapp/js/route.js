var id = parseId(location.href);
var data = {};

function show() {
    var spinner = new Spinner(spinner_opts.page_loading);
    async()
        .op("GET")
        .url(api_location + "/route/" + id)
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
    document.getElementById("level").textContent = data.level;
    document.getElementById("length").textContent = data.length;
    document.getElementById("bolts").textContent = data.bolts;
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

        gallery("gallery");
    }
}

function edit() {
    window.location = "editRoute.html#" + id;
}

function deleteRoute() {
    async()
        .url(api_location + "/route/" + id)
        .op("DELETE")
        .success(function() { window.location.href = "start.html"; })
        .send();
}

show();
