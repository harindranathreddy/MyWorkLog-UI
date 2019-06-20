function validateLogin() {
	updateProgressBar("5%");
	var userId = document.getElementById("userId").value;
	var password = document.getElementById("userPassword").value;
	if (userId && password) {
		login(userId, btoa(password));
	} else {
		displayWarning("Fill all the details");
	}
}

function login(userId, password) {
	document.getElementById("loader").style.display = "block";
	var data = "userName=" + userId + "&password=" + password;
	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		var response = JSON.parse(this.responseText);
		if (200 === this.status) {
			clearScreen();
			if (response && response.responseCode === 'L01') {
				updateProgressBar("10%");
				displayDetails(userId, password);
				var headers = xhr.getAllResponseHeaders();
			} else {
				displayError(response.responseMessage);
				clearProgressBarWithOutFooter();
			}
		} else {
			displayError(response.responseMessage);
			clearProgressBarWithOutFooter();
		}
	};
	xhr.onerror = function(e) {
		updateProgressBarWithError("100%");
		displayError("Unknown Error Occured. Server response not received. Please contact Administrator.");
		clearProgressBarWithOutFooter();
	};
	xhr.open("GET", "http://" + window.location.hostname
			+ ":8090/taskmanagement/authentication/authUser?" + data, true);
	xhr.send();

}

document.addEventListener("DOMContentLoaded", function(event) {
	//var cookie = document.cookie;
	if (sessionStorage.getItem("user") && sessionStorage.getItem("key")) {
		var user = sessionStorage.getItem("user");
		var password = sessionStorage.getItem("key");
		login(user, password);
	}
});

function logOut() {
	sessionStorage.clear();
	window.location.reload(true);
}

function clearScreen() {
	document.getElementById("body").removeChild(
			document.getElementById("login"));
}