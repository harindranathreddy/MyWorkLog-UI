var workLogs;

function diplayLogSummaryPopup(logs, logSummary) {
	workLogs = logs;
	loadTemplates(renderData, logs, logSummary);
}

function loadTemplates(callback, logs, logSummery) {
	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		var response = this.responseXML;
		if (response) {
			renderData(logs, logSummery, response);
		}
	};
	xhr.open("GET", "./html/Templates.html", true);
	xhr.responseType = "document";
	xhr.send();
}

function renderData(logs, logSummery, template) {
	var popup;
	if (document.getElementById("popup")) {
		popup = document.getElementById("popup");
	} else {
		popup = template.getElementById("popup");
	}
	popup.getElementsByClassName("modal-title").popupTitle.innerHTML = "Log Verification Summary";
	var table = template.getElementById("logSummery");
	popup.getElementsByClassName("modal-body").popupBody.appendChild(table);
	var tbody = table
			.getElementsByClassName("workLokJiraSummeryDetailsTableBody").workLokJiraSummeryDetailsTableBody;
	for (var i = 0; i < logSummery.length; i++) {
		var jiraRow = tbody.insertRow(-1);
		jiraRow.setAttribute("id", logSummery[i].key);
		jiraRow.setAttribute("class", "table-active");
		jiraRow.setAttribute("class", "thead-dark");
		jiraRow.setAttribute("class", "jiraSummaryRow");
		var jiraId = jiraRow.insertCell(0);
		jiraId.setAttribute("id", logSummery[i].key);
		jiraId.setAttribute("class", "jiraId");
		jiraId.setAttribute("colspan", "3");
		jiraId.innerHTML = "<strong><i>" + logSummery[i].key;
		+"</i><strong>"
		var totalWorkHours = jiraRow.insertCell(1);
		totalWorkHours.setAttribute("class", "totalWorkHours");
		totalWorkHours.innerHTML = "<strong>Total Work Hours: </strong><span class='badge badge-secondary'>"
				+ logSummery[i].totalHoursLogged + "</span>";
		for (var j = 0; j < logSummery[i].workLogDaySummeryTOs.length; j++) {
			var dayData = logSummery[i].workLogDaySummeryTOs[j];
			var day = tbody.insertRow(-1);
			day.setAttribute("class", "jiraDaySummaryRow");
			var date = day.insertCell(0);
			date.innerHTML = "<strong>"
					+ new Date(dayData.startDate.substr(0, dayData.startDate
							.indexOf('T'))).toDateString() + "</strong>";
			var currentTimeSpent = day.insertCell(1);
			currentTimeSpent.innerHTML = "<strong>Current Work Hours: </strong>"
					+ "<span class='badge badge-secondary'>"
					+ dayData.currentTimeSpent + "</span>";
			var loggedTimeSpent = day.insertCell(2);
			loggedTimeSpent.innerHTML = "<strong>Previous Work Hours: </strong>"
					+ "<span class='badge badge-secondary'>"
					+ dayData.loggedTime + "</span>";
			var totalWorkHours = day.insertCell(3);
			totalWorkHours.innerHTML = "<strong>Total Work Hours: </strong>"
					+ "<span class='badge badge-secondary'>"
					+ dayData.totalTimeSpent + "</span>";
		}
	}
	document.getElementById("body").appendChild(popup);
	clearResponse();
	clearProgressBar();
	popup.style.display = "block";
}

function submitWorkHours() {
	closePopup();
	document.getElementById("loader").style.display = "block";
	updateProgressBar("40%");
	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		if (200 === this.status) {
			updateProgressBar("100%");
			var response = JSON.parse(this.responseText);
			if (response && response.responseCode === 'W01') {
				updateProgressBar("100%")
				displaySuccessMessage(response.responseMessage);
				removeLoggedDates();
			} else {
				updateProgressBarWithError("100%");
				displayError(response.responseMessage);
			}
		} else if (400 === this.status) {
			var response = JSON.parse(this.responseText);
			updateProgressBarWithError("100%");
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
		clearProgressBarWithOutFooter();
	};
	xhr.open("POST", "http://" + window.location.hostname
			+ ":8090/taskmanagement/details/addWorkLog", true);
	xhr.setRequestHeader("Content-Type", "application/json");
	updateProgressBar("60%");
	xhr.send(JSON.stringify(workLogs));
}

function closePopup() {
	document.getElementById("popup").style.display = "none";
	document.getElementById("popupBody").innerHTML = "";
	document.getElementById("popupTitle").innerHTML = "";
}