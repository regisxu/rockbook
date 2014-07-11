
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
                request.setRequestHeader("Content-Type", "application/json");
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
                request.send(JSON.stringify(data));
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
