function displayWarning(message) {
	document.getElementById("response").style.display = "block";
	document.getElementById("response").innerHTML = "<div class='alert alert-warning' role='alert'> "
			+ message + "</div>";
	setTimeout(function() {
		document.getElementById("response").style.display = 'none';
	}, 3000);
}

function displayInfo(message) {
	document.getElementById("response").style.display = "block";
	document.getElementById("response").innerHTML = "<div class='alert alert-info' role='alert'> "
			+ message + "</div>";
	setTimeout(function() {
		document.getElementById("response").style.display = 'none';
	}, 3000);
}

function displayError(message) {
	document.getElementById("response").style.display = "block";
	document.getElementById("response").innerHTML = "<div class='alert alert-danger' role='alert'> "
			+ message + "</div>";
	setTimeout(function() {
		document.getElementById("response").style.display = 'none';
	}, 3000);
}

function displaySuccessMessage(message) {
	document.getElementById("response").style.display = "block";
	document.getElementById("response").innerHTML = "<div class='alert alert-success' role='alert'> "
			+ message + "</div>";
	setTimeout(function() {
		document.getElementById("response").style.display = 'none';
	}, 3000);
}

function clearResponse() {
	document.getElementById("response").innerHTML = "";
}

function displayWarningWithId(message, divId) {
	document.getElementById("response").style.display = "block";
	document.getElementById(divId).innerHTML = "<div class='alert alert-warning' role='alert'> "
			+ message + "</div>";
	setTimeout(function() {
		document.getElementById("response").style.display = 'none';
	}, 3000);
}