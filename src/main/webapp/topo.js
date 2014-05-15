// Find your root SVG element
var svg = document.querySelector('svg');

// Create an SVGPoint for future math
var pt = svg.createSVGPoint();

function click(event) {
    var rout = document.getElementById("rout1");
    var path = rout.querySelector("path");
    var p = cursorPoint(event.clientX, event.clientY);
    path.setAttribute("d", path.getAttribute("d") + "L " + p.x + " " + p.y + " " + " M " + p.x + " " + p.y);
    var point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    point.setAttribute("cx", p.x);
    point.setAttribute("cy", p.y);
    point.setAttribute("r", "4");
    point.setAttribute("stroke", "red");
    point.setAttribute("fill", "red");
    rout.appendChild(point);
}

function cursorPoint(x, y) {
    pt.x = x;
    pt.y = y;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function buildTopo(pic, routes) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("version", "1.1");
    svg.setAttribute("baseProfile", "full");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    svg.setAttribute("xmlns:ev", "http://www.w3.org/2001/xml-events");
    svg.setAttribute("width", pic.width);
    svg.setAttribute("height", pic.height);

    
    return svg;
}
