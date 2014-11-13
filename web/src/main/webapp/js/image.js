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
        .attr("src", function(d) { return api_location + "/image/" + d + "?size=0x300"; })
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

    var spinner = new Spinner(spinner_opts.image_loading);
    spinner.spin(div);

    upload(new FormData(document.getElementById("photo")), function(data) {
        spinner.stop();
        document.querySelector(".img-add").style.display = null;
        div.setAttribute("class", "pic col-md-3 img-wrap");
        div.setAttribute("id", data.id);
        var img = document.createElement("img");
        img.setAttribute("src", api_location + "/image/" + data.id + "?size=0x300");
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
    async()
        .op("POST")
        .url(api_location + "/image")
        .data(form)
        .success(function(response) {
            f(response);
            imageIds.push(response.id);
        })
        .send();
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
            var target = event.target || event.srcElement;

            var link = null;
            if (target.src) {
                link = target.parentNode;
            } else if (target.href) {
                link = target;
            }
            if (!link) {
                return;
            }

            options = {index: link, event: event},
            links = this.getElementsByTagName("a");
            blueimp.Gallery(links, options);
        });
}
