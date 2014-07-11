
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

    var op = function(value) {
        set("op", value);
    };

    var url = function(value) {
        set("url", value);
    };

    var data = function(value) {
        set("data", value);
    };

    var before = function(value) {
        set("before", value);
    };

    var after = function(value) {
        set("after", value);
    };

    var success = function(value) {
        set("success", value);
    };

    var fail = function(value) {
        set("fail", value);
    };

    var anyway = function(value) {
        set("anyway", value);
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

    return chain({
        op : op,
        url : url,
        data : data,
        before : before,
        after : after,
        success : success,
        fail : fail,
        anyway : anyway,
        send : send
    }, ["op", "url", "data", "before", "after", "success", "fail", "anyway"]);
}

function chain(obj, fnames) {
    for (var i = 0; i < fnames.length; ++i) {
        obj[fnames[i]] = _chain(obj[fnames[i]], obj);
    }
    return obj;
}

function _chain(f, rt) {
    return function() {
        f.apply(this, arguments);
        return rt;
    };
}
