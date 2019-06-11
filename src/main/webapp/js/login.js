function validateLogin() {
	var userId = document.getElementById("userId").value;
	var password = document.getElementById("userPassword").value;
	if (userId && password) {
		login(userId,password);
	} else {
		displayWarning("Fill all the details");
	}
}

function login(userId,password){
	displayInfo("Login is in progress.")
	var data = "userName=" + userId + "&password=" + password;
	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		var response = JSON.parse(this.responseText);
		if (200 === this.status) {
			if (response && response.responseCode === 'L01') {
				displaySuccessMessage(response.responseMessage + ". Please wait for results to load.")
				displayDetails(userId,password);
			} else {
				displayError(response.responseMessage);
			}
		} else {
			displayError(response.responseMessage);
		}
	};
	xhr.open("GET", "http://"+window.location.hostname+":8090/taskmanagement/authentication/authUser?"
			+ data, true);
	xhr.send();
}

document.addEventListener("DOMContentLoaded", function(event) {
	if (sessionStorage.getItem("user") && sessionStorage.getItem("key")) {
		var user = sessionStorage.getItem("user");
		var password = atob(sessionStorage.getItem("key"));
		login(user,password);
	}
});

function logOut(){
	sessionStorage.clear();
	window.location.reload(true);
}