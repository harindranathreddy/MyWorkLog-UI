function onMyTeamJiraLinkClick() {
	document.getElementById("loader").style.display = "block";
	updateProgressBar("10%")
	if (document.getElementById("userSummary")) {
		document.getElementById("body").removeChild(
				document.getElementById("userSummary"));
	} else if (document.getElementById("userProfile")) {
		document.getElementById("body").removeChild(
				document.getElementById("userProfile"));
	} else if (document.getElementById("manageTeam")) {
		document.getElementById("body").removeChild(
				document.getElementById("manageTeam"));
	}
	document.getElementById("addJiraComponent").style.display = "none";
	document.getElementById("dashboard").style.display = "none";
	var teamJiraDashboard = document.createElement("div");
	teamJiraDashboard.id = "teamJiraDashboard";
	teamJiraDashboard.classList.add("list-group");
	teamJiraDashboard.classList.add("list-group-flush");
	document.getElementById("body").appendChild(teamJiraDashboard);
	loadTeamJiras(sessionStorage.getItem("team"));
	updateProgressBar("20%")
}

function loadTeamJiras(teamName) {
	if (teamName) {
		var data = "teamName=" + teamName;
		var xhr = new XMLHttpRequest();
		xhr.onload = function() {
			var response = JSON.parse(this.responseText);
			if (200 === this.status) {
				var response = JSON.parse(this.responseText);
				if (response && response.responseCode === 'J01') {
					updateProgressBar("30%")
					var teamJiraDetailsList = response.responseData;
					loadTeamJiraDetails(teamJiraDetailsList);
				}else{
					updateProgressBarWithError("100%");
					displayError(response.responseMessage);
					$("#loader").fadeOut("slow");
				}
			} else {
				updateProgressBarWithError("100%")
				displayError(response.responseMessage);
				$("#loader").fadeOut("slow");
			}
		};
		xhr.open("GET", "http://" + window.location.hostname
				+ ":8090/taskmanagement/details/jiraDetailsByTeam?" + data,
				true);
		xhr.send();
	} else {
		updateProgressBar("100%")
		$("#loader").fadeOut("slow");
		displayError("No Team Assigned");
	}
}

function loadTeamJiraDetails(jiraDetailsList) {
	try {
		updateProgressBar("50%")
		for (var i = 0; i < jiraDetailsList.length; i++) {
			var jiraDetails = jiraDetailsList[i];
			var jira = document.createElement("div");
			jira.id = "jira";
			jira.classList.add("list-group-item");
			jira.classList.add(jiraDetails.id);
			var jiraControls = document.createElement("div");
			var addWorkLogDay = document.createElement("IMG");
			addWorkLogDay.classList.add("addWorkLog")
			addWorkLogDay.setAttribute("src", "./images/add.png");
			addWorkLogDay.setAttribute("alt", "Add New Day");
			addWorkLogDay.setAttribute("title", "Add New Day");
			addWorkLogDay.setAttribute("onClick",
					"addWorkLogDay(this.parentNode.parentNode)");
			jiraControls.appendChild(addWorkLogDay);
			var cross = document.createElement("button");
			cross.type = "button";
			cross.setAttribute("aria-label", "Close");
			cross.classList.add("removeJira");
			cross.classList.add("Close");
			cross.setAttribute("onClick", "removeJiraDiv(this)");
			cross.innerHTML = "<span aria-hidden='true'>&times;</span>";
			jiraControls.appendChild(cross);
			jira.appendChild(jiraControls);
			var details = document.createElement("div");
			details.id = "details";
			jira.appendChild(details);
			var key = document.createElement("div");
			key.id = "key";
			key.innerHTML = "<strong>Jira: </strong><a href="
					+ jiraDetails.jiraLink
					+ " target='_blank' class='card-link'>" + jiraDetails.id
					+ "</a>";
			details.appendChild(key);
			var status = document.createElement("div");
			status.id = "status";
			status.innerHTML = "<strong>Status: </strong><img src = "
					+ jiraDetails.statusIcon + "> " + jiraDetails.status;
			details.appendChild(status);
			var type = document.createElement("div");
			type.id = "type";
			type.innerHTML = "<strong>Type: </strong><img src = "
					+ jiraDetails.issueIcon + "> " + jiraDetails.type;
			details.appendChild(type);
			var assignedTO = document.createElement("div");
			assignedTO.id = "assignedTO";
			if (jiraDetails.assignedTo) {
				assignedTO.innerHTML = "<strong>Assigned To: </strong>"
						+ jiraDetails.assignedTo;
			} else {
				assignedTO.innerHTML = "<strong>Assigned To: </strong>";
			}
			details.appendChild(assignedTO);
			var summery = document.createElement("div");
			summery.id = "summary";
			summery.innerHTML = "<strong>Summary: </strong>"
					+ jiraDetails.summery;
			details.appendChild(summery);
			var workLogs = document.createElement("div");
			workLogs.id = "workLogs";
			workLogs.classList.add("row");
			jira.appendChild(workLogs);
			document.getElementById("teamJiraDashboard").appendChild(jira);
			addWorkLogComponentForTeamJira(workLogs);

		}
		if (jiraDetailsList.length == 0) {
			displayInfo("No cards available for team.");
		}
		document.getElementById("logWork").classList.remove("disabled");
		updateProgressBar("100%");
		clearProgressBar();
	} catch (err) {
		updateProgressBarWithError("100%");
		displayError("Failed to load. Please contact the administrator.");
	}
	$("#loader").fadeOut("slow");
}

function addWorkLogComponentForTeamJira(workLogs, dates) {
	try {
		var workLog = document.createElement("div");
		workLog.id = "workLog";
		workLog.classList.add("workLog");
		var date = document.createElement("div");
		date.id = "date";
		date.classList.add("card-header");
		date.innerHTML = "<strong>" + new Date().toDateString() + "</strong>";
		workLog.appendChild(date);
		var workHours = document.createElement("input");
		workHours.id = "workHours";
		workHours.placeholder = "Work Hours (Ex: 8h)";
		workHours.classList.add("form-control");
		workHours.classList.add("card-body");
		workLog.appendChild(workHours);
		var comment = document.createElement("textarea");
		comment.id = "comment";
		comment.placeholder = "comment";
		comment.classList.add("form-control");
		comment.classList.add("card-body");
		workLog.appendChild(comment);
		workLogs.appendChild(workLog);
	} catch (err) {
		updateProgressBarWithError("100%");
		displayError("Failed to load. Please contact the administrator.");
	}
}