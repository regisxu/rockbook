var data = {};

function search(kw) {

    var query = buildQuery(kw);
    console.log(query);

    var url = buildUrl(query);

    d3.json(url, function(error, json) {
	    if (error) {
            return console.warn(error);
        }
        data = json;
        show("list", data);
    });
}

function buildQuery(kw) {
    var terms = kw.trim().split(" ");
    var query = {};
    for (var i = 0; i < terms.length; ++i) {
        var ws = terms[i].split(":");
        if (ws.length === 2) {
            query[ws[0]] = ws[1];
        }
    }
    return query;
}

function buildUrl(query) {
    var url = "/api/search?";
    for (var k in query) {
        url += k + "=" + query[k] + "&"
    }
    return url;
}

