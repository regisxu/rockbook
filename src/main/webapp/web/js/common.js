
function async() {

    var rt = {};
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
        return rt;
    }

    var op = function(value) {
        return set("op", value);
    };

    var url = function(value) {
        return set("url", value);
    };

    var data = function(value) {
        return set("data", value);
    };

    var before = function(value) {
        return set("before", value);
    };

    var after = function(value) {
        return set("after", value);
    };

    var success = function(value) {
        return set("success", value);
    };

    var fail = function(value) {
        return set("fail", value);
    };

    var anyway = function(value) {
        return set("anyway", value);
    };

    var send = function() {

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
    };

    rt.op = op;
    rt.url = url;
    rt.data = data;
    rt.before = before;
    rt.after = after;
    rt.success = success;
    rt.fail = fail;
    rt.anyway = anyway;
    rt.send = send;
    return rt;
}
