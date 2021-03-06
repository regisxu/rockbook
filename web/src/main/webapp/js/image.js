
function Images(data, selector) {
    var addTemplate = "<form action='#'>\
                         <img class='img-thumbnail' onclick='this.parentNode.querySelector(\"input\").click()' style='width: 200px; height: 200px;' src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0ic2lsdmVyIi8+PHRleHQgdGV4dC1hbmNob3I9Im1pZGRsZSIgeD0iMTAwIiB5PSIxMDAiIHN0eWxlPSJmaWxsOmdyYXk7Zm9udC13ZWlnaHQ6Ym9sZDtmb250LXNpemU6ODBweDtmb250LWZhbWlseTpBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZjtkb21pbmFudC1iYXNlbGluZTpjZW50cmFsIj4rPC90ZXh0Pjwvc3ZnPg=='>\
                         <input type='file' name='file' style='display:none'/>\
                       </form>";

    var ids = data ? data : [];
    var root = d3.select(selector);

    var adder = (function() {
        var obj = root.append("div")
            .attr("class", "col-md-3 img-add")
            .html(addTemplate);

        var display = function(flag) {
            obj.style("display", flag ? null : "none");
        };

        var onchange = function() {
            loading.display(true);
            obj.style("display", "none");

            upload(function(data) {
                loading.display(false);
                obj.style("display", null);
                add(data.id);
            });
        };


        var rt = {
            display : display,
            onchange : onchange
        };

        obj.select("input").on("change", function() { rt.onchange(); });

        return rt;

    })();

    var loading = (function() {
        var obj = root.append("div")
            .attr("class", "img-load col-md-3 img-wrap")
            .style("display", "none");
        var spinner = new Spinner(spinner_opts.image_loading);

        var display = function(flag) {
            if (flag) {
                obj.style("display", null);
                spinner.spin(obj.node());
            } else {
                obj.style("display", "none");
                spinner.stop();
            }
        };

        return {
            display : display
        };
    })();

    var show = function() {

        var pic = root.selectAll(".image").data(ids, function(d) { return d; });
        var div = pic.enter()
            .insert("div", ".img-add")
            .attr("class", "image col-md-3 img-wrap")
            .attr("id", function(d) { return d; });
        div.append("img")
            .attr("src", function(d) { return api_location + "/image/" + d + "?size=0x300"; })
            .attr("height", "200");

        div.append("div")
            .attr("class", "img-overlay")
            .append("span").append("a")
            .attr("class", "x-close")
            .text("x")
            .on("click", function(d) { return remove(d); });

        pic.exit().remove();

    };

    var upload = function (f) {
        async()
            .op("POST")
            .url(api_location + "/image")
            .data(new FormData(root.select("form").node()))
            .success(function(response) {
                f(response);
            })
            .send();
    };

    var add = function(id) {
        ids.push(id);
        show();
    };

    var remove = function(id) {
        var index = ids.indexOf(id);
        if (index != -1) {
            ids.splice(index, 1);
        }

        show();
    };

    var result = {
        ids : ids,
        show : show,
        add : add,
        remove : remove,
        upload : upload,
        adder : adder,
        loading : loading
    };
    document.querySelector(selector).__images__ = result;
    return result;
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
