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
        var pic = d3.select(".pics")
            .selectAll(".pic")
            .data(data["images"]);
        pic.enter()
            .append("div")
            .attr("class", "pic col-md-4")
            .html(function(d) {
                return "<img src=\"../api/image/" + d + "\"  height=\"200\">"
            });
        
    });
}

function parseId(url) {
    var index = url.lastIndexOf("#");
    if (index === -1) {
        return "";
    }
    return index === -1 ? "" : url.substring(index + 1);
}

function addRoute() {
    var wid = document.querySelector('.name').getAttribute('id');
    var url = "addRoute.html?wid=" + wid;
    window.location.href = url;
}
