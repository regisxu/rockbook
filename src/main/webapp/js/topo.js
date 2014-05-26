
function click(event) {
    var rout = document.querySelector(".route");
    var path = rout.querySelector("path");
    var p = cursorPoint(event.clientX, event.clientY);
    path.setAttribute("d", path.getAttribute("d") + " L " + p.x + " " + p.y + " " + " M " + p.x + " " + p.y);
    var point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    point.setAttribute("cx", p.x);
    point.setAttribute("cy", p.y);
    point.setAttribute("r", "4");
    point.setAttribute("stroke", "red");
    point.setAttribute("fill", "red");
    rout.appendChild(point);
}

function cursorPoint(x, y) {
    var pt = document.querySelector("svg").createSVGPoint();
    pt.x = x;
    pt.y = y;
    return pt.matrixTransform(document.querySelector("svg").getScreenCTM().inverse());
}

function buildTopo(query, topo) {
    var pic = topo.pic;
    var routes = topo.routes;

    var svg = d3.select(query)
        .append('svg')
        .attr('width', pic.width)
        .attr('height', pic.height)
        .append("g")
        .attr("id", "canvas");

    svg.append("svg:defs").append("pattern")
        .attr("id", pic.id)
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", pic.width)
        .attr("height", pic.height)
        .append("svg:image")
        .attr("xlink:href", "../api/image/" + pic.id)
        .attr("x", "0")
        .attr("y", "0")
        .attr("width", pic.width)
        .attr("height", pic.height);

    svg.append("svg:rect")
        .attr("fill", "url(#" + pic.id + ")")
        .attr("x", "0")
        .attr("y", "0")
        .attr("width", pic.width)
        .attr("height", pic.height)
        .attr("onclick", "click(evt)");

    for (var i = 0; i < routes.length; ++i) {

        var route = svg.append("g")
            .attr("id", routes[i].id)
            .attr("class", "route")
            .attr("onclick", "open(evt)")
            .attr("onmouseover", "highlight(evt.currentTarget.id)")
            .attr("onmouseout", "unhighlight(evt.currentTarget.id)");

        
        route.selectAll("circle").data(routes[i].bolts).enter().append("svg:circle")
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("r", "4")
            .attr("stroke", "red")
            .attr("fill", "red");

        route.append("svg:path")
            .attr("stroke", "red")
            .attr("stroke-width", "2")
            .attr("d", calculatePath(routes[i].bolts));

    }

    return svg;
}

function highlight(route) {
    d3.selectAll("#" + route + " path").attr("stroke", "yellow");
}

function unhighlight(route) {
    d3.selectAll("#" + route + " path").attr("stroke", "red");
}

function removeTopo(route) {
    d3.select("#" + route).remove();
}

function calculatePath(bolts) {
    var path = "";
    for (var i = 0; i < bolts.length; ++i) {
        if (i == 0) {
            path += "M " + bolts[i].x + " " + bolts[i].y;
        }
        path += " L " + bolts[i].x + " " + bolts[i].y + " M " + bolts[i].x + " " + bolts[i].y;
    }
    return path;
}
