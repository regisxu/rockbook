
var emptyImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0ic2lsdmVyIi8+PHRleHQgdGV4dC1hbmNob3I9Im1pZGRsZSIgeD0iMTAwIiB5PSIxMDAiIHN0eWxlPSJmaWxsOmdyYXk7Zm9udC13ZWlnaHQ6Ym9sZDtmb250LXNpemU6MTVweDtmb250LWZhbWlseTpBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZjtkb21pbmFudC1iYXNlbGluZTpjZW50cmFsIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=";

function show(id, data) {
    var list = document.querySelector("#" + id);
    list.innerHTML = "";
    var res = document.getElementById("sbtn").textContent.toLowerCase().trim();
    if (res == "route") {
        for (var i = 0; i < data.length; ++i) {
            var d = data[i];
            var template = document.getElementById("route-template").cloneNode(true);
            template.setAttribute("id", d.id);
            template.style.display = null;
            var l = template.querySelectorAll(".route-lnk");
            for (var j = 0; j < l.length; ++j) {
                l.item(j).setAttribute("href", "route.html#" + d.id);
            }
            template.querySelector(".route-name").textContent = d.name;
            template.querySelector(".route-level").textContent = "Level: " + (d.level ? d.level : "");
            template.querySelector(".route-length").textContent = "Length: " + (d.length ? d.length : "");
            template.querySelector(".route-bolts").textContent = "Bolts: " + (d.bolts ? d.bolts : "");
            template.querySelector(".route-desc").textContent = "Description: " + (d.desc ? d.desc : "");
            if (d.images && d.images.length > 0) {
                template.querySelector(".route-cover").setAttribute("src", api_location + "/image/" + d.images[0] + "?size=300x300");
            } else {
                template.querySelector(".route-cover").setAttribute("src", emptyImage);
            }
            list.appendChild(template);
            list.appendChild(document.createElement("hr"));
        }
    } else if (res == "wall") {
        for (var i = 0; i < data.length; ++i) {
            var d = data[i];
            var template = document.getElementById("wall-template").cloneNode(true);
            template.setAttribute("id", d.id);
            template.style.display = null;
            var l = template.querySelectorAll(".wall-lnk");
            for (var j = 0; j < l.length; ++j) {
                l.item(j).setAttribute("href", "wall.html#" + d.id);
            }
            template.querySelector(".wall-name").textContent = d.name;
            template.querySelector(".wall-desc").textContent = "Description: " + (d.desc ? d.desc : "");
            if (d.images && d.images.length > 0) {
                template.querySelector(".wall-cover").setAttribute("src", api_location + "/image/" + d.images[0] + "?size=300x300");
            } else {
                template.querySelector(".wall-cover").setAttribute("src", emptyImage);
            }
            list.appendChild(template);
            list.appendChild(document.createElement("hr"));
        }
    }
}
