function displayWarning(message) {
	document.getElementById("response").style.display = "block";
	document.getElementById("response").innerHTML = "<div class='alert alert-warning' role='alert'> "
			+ message + "</div>";
	setTimeout(function() {
		document.getElementById("response").style.display = 'none';
	}, 10000);
}

function displayInfo(message) {
	document.getElementById("response").style.display = "block";
	document.getElementById("response").innerHTML = "<div class='alert alert-info' role='alert'> "
			+ message + "</div>";
	setTimeout(function() {
		document.getElementById("response").style.display = 'none';
	}, 10000);
}

function displayError(message) {
	document.getElementById("response").style.display = "block";
	document.getElementById("response").innerHTML = "<div class='alert alert-danger' role='alert'> "
			+ message + "</div>";
	setTimeout(function() {
		document.getElementById("response").style.display = 'none';
	}, 10000);
}

function displaySuccessMessage(message) {
	document.getElementById("response").style.display = "block";
	document.getElementById("response").innerHTML = "<div class='alert alert-success' role='alert'> "
			+ message + "</div>";
	setTimeout(function() {
		document.getElementById("response").style.display = 'none';
	}, 10000);
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
	}, 10000);
}

function updateProgressBar(per){
	document.getElementsByClassName("progress-bar")[0].style.width = per;
}

function clearProgressBar(){
	document.getElementById("footer").style.display = "block";
	setTimeout(function() {
		document.getElementsByClassName("progress-bar")[0].style.width = "0%";
		document.getElementsByClassName("progress-bar bg-danger")[0].style.width = "0%";
	}, 3000);
	$("#loader").fadeOut("slow");
}

function clearProgressBarWithOutFooter(){
	setTimeout(function() {
		document.getElementsByClassName("progress-bar")[0].style.width = "0%";
		document.getElementsByClassName("progress-bar bg-danger")[0].style.width = "0%";
	}, 3000);
	$("#loader").fadeOut("slow");
}

function updateProgressBarWithError(per){
	document.getElementsByClassName("progress-bar bg-danger")[0].style.width = per;
}