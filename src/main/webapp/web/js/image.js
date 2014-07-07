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

    document.querySelector(".img-add").style.display = "none";
    var images = document.querySelector(".images");
    var div = document.createElement("div");
    div.setAttribute("class", "pic col-md-3 img-wrap");
    images.insertBefore(div, document.querySelector(".img-add"));

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
    spinner.spin(div);

    upload(new FormData(document.getElementById("photo")), function(data) {
        spinner.stop();
        document.querySelector(".img-add").style.display = null;
        div.setAttribute("class", "pic col-md-3 img-wrap");
        div.setAttribute("id", data.id);
        var img = document.createElement("img");
        img.setAttribute("src", "../api/image/" + data.id + "?size=0x300");
        img.setAttribute("height", "200");
        div.appendChild(img);
        var overlay = document.createElement("div");
        overlay.setAttribute("class", "img-overlay");
        overlay.innerHTML = "<span><a class=\"x-close\" href=\"javascript:removeImage('" + data.id + "')\">x</a></span>";
        div.appendChild(overlay);
        images.insertBefore(div, document.querySelector(".img-add"));
    });
}

function addOnePhoto(input) {
    addPhoto(input);
    d3.select(".img-add").style("display", "none");
}

function upload(form, f) {
    var request = new XMLHttpRequest();
    request.open("POST", "/api/image", true);
    request.onload = function(event) {
        if (request.status == 200) {
            console.log("Success!");
            var data = JSON.parse(request.responseText);
            f(data);
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

    if (!imageIds || imageIds.length == 0) {
        d3.select(".img-add").style("display", null);
    }
}

function gallery(id) {

    var control = d3.select("body")
        .append("div")
        .attr("id", "blueimp-gallery")
        .attr("class", "blueimp-gallery blueimp-gallery-controls");

    control.append("div").attr("class", "slides");
    control.append("h3").attr("class", "title");
    control.append("a").attr("class", "prev").text("\u2039");
    control.append("a").attr("class", "next").text("\u203a");
    control.append("a").attr("class", "close").text("\u00d7");
    control.append("a").attr("class", "play-pause");
    control.append("ol").attr("class", "indicator");

    d3.select("#" + id)
        .on("click", function (d) {
            event = d3.event || window.event;
            var target = event.target || event.srcElement,
            link = target.src ? target.parentNode : target,
            options = {index: link, event: event},
            links = this.getElementsByTagName("a");
            blueimp.Gallery(links, options);
        });
}
