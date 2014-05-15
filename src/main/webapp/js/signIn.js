function signIn(email, pwd) {
    var url = "api/user?singIn"
    d3.json(url, function(error, json) {
	    if (error) {
            return console.warn(error);
        }
        this.location = "start.html";
    });
    
}

function signUp(email, pwd) {
    var url = "api/user?singUp"
    d3.json(url, function(error, json) {
	    if (error) {
            return console.warn(error);
        }
        this.location = "start.html";
    });
}
