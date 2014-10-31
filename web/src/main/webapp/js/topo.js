function Topo(data) {

    var calculatePath = function(bolts) {
        var path = "";
        for (var i = 0; i < bolts.length; ++i) {
            if (i == 0) {
                path += "M " + bolts[i].x + " " + bolts[i].y;
            }
            path += " L " + bolts[i].x + " " + bolts[i].y + " M " + bolts[i].x + " " + bolts[i].y;
        }
        return path;
    };

    var current = null;

    var canvas = (function() {
        var pic = data.pic;
        var routes = data.routes;

        var canvas = d3.select(".topo")
            .append("svg")
            .attr("width", pic.width)
            .attr("height", pic.height)
            .append("g")
            .attr("id", "canvas");

        canvas.append("svg:defs").append("pattern")
            .attr("id", pic.id)
            .attr("patternUnits", "userSpaceOnUse")
            .attr("width", pic.width)
            .attr("height", pic.height)
            .append("svg:image")
            .attr("xlink:href", api_location + "/image/" + pic.id)
            .attr("x", "0")
            .attr("y", "0")
            .attr("width", pic.width)
            .attr("height", pic.height);

        canvas.append("svg:rect")
            .attr("fill", "url(#" + pic.id + ")")
            .attr("x", "0")
            .attr("y", "0")
            .attr("width", pic.width)
            .attr("height", pic.height)
            .attr("onclick", "topo.click(evt)");

        return canvas;
    })();

    var refresh = function() {
        if (!data.routes || data.routes.length == 0) {
            return;
        }
        var route = canvas.selectAll("g").data(data.routes);
        route.enter()
            .append("g")
            .attr("id", function(d) { return d.id; })
            .attr("class", "route")
            .attr("onclick", "topo.select(evt.currentTarget.id)")
            .attr("onmouseover", "topo.highlight(evt.currentTarget.id)")
            .attr("onmouseout", "topo.unhighlight(evt.currentTarget.id)");

        route.selectAll("circle").data(function(d) { return d.bolts; })
            .enter()
            .append("svg:circle")
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("r", "4")
            .attr("stroke", "red")
            .attr("fill", "red");

        route.append("svg:path")
            .attr("stroke", "red")
            .attr("stroke-width", "2")
            .attr("d", function(d) { return calculatePath(d.bolts); });

        route.exit().remove();

        route.selectAll("circle").data(function(d) { return d.bolts; })
            .exit().remove();
    };

    refresh();

    var cursorPoint = function(x, y) {
        var pt = document.querySelector(".topo svg").createSVGPoint();
        pt.x = x;
        pt.y = y;
        var transform = canvas.attr("transform");
        var start = transform.search(/scale\(.*\)/) + 6;
        var end = transform.indexOf(")", start);
        var scale = parseFloat(transform.substring(start, end));

        var rt = pt.matrixTransform(document.querySelector("svg").getScreenCTM().inverse());
        rt.x /= scale;
        rt.y /= scale;
        return { x : rt.x, y : rt.y};
    };

    var click = function(event) {
        if (!current) {
            return;
        }

        var p = cursorPoint(event.clientX, event.clientY);
        current.bolts.push(p);

        var route = canvas.select("#" + current.route);
        if (route.empty()) {
            route = canvas.append("g");
            route.attr("id", current.route)
                .attr("class", "route")
                .attr("onclick", "topo.select(evt.currentTarget.id)")
                .attr("onmouseover", "topo.highlight(evt.currentTarget.id)")
                .attr("onmouseout", "topo.unhighlight(evt.currentTarget.id)");
            route.append("svg:path")
                .attr("stroke", "red")
                .attr("stroke-width", "2")
                .attr("d", function(d) { return "M " + p.x + " " + p.y;; });
        } else {
            var path = canvas.select("#" + current.route + " path");
            path.attr("d", path.attr("d") + " L " + p.x + " " + p.y + " " + " M " + p.x + " " + p.y);
        }

        route.append("svg:circle")
            .attr("cx", p.x)
            .attr("cy", p.y)
            .attr("r", "4")
            .attr("stroke", "red")
            .attr("fill", "red");
    };

    var finish = function() {
        if (!current) {
            return;
        }
        if (!data.routes) {
            data.routes = [];
        }

        var found = false;
        for (var i = 0; i < data.routes.length; ++i) {
            if (data.routes[i].id == current.route) {
                for (var j = 0; j < current.bolts.length; ++j) {
                    data.routes[i].bolts.push(current.bolts[j]);
                }
                found = true;
            }
        }
        if (!found) {
            var route = {};
            route.id = current.route;
            route.bolts = current.bolts;
            data.routes.push(route);
        }
        current = null;
    }

    var highlight = function(route) {
        canvas.selectAll("#" + route + " path").attr("stroke", "yellow");
    };

    var unhighlight = function(route) {
        if (current && current.route == route) {
            return;
        }
        canvas.selectAll("#" + route + " path").attr("stroke", "red");
    };

    var remove = function(route) {
        canvas.select("#" + route).remove();
    };

    var select = function(route) {
        highlight(route);
    };

    var edit = function(route) {
        current = {};
        current.route = route;
        current.bolts = [];
        highlight(route);
    }

    var svg = document.querySelector(".topo svg");

    return {
        svg : svg,
        click : click,
        highlight : highlight,
        unhighlight : unhighlight,
        remove : remove,
        select : select,
        edit : edit,
        finish : finish
    };
}
