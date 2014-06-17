var imageIds = [];

function showImages(ids) {
    imageIds = ids;
    var pic = d3.select(".images")
        .selectAll(".image")
        .data(imageIds);
    var div = pic.enter()
        .insert("div", ".img-add")
        .attr("class", "pic col-md-3 img-wrap")
        .attr("id", function(d) { return d; });
    div.append("img")
        .attr("src", function(d) { return "../api/image/" + d + "?size=0x300"; })
        .attr("height", "200");

    div.append("div")
        .attr("class", "img-overlay")
        .append("span").append("a")
        .attr("class", "x-close")
        .attr("href", function(d) { return "javascript:removeImage('" + d + "')"; })
        .text("x");

}

function addPhoto(input) {
    upload(new FormData(document.getElementById("photo")));
}


function upload(form) {
    var request = new XMLHttpRequest();
    request.open("POST", "/api/image", true);
    request.onload = function(event) {
        if (request.status == 200) {
            console.log("Success!");
            var images = document.querySelector(".images");
            var div = document.createElement("div");
            var data = JSON.parse(request.responseText);
            div.setAttribute("class", "pic col-md-3 img-wrap");
            div.setAttribute("id", data.id);
            var img = document.createElement("img");
            img.setAttribute("src", "../api/image/" + data.id);
            img.setAttribute("height", "200");
            img.setAttribute("width", "200");
            div.appendChild(img);
            var overlay = document.createElement("div");
            overlay.setAttribute("class", "img-overlay");
            overlay.innerHTML = "<span><a class=\"x-close\" href=\"javascript:removeImage('" + data.id + "')\">x</a></span>";
            div.appendChild(overlay);
            images.insertBefore(div, document.querySelector(".img-add"));
            imageIds.push(data.id);
        } else {
            console.log("error code: ", request.status);
        }
    };

    request.send(form);
}

function removeImage(id) {
    var img = document.getElementById(id);
    img.parentNode.removeChild(img);
    var index = imageIds.indexOf(id);
    if (index != -1) {
        imageIds.splice(index, 1);
    }
}
