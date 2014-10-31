
function submit() {
    var email = document.getElementById("email").value;
    var pwd = document.getElementById("pwd").value;
    var rpwd = document.getElementById("rpwd").value;
    if (pwd === rpwd) {
        signUp(email, pwd);
    }
}

function signUp(email, pwd) {
    var url = api_location + "/user/signUp";
    var request = {};

    var request = new XMLHttpRequest();
    request.open("POST", api_location + "/user/signUp", true);
    request.setRequestHeader("Content-Type", "application/json");
    var data = {};
    data.email = email;
    data.password = pwd;

    request.onload = function(event) {
        if (request.status == 200) {
            console.log("Success!");
            var response = JSON.parse(event.target.responseText);
            if (response.error) {
                console.log(response);
            } else {
                document.cookie = "email=" + response.email + "; path=/web";
                document.cookie = "session=" + response.session + "; path=/web";
                window.location.href = "start.html";
            }
        } else {
            console.log("error code: ", request.status);
        }
    };

    request.send(JSON.stringify(data));
}
