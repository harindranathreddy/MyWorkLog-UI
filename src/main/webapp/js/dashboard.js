function displayDetails(user, password) {
	sessionStorage.setItem("user", user);
	sessionStorage.setItem("key", btoa(password));
	clearScreen(user, modifyScreenContent);
}

function clearScreen(user, callback) {
	document.getElementById("body").removeChild(
			document.getElementById("login"));
	callback(user);
}

function modifyScreenContent(user) {

	var dashboard = document.createElement("div");
	dashboard.id = "dashboard";
	dashboard.classList.add("list-group");
	dashboard.classList.add("list-group-flush");
	document.getElementById("body").appendChild(dashboard);
	var userIdDisplay = document.createElement("span");
	userIdDisplay.id = "userIdDisplay";
	userIdDisplay.classList.add("navbar-text");
	userIdDisplay.innerHTML = user;
	document.getElementById("headerNavBar").appendChild(userIdDisplay);
	document.getElementById("body").appendChild(dashboard);
	document.getElementById("footer").style.display = "block";
	fetchJiraDetails(user, loadJiraDetails);
}

function fetchJiraDetails(user, callback) {
	var data = "userId=" + user;
	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		var response = JSON.parse(this.responseText);
		if (200 === this.status) {
			var jiraDetailsList = response.responseData;
			callback(jiraDetailsList);
		} else {
			document.getElementById("dashboard").innerHTML = response.responseMessage;
		}
	};
	xhr.open("GET", "http://" + window.location.hostname
			+ ":8090/taskmanagement/details/jiraDetailsByUserId?" + data, true);
	xhr.send();
}

function loadJiraDetails(jiraDetailsList) {
	for (var i = 0; i < jiraDetailsList.length; i++) {
		var jiraDetails = jiraDetailsList[i];
		var jira = document.createElement("div");
		jira.id = "jira";
		jira.classList.add("list-group-item");
		var details = document.createElement("div");
		details.id = "details";
		details.classList.add("card-body");
		details.classList.add("row");
		jira.appendChild(details);
		var key = document.createElement("div");
		key.id = "key";
		key.innerHTML = "<b>Jira: </b>" + jiraDetails.id;
		key.classList.add("card-title");
		key.classList.add("col");
		details.appendChild(key);
		var summery = document.createElement("div");
		summery.id = "summery";
		summery.innerHTML = "<b>Summery: </b>" + jiraDetails.summery;
		summery.classList.add("card-text");
		summery.classList.add("col-md");
		details.appendChild(summery);
		var status = document.createElement("div");
		status.id = "status";
		status.classList.add("card-text");
		status.classList.add("col");
		status.innerHTML = "<b>Status: </b>" + jiraDetails.status;
		details.appendChild(status);
		var type = document.createElement("div");
		type.id = "type";
		type.innerHTML = "<b>Type: </b>" + jiraDetails.type;
		type.classList.add("card-text");
		type.classList.add("col");
		details.appendChild(type);
		var workLogs = document.createElement("div");
		workLogs.id = "workLogs";
		workLogs.classList.add("row");
		jira.appendChild(workLogs);
		document.getElementById("dashboard").appendChild(jira);
		var unLoggedDates = getUnLoggedDates(jiraDetails.lastLoggedDate,workLogs,addWorkLogComponent);
		
	}
	document.getElementById("logWork").classList.remove("disabled");
}

function addWorkLogComponent(workLogs,dates){
	if( dates!=null && dates.length === 0 ){
		var workLog = document.createElement("div");
		workLog.id = "workLog";
		workLog.classList.add("col");
		workLog.classList.add("alert");
		workLog.classList.add("alert-info");
		workLog.innerHTML = "Work in this card is updated today.";
		workLogs.appendChild(workLog);
	}else if(dates === null || dates === undefined){
		var workLog = document.createElement("div");
		workLog.id = "workLog";
		workLog.classList.add("col");
		workLog.classList.add("alert");
		workLog.classList.add("alert-warning");
		workLog.innerHTML = "Work is never logged in this card.";
		workLogs.appendChild(workLog);
	}else{
		var datesArray = dates.split(",");
		if( datesArray.length > 10 ){
			var workLog = document.createElement("div");
			workLog.id = "workLog";
			workLog.classList.add("col");
			workLog.classList.add("alert");
			workLog.classList.add("alert-warning");
			workLog.innerHTML = "Work is not progress from "+ datesArray.length + "day(s). Please review the card in jira application.";
			workLogs.appendChild(workLog);
		}else{
			for (var i = 0; i < datesArray.length; i++) {
				var workLog = document.createElement("div");
				workLog.id = "workLog";
				workLog.classList.add("workLog");
				var date = document.createElement("div");
				date.id = "date";
				date.classList.add("card-header");
				date.innerHTML = "<b>" + new Date(datesArray[i]).toDateString() + "</b>";
				workLog.appendChild(date);
				var workHours = document.createElement("input");
				workHours.id = "workHours";
				workHours.placeholder = "Work Hours";
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
				
			}
		}
	}
	
}

function logWork() {
	var logs = {};
	logs.userName = sessionStorage.getItem("user");
	logs.password = atob(sessionStorage.getItem("key"));
	logs.worklogs = [];
	var dashboard = document.getElementById("dashboard");
	var jiras = dashboard.childNodes;
	for (var i = 0; i < jiras.length; i++) {
		var workLog = getWorkLog(jiras[i]);
		if (workLog) {
			logs.worklogs.push(...workLog);
		}
	}
	if (logs.worklogs.length > 0) {
		logWorkInJira(logs);
	} else {
		displayWarning("Please input timelog before submit.");
	}
}

function getWorkLog(jira) {
	var workLogs = [];
	for (var i = 0; i < jira.lastElementChild.childNodes.length; i++) {
		if (jira.lastElementChild.childNodes[i].className.match("workLog") && jira.lastElementChild.childNodes[i].childNodes[1].value != "") {
			var workLog = {};
			workLog.id = jira.firstElementChild.childNodes[0].innerText
					.substring(6);
			var startDate = new Date(
					jira.lastElementChild.childNodes[i].childNodes[0].innerText);
			workLog.started = startDate.getFullYear() + "-"
					+ (startDate.getMonth() + 1) + "-" + startDate.getDate()
					+ "T09:00:00.000-0500";
			workLog.timeSpent = jira.lastElementChild.childNodes[i].childNodes[1].value;
			workLog.comment = jira.lastElementChild.childNodes[i].childNodes[2].value;
			workLogs.push(workLog);
		}
	}
	if (workLogs.length > 0) {
		return workLogs;
	}
	return null;
}

function logWorkInJira(logs) {
	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		if (200 === this.status) {
			var response = JSON.parse(this.responseText);
			if (response && response.responseCode === 'W01') {
				displaySuccessMessage(response.responseMessage);
			} else {
				displayWarning(response.responseMessage);
			}
		} else if (400 === this.status) {
			var response = JSON.parse(this.responseText);
				displayError(response.responseMessage);
		} else {
			displayError("Error occured. Please try after sometime");
		}

	};
	xhr.open("POST", "http://" + window.location.hostname
			+ ":8090/taskmanagement/details/addWorkLog", true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.send(JSON.stringify(logs));
}

function getUnLoggedDates(lastLoggedDates,workLogs,callback){
	if(lastLoggedDates === "0"){
		callback(workLogs,null);
	}
	var data = "lastLoggedDate=" + lastLoggedDates;
	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		var response = JSON.parse(this.responseText);
		if (200 === this.status) {
			if(response.responseData !== null && response.responseCode === "D01"){
				callback(workLogs,response.responseData.toString());
			}else if(response.responseCode === "D02"){
				callback(workLogs,[]);
			}else{
				callback(workLogs,null);
			}
		}
	};
	xhr.open("GET", "http://" + window.location.hostname
			+ ":8090/taskmanagement/details/getDates?" + data, true);
	xhr.send();
}