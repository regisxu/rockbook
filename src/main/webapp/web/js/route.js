var id = parseId(location.href);
var data = {};

function show() {
    d3.json("/api/route/" + id, function(error, json) {
	    if (error) {
            return console.warn(error);
        }

        data = json;
        var title = document.querySelector(".name")
        title.textContent = data["name"];
        title.setAttribute("id", id);
        document.getElementById("desc").textContent = data.desc;
        document.getElementById("level").textContent = data.level;
        document.getElementById("length").textContent = data.length;
        document.getElementById("bolts").textContent = data.bolts;
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
            .html(function(d) {
                return "<img src=\"../api/image/" + d.id + "?size=0x400" + "\"  height=\"200\" >"
            });            
        }

    });
}

function edit() {
    window.location = "editRoute.html#" + id;
}

function parseId(url) {
    var index = url.lastIndexOf("#");
    if (index === -1) {
        return "";
    }
    return index === -1 ? "" : url.substring(index + 1);
}
