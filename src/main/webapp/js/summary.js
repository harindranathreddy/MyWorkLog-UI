function onSummaryLinkClick() {
	if (document.getElementById("userSummary") == null) {
		document.getElementById("loader").style.display = "block";
		document.getElementById("addJiraComponent").style.display = "none";
		if (document.getElementById("userProfile")) {
			document.getElementById("body").removeChild(
					document.getElementById("userProfile"));
		} else if (document.getElementById("manageTeam")) {
			document.getElementById("body").removeChild(
					document.getElementById("manageTeam"));
		} else if (document.getElementById("teamJiraDashboard")) {
			document.getElementById("body").removeChild(
					document.getElementById("teamJiraDashboard"));
		} else if (document.getElementById("teamSummary")) {
			document.getElementById("body").removeChild(
					document.getElementById("teamSummary"));
		}
		// document.getElementById("logWork").style.display = "none";
		document.getElementById("logWork").setAttribute("disabled", "");
		var dashboard = document.getElementById("dashboard");
		localStorage['dashboard'] = dashboard;
		getSummaryComponent(loadSummary);
	}
}

function getSummaryComponent(callback) {
	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		var response = this.responseXML;
		if (response) {
			callback(response.getElementById("userSummary"));
		} else {
			displayError("Failed to load. Please contact the administrator and try page refresh(F5)");
		}
	};
	xhr.open("GET", "./html/Summary.html", true);
	xhr.responseType = "document";
	xhr.send();
}
function loadSummaryOnClick() {
	var days = document.getElementById("noOfDays").value;
	if (days != "" && days >= 0) {
		document.getElementById("loader").style.display = "block";
		updateProgressBar("10%");
		document.getElementById("summaryTableBody").innerHTML = "";
		document.getElementById("userSummaryChart").remove();
		document.getElementById("summaryDaysHeading").innerHTML = "Summary for "
				+ days + " day(s).";
		var canvas = document.createElement("canvas");
		canvas.id = "userSummaryChart";
		canvas.setAttribute("height", "300");
		canvas.setAttribute("width", "800");
		document.getElementById("summaryChart").appendChild(canvas);
		fetchSummaryDetails(days, loadSummaryTable);
		document.getElementById("noOfDays").value = "";
	} else {
		displayWarning("Please, Enter no of days greater than or equal to 0.");
	}
}
function loadSummary(summaryComponent) {
	document.getElementById("dashboard").style.display = "none";
	document.getElementById("body").appendChild(summaryComponent);
	fetchSummaryDetails(7, loadSummaryTable);
}

function fetchSummaryDetails(noOfDays, callback) {
	try {
		document.getElementsByClassName("progress-bar")[0].style.width = "10%";
		var data = "userId=" + sessionStorage.getItem("user") + "&noOfDays="
				+ noOfDays;
		var xhr = new XMLHttpRequest();
		xhr.onload = function() {
			var response = JSON.parse(this.responseText);
			if (200 === this.status) {
				updateProgressBar("25%");
				if (response.responseCode == "US01") {
					var jiraSummaryDetailsList = response.responseData;
					callback(jiraSummaryDetailsList);
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
function loadSummaryTable(jiraSummaryDetailsList) {
	updateProgressBar("50%");
	var table = document.getElementById("summaryTable");
	var tbody = table.getElementsByTagName("tbody").summaryTableBody;
	if (jiraSummaryDetailsList) {
		for (var i = 0; i < jiraSummaryDetailsList.length; i++) {
			var jiraRow = tbody.insertRow(-1);
			jiraRow.setAttribute("id", jiraSummaryDetailsList[i].key);
			jiraRow.setAttribute("class", "table-active");
			jiraRow.setAttribute("class", "thead-dark");
			jiraRow.setAttribute("class", "jiraSummaryRow");
			var jiraId = jiraRow.insertCell(0);
			jiraId.setAttribute("id", jiraSummaryDetailsList[i].key);
			jiraId.setAttribute("class", "jiraId");
			jiraId.innerHTML = "<strong><i>"
					+ "<a href=https://jira2.cerner.com/browse/"
					+ jiraSummaryDetailsList[i].key
					+ " target='_blank' class='card-link'>"
					+ jiraSummaryDetailsList[i].key + "</i><strong>";
			var jiraId = jiraRow.insertCell(1);
			jiraId.setAttribute("jiraSummary", jiraSummaryDetailsList[i].key);
			jiraId.setAttribute("class", "jiraSummary");
			jiraId.innerHTML = "<strong><i>"
					+ jiraSummaryDetailsList[i].summary + "</i><strong>";
			var totalWorkHours = jiraRow.insertCell(2);
			totalWorkHours.setAttribute("class", "totalWorkHours");
			totalWorkHours.innerHTML = "<strong>Total Hours: </strong><span class='badge badge-secondary'>"
					+ jiraSummaryDetailsList[i].totalHoursLogged + "</span>";
			for (var j = 0; j < jiraSummaryDetailsList[i].workLogDaySummeryTOs.length; j++) {
				var dayData = jiraSummaryDetailsList[i].workLogDaySummeryTOs[j];
				if (dayData) {
					var day = tbody.insertRow(-1);
					day.setAttribute("class", "jiraDaySummaryRow");
					var date = day.insertCell(0);
					date.setAttribute("class", "date");
					date.innerHTML = new Date(dayData.startDate.substr(0,
							dayData.startDate.indexOf('T'))).toDateString();
					var comments = day.insertCell(1);
					comments.setAttribute("data-toggle", "tooltip");
					comments.setAttribute("data-placement", "top");
					comments.setAttribute("title", dayData.comments);
					comments.setAttribute("class", "dayComments");
					if (dayData.comments.length > 100) {
						comments.innerHTML = dayData.comments.substring(0, 97)
								+ "...";
					} else {
						comments.innerHTML = dayData.comments;
					}
					var totalWorkHours = day.insertCell(2);
					totalWorkHours.setAttribute("class", "totalWorkHours");
					totalWorkHours.innerHTML = "Total Hours: "
							+ "<span class='badge badge-secondary'>"
							+ dayData.totalTimeSpent + "</span>";
				}
			}
		}
	}
	updateProgressBar("100%");
	displaySuccessMessage("Summary Loaded Succesuffly");
	clearProgressBar();

}

function loadGraphSummary(noOfDays, jiraSummaryDetailsList) {
	if (noOfDays <= 365) {
		fetchGraphSummaryData(noOfDays, jiraSummaryDetailsList, renderGraph);
	} else {
		fetchGraphSummaryData(noOfDays, jiraSummaryDetailsList, renderLineGraph);
	}
}

function fetchGraphSummaryData(noOfDays, jiraSummaryDetailsList, callback) {
	try {
		var data = {
			noOfDays : noOfDays,
			jiraSummaryDetails : jiraSummaryDetailsList
		};
		updateProgressBar("40%");
		var xhr = new XMLHttpRequest();
		xhr.onload = function() {
			if (200 === this.status) {
				updateProgressBar("100%");
				var response = JSON.parse(this.responseText);
				if (response && response.responseCode === 'UGD01') {
					callback(response.responseData);
				} else {
					displayError(response.responseMessage);
				}
			} else if (400 === this.status) {
				var response = JSON.parse(this.responseText);
				displayError(response.responseMessage);
			} else {
				displayError("Error occured. Please try after sometime");
			}
		};
		xhr.onerror = function(e) {
			updateProgressBarWithError("100%");
			displayError("Unknown Error Occured. Server response not received. Please contact Administrator.");
			clearProgressBar();
		};
		xhr.open("POST", "http://" + window.location.hostname
				+ ":8090/taskmanagement/details/getUserSummaryGraphData", true);
		xhr.setRequestHeader("Content-Type", "application/json");
		updateProgressBar("60%");
		xhr.send(JSON.stringify(data));
	} catch (err) {
		updateProgressBarWithError("100%");
		displayError("Failed to load. Please contact the administrator.");
		$("#loader").fadeOut("slow");
	}
}

function renderGraph(data) {
	var labels = [];
	for (var i = 0; i < data.labels.length; i++) {
		labels.push(new Date(data.labels[i]).toDateString());
	}
	data.labels = labels;
	var ctx = document.getElementById("userSummaryChart");
	var mixedChart = new Chart(ctx, {
		type : 'bar',
		data : data,
		options : {
			legend: {
		        display: false
		    },scales : {
				xAxes : [ {
					stacked : true
				} ],
				yAxes : [ {
					stacked : true
				} ]
			},
			tooltips : {
				position : 'nearest'
			}
		}
	});
}

function renderLineGraph(data) {
	var labels = [];
	for (var i = 0; i < data.labels.length; i++) {
		labels.push(new Date(data.labels[i]).toDateString());
	}
	data.labels = labels;
	var ctx = document.getElementById("userSummaryChart");
	var mixedChart = new Chart(ctx, {
		type : 'line',
		data : data,
		options : {
			legend: {
		        display: false
		    },scales : {
				xAxes : [ {
					stacked : true
				} ],
				yAxes : [ {
					stacked : true
				} ]
			},
			tooltips : {
				position : 'nearest'
			}
		}
	});
}