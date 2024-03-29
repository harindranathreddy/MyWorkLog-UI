function onManageTeamLinkClick() {
		document.getElementById("loader").style.display = "block";
		document.getElementById("addJiraComponent").style.display = "none";
		document.getElementById("logWork").setAttribute("disabled", "");
		if (document.getElementById("userSummary")) {
			document.getElementById("body").removeChild(
					document.getElementById("userSummary"));
		} else if (document.getElementById("userProfile")) {
			document.getElementById("body").removeChild(
					document.getElementById("userProfile"));
		} else if (document.getElementById("teamJiraDashboard")) {
			document.getElementById("body").removeChild(
					document.getElementById("teamJiraDashboard"));
		} else if (document.getElementById("teamSummary")) {
			document.getElementById("body").removeChild(
					document.getElementById("teamSummary"));
		}else if (document.getElementById("manageTeam")) {
			document.getElementById("body").removeChild(
					document.getElementById("manageTeam"));
		}
		getManageTeamComponent();
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
	addAllTeamsForTeamSummary();
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
				} else if (response.responseCode === "U09") {
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
	if (userDetails.avatar) {
		document.getElementById("userProfilePhoto").src = userDetails.avatar;
	} else {
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
	} else {
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
	var teamIndex = document.getElementById("userTeam").selectedIndex;
	if (teamIndex != 0) {
		var userTeam = document.getElementById("userTeam")[teamIndex];
		modifiedUserDetails.team = userTeam.text;
		modifiedUserDetails.teamId = userTeam.value;
		if (modifiedUserDetails.userId == sessionStorage.getItem("user")) {
			sessionStorage.setItem("team", modifiedUserDetails.team);
		}
	} else {
		var userTeam = document.getElementById("userTeam")[teamIndex];
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
				clearSearchedUserDetails();
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

function clearSearchedUserDetails() {
	document.getElementById("SearchedUserDetails").style.display = "none";
	document.getElementById("userProfilePhoto").src = "";
	document.getElementById("userId").value = "";
	document.getElementById("userName").value = "";
	document.getElementById("userMailId").value = "";
	document.getElementById("userRole").value = "";
	document.getElementById("userTeam").selectedIndex = 0;
}
var noOfDays;
var associateId;
function loadUserSummaryForPM() {
	noOfDays = document.getElementById("daysForUserSummaryByPM").value;
	associateId = document.getElementById("userIdForSummaryByPM").value;
	if (noOfDays > 0 && associateId) {
		document.getElementById("loader").style.display = "block";
		if (document.getElementById("summaryTableDiv"))
			document.getElementById("userSummaryDetailsForPM").removeChild(
					document.getElementById("summaryTableDiv"));
		if (document.getElementById("summaryChart"))
			document.getElementById("userSummaryDetailsForPM").removeChild(
					document.getElementById("summaryChart"));
		getSummaryComponent(loadUserSummaryDivForPM);
	} else {
		displayWarning("Please enter no of days and Associate Id for Summary.");
	}
}

function loadUserSummaryDivForPM(userSummaryDiv) {
	var summaryTableDiv = userSummaryDiv.children.summaryTableDiv;
	var summaryChartDiv = userSummaryDiv.children.summaryChart;
	document.getElementById("userSummaryDetailsForPM").appendChild(
			summaryTableDiv);
	document.getElementById("userSummaryDetailsForPM").appendChild(
			summaryChartDiv);
	document.getElementById("userSummaryDetailsForPM").style.display = "block";
	fetchUserSummaryDetailsForPM();
}

function fetchUserSummaryDetailsForPM() {
	try {
		document.getElementsByClassName("progress-bar")[0].style.width = "10%";
		var data = "userId=" + associateId + "&noOfDays=" + noOfDays;
		var xhr = new XMLHttpRequest();
		xhr.onload = function() {
			var response = JSON.parse(this.responseText);
			if (200 === this.status) {
				updateProgressBar("25%");
				if (response.responseCode == "US01") {
					var jiraSummaryDetailsList = response.responseData;
					loadSummaryTable(jiraSummaryDetailsList);
					loadGraphSummary(noOfDays, jiraSummaryDetailsList);
				} else if (response.responseCode == "US03") {
					updateProgressBarWithError("100%");
					displayWarning(response.responseMessage);
					clearProgressBar();
				} else {
					updateProgressBarWithError("100%");
					displayError(response.responseMessage);
					clearProgressBar();
				}
			} else {
				updateProgressBarWithError("100%");
				displayError(response.responseMessage);
				clearProgressBar();
			}
		};
		xhr.onerror = function(e) {
			updateProgressBarWithError("100%");
			displayError("Unknown Error Occured. Server response not received. Please contact Administrator.");
			clearProgressBar();
		};
		xhr.open("GET", "http://" + window.location.hostname
				+ ":8090/taskmanagement/details/jiraDetailsForSummary?" + data,
				true);
		xhr.send();
	} catch (err) {
		updateProgressBarWithError("100%");
		displayError("Failed to load. Please contact the administrator.");
		$("#loader").fadeOut("slow");
	}
}

function clearUserSummaryForPM() {
	if (document.getElementById("summaryTableDiv"))
		document.getElementById("userSummaryDetailsForPM").removeChild(
				document.getElementById("summaryTableDiv"));
	if (document.getElementById("summaryChart"))
		document.getElementById("userSummaryDetailsForPM").removeChild(
				document.getElementById("summaryChart"));
	document.getElementById("daysForUserSummaryByPM").value = "";
	document.getElementById("userIdForSummaryByPM").value = "";
}

function addAllTeamsForTeamSummary() {
	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		updateProgressBar("60%");
		var response = JSON.parse(this.responseText);
		if (200 === this.status) {
			if (response.responseCode == "T04") {
				updateProgressBar("70%");
				var teamsData = response.responseData;
				var teams = document.getElementById("teamNamesForSummary");
				for (var i = 0; i < teamsData.length; i++) {
					var option = document.createElement("option");
					option.text = teamsData[i].name;
					option.value = teamsData[i].id;
					teams.add(option);
				}
				updateProgressBar("100%");
				clearProgressBar();
				$("#loader").fadeOut("slow");
			} else if (response.responseCode == "T05") {
				updateProgressBarWithError("100%");
				displayWarning(response.responseMessage);
				clearProgressBar();
				$("#loader").fadeOut("slow");
			} else {
				updateProgressBarWithError("100%");
				displayWarning(response.responseMessage);
				clearProgressBar();
				$("#loader").fadeOut("slow");
			}
		} else {
			updateProgressBarWithError("100%");
			displayError(response.responseMessage);
			clearProgressBar();
			$("#loader").fadeOut("slow");
		}
	};
	xhr.onError = function() {
		displayWarning("Failed to create the team. Please try after sometime.");
	}
	xhr.open("GET", "http://" + window.location.hostname
			+ ":8090/taskmanagement/userDetails/getAllteams", true);
	xhr.send();
}

var noOfDaysForTeam;
var teamSelected;
function loadTeamSummaryButtonForPM(){
	noOfDaysForTeam = document.getElementById("daysForTeamSummaryByPM").value;
	var teamSelectedIndex = document.getElementById("teamNamesForSummary").selectedIndex;
	teamSelected = document.getElementById("teamNamesForSummary")[teamSelectedIndex].text;
	if (noOfDaysForTeam > 0 && teamSelectedIndex> 0 && teamSelected) {
		document.getElementById("loader").style.display = "block";
		getTeamSummaryComponent(loadTeamSummaryComponentForPM);
	} else {
		displayWarning("Please enter no of days and select Team name for Summary.");
	}
}

var userSummaryDivForPM = {}
function loadTeamSummaryComponentForPM(teamSummaryComponents){
		updateProgressBar("20%");
		if (document.getElementById("teamMembersSummaryComponents"))
			document.getElementById("teamSummaryDetailsForPM").removeChild(
					document.getElementById("teamMembersSummaryComponents"));
		document.getElementById("teamSummaryDetailsForPM").appendChild(
				teamSummaryComponents.children.teamMembersSummaryComponents);
		userSummaryDivForPM = teamSummaryComponents.children.userSummaryDiv;
		fetchTeamMemeberDetailsForPM(7, fetchTeamSummaryDetailsForPM);
}

function fetchTeamMemeberDetailsForPM(days, callback) {
	try {
		document.getElementsByClassName("progress-bar")[0].style.width = "10%";
		var data = "userId=" + sessionStorage.getItem("user") + "&teamName="
				+ teamSelected;
		var xhr = new XMLHttpRequest();
		xhr.onload = function() {
			var response = JSON.parse(this.responseText);
			if (200 === this.status) {
				updateProgressBar("30%");
				if (response.responseCode == "TM01") {
					var teamMemebers = response.responseData;
					callback(teamMemebers, days);
				} else {
					updateProgressBarWithError("100%");
					displayError(response.responseMessage);
					clearProgressBar();
				}
			} else {
				updateProgressBarWithError("100%");
				displayError(response.responseMessage);
				clearProgressBar();
			}
		};
		xhr.onerror = function(e) {
			updateProgressBarWithError("100%");
			displayError("Unknown Error Occured. Server response not received. Please contact Administrator.");
			clearProgressBar();
		};
		xhr.open("GET", "http://" + window.location.hostname
				+ ":8090/taskmanagement/userDetails/getTeamMembers?" + data,
				true);
		xhr.send();
	} catch (err) {
		updateProgressBarWithError("100%");
		displayError("Failed to load. Please contact the administrator.");
		clearProgressBar();
	}
}

function fetchTeamSummaryDetailsForPM(teamMembers, days){
	updateProgressBar("50%");
	for (var i = 0; i < teamMembers.length; i++) {
		try {
			document.getElementsByClassName("progress-bar")[0].style.width = "10%";
			var data = "userId=" + teamMembers[i].userId + "&noOfDays=" + days;
			var xhr = new XMLHttpRequest();
			xhr.onload = function() {
				var response = JSON.parse(this.responseText);
				if (200 === this.status) {
					updateProgressBar("25%");
					if (response.responseCode == "US01") {
						var jiraSummaryDetailsList = response.responseData;
						var teamSummaryDiv = document
								.getElementById("teamMembersSummaryComponents");
						var tempUserSummaryDiv = userSummaryDivForPM.cloneNode(true);
						tempUserSummaryDiv.id += "_" + teamMembers[i].userId;
						var userDetailsForSummary = tempUserSummaryDiv.children.userDetailsForSummary;
						userDetailsForSummary.innerHTML = "Summary of <strong>"
								+ teamMembers[i].name + "</strong>";
						teamSummaryDiv.appendChild(tempUserSummaryDiv);
						var userSummaryTable = tempUserSummaryDiv.children.summaryTableDiv;
						var userSummaryGraph = tempUserSummaryDiv.children.summaryChart;
						loadUserSummaryTable(jiraSummaryDetailsList,
								userSummaryTable);
						loadUserSummaryGraph(days, jiraSummaryDetailsList,
								userSummaryGraph);
					} else if (response.responseCode == "US03") {
						updateProgressBarWithError("100%");
						displayWarning(response.responseMessage);
						clearProgressBar();
					} else {
						updateProgressBarWithError("100%");
						displayError(response.responseMessage);
						clearProgressBar();
					}
				} else if (400 === this.status) {
					var teamSummaryDiv = document
							.getElementById("teamMembersSummaryComponents");
					var tempUserSummaryDiv = userSummaryDivForPM.cloneNode(true);
					tempUserSummaryDiv.id += "_" + teamMembers[i].userId;
					var userDetailsForSummary = tempUserSummaryDiv.children.userDetailsForSummary;
					userDetailsForSummary.innerHTML = "<strong>"
							+ teamMembers[i].name
							+ "</strong> didn't log any work in requested time frame."
					teamSummaryDiv.appendChild(tempUserSummaryDiv);
				} else {
					var teamSummaryDiv = document
							.getElementById("teamMembersSummaryComponents");
					var tempUserSummaryDiv = userSummaryDivForPM.cloneNode(true);
					tempUserSummaryDiv.id += "_" + teamMembers[i].userId;
					var userDetailsForSummary = tempUserSummaryDiv.children.userDetailsForSummary;
					userDetailsForSummary.innerHTML = "Failed to fetch details of <strong>"
							+ teamMembers[i].name + "</<strong>>";
					teamSummaryDiv.appendChild(tempUserSummaryDiv);
				}
			};
			xhr.onerror = function(e) {
				updateProgressBarWithError("100%");
				displayError("Unknown Error Occured. Server response not received. Please contact Administrator.");
				clearProgressBarWithOutFooter();
			};
			xhr.open("GET", "http://" + window.location.hostname
					+ ":8090/taskmanagement/details/jiraDetailsForSummary?"
					+ data, false);
			xhr.send();
		} catch (err) {
			updateProgressBarWithError("100%");
			displayError("Failed to load. Please contact the administrator.");
		}
	}
	updateProgressBar("100%");
	clearProgressBar();
}

function clearTeamSummaryForPM() {
	if (document.getElementById("teamMembersSummaryComponents"))
		document.getElementById("teamSummaryDetailsForPM").removeChild(
				document.getElementById("teamMembersSummaryComponents"));
	document.getElementById("daysForTeamSummaryByPM").value = "";
	document.getElementById("teamNamesForSummary").selectedIndex = 0;
}