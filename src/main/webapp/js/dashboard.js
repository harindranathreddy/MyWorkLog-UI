function displayDetails(user, password) {
	sessionStorage.setItem("user", user);
	sessionStorage.setItem("key", btoa(password));
	var now = new Date();
    var minutes = 30;
    now.setTime(now.getTime() + (minutes * 60 * 1000));
	document.cookie = "user = "+user+";expires="+now.toString();
	document.cookie = "key = "+btoa(password)+";expires="+now.toString();
	updateProgressBar("10%");
	modifyScreenContent(user);
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
	updateProgressBar("20%");
	fetchJiraDetails(user, loadJiraDetails);
}

function fetchJiraDetails(user, callback) {
	var data = "userId=" + user;
	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		var response = JSON.parse(this.responseText);
		if (200 === this.status) {
			var jiraDetailsList = response.responseData;
			updateProgressBar("30%");
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
	try {
		updateProgressBar("50%")
		for (var i = 0; i < jiraDetailsList.length; i++) {
			var jiraDetails = jiraDetailsList[i];
			var jira = document.createElement("div");
			jira.id = "jira";
			jira.classList.add("list-group-item");
			jira.classList.add(jiraDetails.id);
			var cross = document.createElement("button");
			cross.type = "button";
			cross.setAttribute("aria-label", "Close");
			cross.classList.add("removeJira");
			cross.classList.add("Close");
			cross.setAttribute("onClick", "removeJiraDiv(this)");
			cross.innerHTML = "<span aria-hidden='true'>&times;</span>";
			jira.appendChild(cross);
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
			summery.id = "summary";
			summery.innerHTML = "<b>Summary: </b>" + jiraDetails.summery;
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
		updateProgressBar("100%");
		clearProgressBar();
	}catch(err) {
		updateProgressBarWithError("100%");
		displayError("Failed to load. Please contact the administrator.");
	}
}

function addWorkLogComponent(workLogs,dates){
	try{
		if( dates!=null && dates.length === 0 ){
			var workLogComment = document.createElement("div");
			workLogComment.id = "workLog";
			workLogComment.classList.add("col");
			workLogComment.classList.add("alert");
			workLogComment.classList.add("alert-info");
			workLogComment.innerHTML = "Work in this card is updated today.";
			workLogs.appendChild(workLogComment);
		}else if(dates === null || dates === undefined){
			var workLog = document.createElement("div");
			workLog.id = "workLog";
			workLog.classList.add("workLog");
			var date = document.createElement("div");
			date.id = "date";
			date.classList.add("card-header");
			date.innerHTML = "<b>" + new Date().toDateString() + "</b>";
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
			var workLogComment = document.createElement("div");
			workLogComment.id = "workLog";
			workLogComment.classList.add("col");
			workLogComment.classList.add("alert");
			workLogComment.classList.add("alert-warning");
			workLogComment.innerHTML = "Work is never logged in this card.If you want to log work hours for today, you can log in worklog component available.";
			workLogs.appendChild(workLogComment);
		}else{
			var datesArray = dates.split(",");
			if( datesArray.length > 10 ){
				var workLog = document.createElement("div");
				workLog.id = "workLog";
				workLog.classList.add("workLog");
				var date = document.createElement("div");
				date.id = "date";
				date.classList.add("card-header");
				date.innerHTML = "<b>" + new Date(datesArray[datesArray.length-1]).toDateString() + "</b>";
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
				var workLogComment = document.createElement("div");
				workLogComment.id = "workLog";
				workLogComment.classList.add("col");
				workLogComment.classList.add("alert");
				workLogComment.classList.add("alert-warning");
				workLogComment.innerHTML = "Work is not progress from "+ datesArray.length + " day(s). Please review the card in jira application. If you want to log work hours for today, you can log in worklog component available.";
				workLogs.appendChild(workLogComment);
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
	}catch(err) {
		updateProgressBarWithError("100%");
		displayError("Failed to load. Please contact the administrator.");
	}
}

function logWork() {
	updateProgressBar("5%");
	var logs = {};
	logs.userName = sessionStorage.getItem("user");
	logs.password = atob(sessionStorage.getItem("key"));
	logs.worklogs = [];
	var dashboard = document.getElementById("dashboard");
	var jiras = dashboard.childNodes;
	updateProgressBar("10%");
	for (var i = 0; i < jiras.length; i++) {
		var workLog = getWorkLog(jiras[i]);
		if (workLog) {
			logs.worklogs.push(...workLog);
		}
	}
	updateProgressBar("25%");
	if (logs.worklogs.length > 0) {
		logWorkInJira(logs);
	} else {
		displayWarning("Please input timelog before submit.");
		clearProgressBar();
	}
}

function getWorkLog(jira) {
	var workLogs = [];
	for (var i = 0; i < jira.lastElementChild.childNodes.length; i++) {
		if (jira.lastElementChild.childNodes[i].className.match("workLog") && jira.lastElementChild.childNodes[i].childNodes[1].value != "") {
			var workLog = {};
			workLog.id = jira.childNodes[1].childNodes[0].innerText
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
	updateProgressBar("40%");
	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		if (200 === this.status) {
			updateProgressBar("100%");
			var response = JSON.parse(this.responseText);
			if (response && response.responseCode === 'W01') {
				displaySuccessMessage(response.responseMessage);
			} else {
				updateProgressBarWithError("100%");
				displayWarning(response.responseMessage);
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

	};
	xhr.open("POST", "http://" + window.location.hostname
			+ ":8090/taskmanagement/details/addWorkLog", true);
	xhr.setRequestHeader("Content-Type", "application/json");
	updateProgressBar("60%");
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
				document.getElementById("body").removeChild(
						document.getElementById("workLog"));
				callback(workLogs,[]);
			}else{
				document.getElementById("body").removeChild(
						document.getElementById("workLog"));
				callback(workLogs,null);
			}
		}
	};
	xhr.open("GET", "http://" + window.location.hostname
			+ ":8090/taskmanagement/details/getDates?" + data, true);
	xhr.send();
}

function addSearchedJira(){
	var jiraId = document.getElementById("addJiraInput").value;
	if(jiraId !== ""){
		document.getElementsByClassName("progress-bar")[0].style.width = "10%";
		var data = "issueKey=" + jiraId;
		var xhr = new XMLHttpRequest();
		xhr.onload = function() {
			var response = JSON.parse(this.responseText);
			if (200 === this.status) {
				updateProgressBar("25%");
				if(response.responseCode == "JS04"){
					var jiraDetailsList = response.responseData;
					loadJiraDetails(jiraDetailsList);
				}else{
					updateProgressBarWithError("100%");
					displayWarning(response.responseMessage);
				}
			} else {
				updateProgressBarWithError("100%");
				displayError(response.responseMessage);
			}
			clearProgressBar();
		};
		xhr.open("GET", "http://" + window.location.hostname
				+ ":8090/taskmanagement/details/jiraDetailsByJiraId?" + data, true);
		xhr.send();
	}else{
		displayWarning("Please enter the jira number.");
	}
}

function removeJiraDiv(cross){
	cross.parentNode.parentNode.removeChild(cross.parentNode);
}