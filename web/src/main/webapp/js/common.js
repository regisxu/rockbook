var spinner_opts = {
    page_loading : {
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
    },

    image_loading : {
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
    },

    submit : {
        lines: 10, // The number of lines to draw
        length: 8, // The length of each line
        width: 3, // The line thickness
        radius: 8, // The radius of the inner circle
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
    }
};

function async() {

    var empty = function(params) {};
    var config = {
        "op" : null,
        "url" : null,
        "data" : null,
        "before" : empty,
        "after" : empty,
        "success" : empty,
        "fail" : empty,
        "anyway" : empty
    };

    var set = function(name, value) {
        config[name] = value;
    }

    return chain({
        op : function(value) {
            set("op", value);
        },

        url : function(value) {
            set("url", value);
        },

        data : function(value) {
            set("data", value);
        },

        before : function(value) {
            set("before", value);
        },

        after : function(value) {
            set("after", value);
        },

        success : function(value) {
            set("success", value);
        },

        fail : function(value) {
            set("fail", value);
        },

        anyway : function(value) {
            set("anyway", value);
        },

        send : function() {

            var request = new XMLHttpRequest();
            request.open(config.op, config.url, true);
            if ("PUT" == config.op || "POST" == config.op) {
                if (!(config.data instanceof FormData)) {
                    request.setRequestHeader("Content-Type", "application/json");
                }
            } else if ("GET" == config.op) {
                request.setRequestHeader("Accept-Type", "application/json");
            }
            request.onload = function(event) {
                if (request.status == 200) {
                    console.log("Success!");
                    var result = request.responseText ? JSON.parse(request.responseText) : null;
                    config.success(result);
                } else {
                    console.log("error code: ", request.status);
                    config.fail(event);
                }
                config.anyway();
            };

            config.before();
            if ("PUT" == config.op || "POST" == config.op) {
                if (config.data instanceof FormData) {
                    request.send(config.data);
                } else {
                    request.send(JSON.stringify(config.data));
                }
            } else if ("GET" == config.op || "DELETE" == config.op) {
                request.send();
            }
            config.after();
        }
    });
}

function chain(obj, fnames) {
    if (!fnames) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                obj[key] = _chain(obj[key], obj);
            }
        }
    } else {
        for (var i = 0; i < fnames.length; ++i) {
            obj[fnames[i]] = _chain(obj[fnames[i]], obj);
        }
    }
    return obj;
}

function _chain(f, rt) {
    return function() {
        f.apply(this, arguments);
        return rt;
    };
}

function parseId(url) {
    var index = url.lastIndexOf("#");
    if (index === -1) {
        return "";
    }
    return index === -1 ? "" : url.substring(index + 1);
}

function showMapImage(selector, location, desc) {
    if (location.longitude && location.latitude) {
        var url = "http://api.map.baidu.com/staticimage?center=" + location.longitude + "," + location.latitude + "&width=300&height=200&zoom=13" + "&markers=" + location.longitude + "," + location.latitude;
        d3.select(selector)
            .append("a")
            .attr("target", "_blank")
            .attr("href", "http://api.map.baidu.com/marker?location=" + location.latitude + "," + location.longitude + "&title=location" + "&content=" + encodeURIComponent(desc) + "&output=html&src=map")
            .append("img")
            .attr("src", url)
            .attr("height", "150")
            .attr("width", "200");
    }
}
