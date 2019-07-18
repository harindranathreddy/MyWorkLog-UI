function onManageTeamLinkClick() {
	if (document.getElementById("manageTeam") == null) {
		document.getElementById("loader").style.display = "block";
		document.getElementById("addJiraComponent").style.display = "none";
		document.getElementById("logWork").setAttribute("disabled", "");
		if (document.getElementById("userSummary")) {
			document.getElementById("body").removeChild(
					document.getElementById("userSummary"));
		} else if (document.getElementById("userProfile")) {
			document.getElementById("body").removeChild(
					document.getElementById("userProfile"));
		}else if (document.getElementById("teamJiraDashboard")) {
			document.getElementById("body").removeChild(
					document.getElementById("teamJiraDashboard"));
		}
		getManageTeamComponent();
	}
}

function getManageTeamComponent() {
	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		var response = this.responseXML;
		if (response) {
			displayComponents(response);
		}
	};
	xhr.open("GET", "./html/Templates.html", true);
	xhr.responseType = "document";
	xhr.send();
}

function displayComponents(manageTeamComponent) {
	var manageTeam = manageTeamComponent.getElementById("manageTeam");
	document.getElementById("dashboard").style.display = "none";
	document.getElementById("body").appendChild(manageTeam);
	$("#loader").fadeOut("slow");
}

function addTeam() {
	var teamName = document.getElementById("teamName").value;
	if (teamName) {
		updateProgressBar("10%");
		var xhr = new XMLHttpRequest();
		xhr.onload = function() {
			var response = JSON.parse(this.responseText);
			if (200 === this.status) {
				updateProgressBar("25%");
				if (response.responseCode == "T01") {
					document.getElementById("teamName").value = "";
					displaySuccessMessage(response.responseMessage);
					updateProgressBar("100%");
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
			updateProgressBarWithError("100%");
			displayWarning("Failed to create the team. Please try after sometime.");
		}
		xhr.open("POST", "http://" + window.location.hostname
				+ ":8090/taskmanagement/userDetails/createTeam", true);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.send(teamName);
	} else {
		displayError("Please, Fill the team name.");
	}
}

function searchUserToModify() {
	if (document.getElementById("userIdByTLorManager").value) {
		var data = "userId="
				+ document.getElementById("userIdByTLorManager").value;
		var xhr = new XMLHttpRequest();
		xhr.onload = function() {
			var response = JSON.parse(this.responseText);
			if (200 === this.status) {
				if (response.responseData !== null
						&& response.responseCode === "U06") {
					updateProgressBar("75%");
					document.getElementById("userIdByTLorManager").value = "";
					document.getElementById("SearchedUserDetails").style.display = "block";
					loadUserDetailsForLeads(response.responseData);
				}else if (response.responseCode === "U09") {
					updateProgressBar("100%");
					document.getElementById("userIdByTLorManager").value = "";
					displayInfo(response.responseMessage);
					clearProgressBar();
					$("#loader").fadeOut("slow");
				} else {
					updateProgressBarWithError("100%");
					displayError("Failed to load. Please contact the administrator.");
					clearProgressBar();
					$("#loader").fadeOut("slow");
				}
			} else {
				updateProgressBarWithError("100%");
				displayError("Failed to load. Please contact the administrator.");
				clearProgressBar();
				$("#loader").fadeOut("slow");
			}
		};
		xhr.onError = function() {
			updateProgressBarWithError("100%");
			displayError("Failed to load. Please contact the administrator.");
		}
		xhr.open("GET", "http://" + window.location.hostname
				+ ":8090/taskmanagement/authentication/getUser?" + data, true);
		xhr.send();
	} else {
		displayError("User Id not entered");
	}
}

function loadUserDetailsForLeads(userDetails) {
	document.getElementById("userId").value = userDetails.userId;
	if(userDetails.avatar){
		document.getElementById("userProfilePhoto").src = userDetails.avatar;
	}else{
		document.getElementById("userProfilePhoto").src = "https://jira2.cerner.com/secure/useravatar?avatarId=10122";
	}
	if (userDetails.name) {
		document.getElementById("userName").value = userDetails.name;
		document.getElementById("userName").classList
				.add("form-control-plaintext");
		document.getElementById("userName").readOnly = true;
	} else {
		document.getElementById("userName").value = "";
		document.getElementById("userName").classList
				.remove("form-control-plaintext");
		document.getElementById("userName").readOnly = false;
	}
	if (userDetails.mailId) {
		document.getElementById("userMailId").value = userDetails.mailId;
		document.getElementById("userMailId").classList
				.add("form-control-plaintext");
		document.getElementById("userMailId").readOnly = true;
	}else{
		document.getElementById("userMailId").value = "";
		document.getElementById("userMailId").classList
				.remove("form-control-plaintext");
		document.getElementById("userMailId").readOnly = false;
	}
	var teams = document.getElementById("userTeam");
	var length = teams.options.length;
	for (var i = length; i > 0; i--) {
		teams.options[i] = null;
	}
	addAllTeamsInMagageTeam(userDetails.team);
	if (userDetails.role) {
		var userRole = document.getElementById("userRole");
		for (option in userRole.options) {
			if (userRole.options.item(option).value === userDetails.role) {
				document.getElementById("userRole").selectedIndex = option;
				break;
			}
		}
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
	clearProgressBar();
	$("#loader").fadeOut("slow");
}

function addAllTeamsInMagageTeam(userTeam) {
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
					if (option.text === userTeam) {
						option.selected = true;
					}
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

function saveProfileChangesByTLorManager() {
	updateProgressBar("50%");
	var modifiedUserDetails = {};
	modifiedUserDetails.avatar = document.getElementById("userProfilePhoto").src;
	modifiedUserDetails.userId = document.getElementById("userId").value;
	modifiedUserDetails.name = document.getElementById("userName").value;
	modifiedUserDetails.mailId = document.getElementById("userMailId").value;
	modifiedUserDetails.role = document.getElementById("userRole").value;
	modifiedUserDetails.notification = document
			.getElementById("mailNotification").checked;
	var roleIndex = document.getElementById("userTeam").selectedIndex;
	if (roleIndex != 0) {
		var userTeam = document.getElementById("userTeam")[roleIndex];
		modifiedUserDetails.team = userTeam.text;
		modifiedUserDetails.teamId = userTeam.value;
	} else {
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
		$("#loader").fadeOut("slow");
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