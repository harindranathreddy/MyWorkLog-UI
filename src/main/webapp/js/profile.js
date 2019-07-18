function onProfileLinkClick() {
	if (document.getElementById("userProfile") == null) {
		updateProgressBar("10%");
		document.getElementById("loader").style.display = "block";
		document.getElementById("addJiraComponent").style.display = "none";
		document.getElementById("logWork").setAttribute("disabled", "");
		if (document.getElementById("userSummary")) {
			document.getElementById("body").removeChild(
					document.getElementById("userSummary"));
		} else if (document.getElementById("manageTeam")) {
			document.getElementById("body").removeChild(
					document.getElementById("manageTeam"));
		}else if (document.getElementById("teamJiraDashboard")) {
			document.getElementById("body").removeChild(
					document.getElementById("teamJiraDashboard"));
		}
		getProfileComponent(loadProfile);
	}
}

function getProfileComponent(callback) {
	updateProgressBar("20%");
	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		var response = this.responseXML;
		if (response) {
			updateProgressBar("45%");
			callback(response.getElementById("userProfile"));
		} else {
			displayError("Failed to load. Please contact the administrator and try page refresh(Click F5)");
		}
	};
	xhr.open("GET", "./html/Profile.html", true);
	xhr.responseType = "document";
	xhr.send();
}

function loadProfile(userProfileComponent) {
	updateProgressBar("55%");
	document.getElementById("dashboard").style.display = "none";
	document.getElementById("body").appendChild(userProfileComponent);
	fetchUserDetails();
}

function fetchUserDetails() {
	var data = "userId=" + sessionStorage.getItem("user");
	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		var response = JSON.parse(this.responseText);
		if (200 === this.status) {
			if (response.responseData !== null
					&& response.responseCode === "U06") {
				updateProgressBar("75%");
				loadUserDetails(response.responseData);
			} else {
				updateProgressBarWithError("100%");
				displayError("Failed to load. Please contact the administrator.");
			}
		} else {
			updateProgressBarWithError("100%");
			displayError("Failed to load. Please contact the administrator.");
		}
	};
	xhr.onError = function() {
		updateProgressBarWithError("100%");
		displayError("Failed to load. Please contact the administrator.");
	}
	xhr.open("GET", "http://" + window.location.hostname
			+ ":8090/taskmanagement/authentication/getUser?" + data, true);
	xhr.send();
}

function loadUserDetails(userDetails) {
	updateProgressBar("85%");
	document.getElementById("userId").value = userDetails.userId;
	if (userDetails.name) {
		document.getElementById("userName").value = userDetails.name;
		document.getElementById("userName").classList
				.add("form-control-plaintext");
		document.getElementById("userName").readOnly = true;
	}
	if (userDetails.mailId) {
		document.getElementById("userMailId").value = userDetails.mailId;
		document.getElementById("userMailId").classList
				.add("form-control-plaintext");
		document.getElementById("userMailId").readOnly = true;
	}
	if (userDetails.team) {
		var option = document.createElement("option");
		option.text = userDetails.team;
		document.getElementById("userTeam").add(option);
		document.getElementById("userTeam").selectedIndex = 1
		document.getElementById("userTeam").classList
				.add("form-control-plaintext");
		document.getElementById("userTeam").readOnly = true;
		document.getElementById("userTeam").disabled = true;
	} else {
		addAllTeams();
	}
	if (userDetails.role) {
		document.getElementById("userRole").value = userDetails.role;
		document.getElementById("userRole").classList
				.add("form-control-plaintext");
		document.getElementById("userRole").readOnly = true;
	}
	if (userDetails.avatar) {
		document.getElementById("userProfilePhoto").src = userDetails.avatar;
	}
	if (userDetails.notification) {
		document.getElementById("mailNotification").checked = true;
	} else {
		document.getElementById("mailNotification").checked = false;
	}
	updateProgressBar("100%");
	$("#loader").fadeOut("slow");
	clearProgressBar();
}

function editProfileDetails() {
	updateProgressBar("10%");
	document.getElementById("loader").style.display = "block";
	if (!document.getElementById("userName").value) {
		document.getElementById("userName").classList
				.remove("form-control-plaintext");
		document.getElementById("userName").readOnly = false;
	}
	if (!document.getElementById("userMailId").value) {
		document.getElementById("userMailId").classList
				.remove("form-control-plaintext");
		document.getElementById("userMailId").readOnly = false;
	}
	if (document.getElementById("userTeam").selectedIndex == 0) {
		document.getElementById("userTeam").classList
				.remove("form-control-plaintext");
		document.getElementById("userTeam").readOnly = false;
		document.getElementById("userTeam").removeAttribute("disabled");
	}
	document.getElementById("saveProfileChanges").style.display = "block";
	document.getElementById("editProfile").style.display = "none";
	updateProgressBar("30%");
	addAllTeams();
}
function addAllTeams() {
	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		updateProgressBar("60%");
		var response = JSON.parse(this.responseText);
		if (200 === this.status) {
			if (response.responseCode == "T04") {
				updateProgressBar("70%");
				var teamsData = response.responseData;
				var teams = document.getElementById("userTeam");
				for (var i = 0; i < teamsData.length; i++) {
					var option = document.createElement("option");
					option.text = teamsData[i].name;
					option.value = teamsData[i].id;
					teams.add(option);
				}
				updateProgressBar("100%");
			} else if (response.responseCode == "T05") {
				updateProgressBarWithError("100%");
				displayWarning(response.responseMessage);
			} else {
				updateProgressBarWithError("100%");
				displayWarning(response.responseMessage);
			}
		} else {
			updateProgressBarWithError("100%");
			displayError(response.responseMessage);
		}
		clearProgressBar();
		$("#loader").fadeOut("slow");
	};
	xhr.onError = function() {
		displayWarning("Failed to create the team. Please try after sometime.");
	}
	xhr.open("GET", "http://" + window.location.hostname
			+ ":8090/taskmanagement/userDetails/getAllteams", true);
	xhr.send();
}

function saveProfileChangesFun() {
	updateProgressBar("50%");
	var modifiedUserDetails = {};
	modifiedUserDetails.userId = document.getElementById("userId").value;
	modifiedUserDetails.name = document.getElementById("userName").value;
	modifiedUserDetails.mailId = document.getElementById("userMailId").value;
	modifiedUserDetails.role = document.getElementById("userRole").value;
	modifiedUserDetails.notification = document
			.getElementById("mailNotification").checked;
	var roleIndex = document.getElementById("userTeam").selectedIndex;
	if (roleIndex != 0 && !document.getElementById("userTeam").readOnly) {
		var userTeam = document.getElementById("userTeam")[roleIndex];
		modifiedUserDetails.team = userTeam.text;
		modifiedUserDetails.teamId = userTeam.value;
		document.getElementById("userTeam").classList
				.add("form-control-plaintext");
		document.getElementById("userTeam").readOnly = true;
		document.getElementById("userTeam").disabled = true;
	}else{
		var userTeam = document.getElementById("userTeam")[roleIndex];
		modifiedUserDetails.team = userTeam.text;
	}
	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		updateProgressBar("80%");
		if (200 === this.status) {
			var response = JSON.parse(this.responseText);
			if (response && response.responseCode === 'U07') {
				displaySuccessMessage(response.responseMessage);
				updateProgressBar("100%");
			} else {
				updateProgressBarWithError("100%");
				displayError(response.responseMessage);
			}
		} else if (400 === this.status) {
			updateProgressBarWithError("100%");
			var response = JSON.parse(this.responseText);
			displayError(response.responseMessage);
		} else {
			updateProgressBarWithError("100%");
			displayError("Error occured. Please try after sometime");
		}
		clearProgressBar();
	};
	xhr.onerror = function(e) {
		updateProgressBarWithError("100%");
		displayError("Unknown Error Occured. Server response not received. Please contact Administrator.");
	};
	xhr.open("POST", "http://" + window.location.hostname
			+ ":8090/taskmanagement/userDetails/updateUserRecords", true);
	xhr.setRequestHeader("Content-Type", "application/json");
	updateProgressBar("60%");
	xhr.send(JSON.stringify(modifiedUserDetails));
}