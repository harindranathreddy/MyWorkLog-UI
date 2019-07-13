var userId = "";
var userObj = "";

function displayDetails(password, userObj) {
	sessionStorage.setItem("user", userObj.userId);
	sessionStorage.setItem("key", password);
	userId = userObj.userId;
	userObj = userObj;
	/*
	 * var now = new Date(); var minutes = 30; now.setTime(now.getTime() +
	 * (minutes * 60 * 1000)); document.cookie = "user =
	 * "+user+";expires="+now.toString(); document.cookie = "key =
	 * "+password+";expires="+now.toString();
	 */
	updateProgressBar("10%");
	modifyScreenContent(userObj);
}

function modifyScreenContent(user) {

	var dashboard = document.createElement("div");
	dashboard.id = "dashboard";
	dashboard.classList.add("list-group");
	dashboard.classList.add("list-group-flush");
	document.getElementById("body").appendChild(dashboard);
	var navBarLinks = document.createElement("div");
	navBarLinks.id = "navBarLinks";
	document.getElementById("headerNavBar").appendChild(navBarLinks);
	var myJira = document.createElement("button");
	myJira.id = "myJiraLink";
	myJira.classList.add("btn");
	myJira.classList.add("btn-link");
	myJira.classList.add("active");
	myJira.setAttribute("onClick","onMyJiraLinkClick()");
	myJira.innerHTML = "My Jira";
	navBarLinks.appendChild(myJira);
	var summary = document.createElement("button");
	summary.id = "summaryLink";
	summary.classList.add("btn");
	summary.classList.add("btn-link");
	summary.setAttribute("onClick","onSummaryLinkClick()");
	summary.innerHTML = "Summary";
	navBarLinks.appendChild(summary);
	var profile = document.createElement("button");
	profile.id = "profileLink";
	profile.classList.add("btn");
	profile.classList.add("btn-link");
	profile.setAttribute("onClick","onProfileLinkClick()");
	profile.innerHTML = "Profile";
	navBarLinks.appendChild(profile);
	if(user.role){
		var manageteam = document.createElement("button");
		manageteam.id = "manageTeamLink";
		manageteam.classList.add("btn");
		manageteam.classList.add("btn-link");
		manageteam.setAttribute("onClick","onManageTeamLinkClick()");
		manageteam.innerHTML = "Manage Team";
		navBarLinks.appendChild(manageteam);
	}
	var userIdDisplay = document.createElement("span");
	userIdDisplay.id = "userIdDisplay";
	userIdDisplay.classList.add("navbar-text");
	if(user.name){
		userIdDisplay.innerHTML = "<img id = 'userPhoto' src = "+ user.avatar +"> "+ user.name;
	}else{
		userIdDisplay.innerHTML =  user.userId;
	}
	document.getElementById("headerNavBar").appendChild(userIdDisplay);
	document.getElementById("body").appendChild(dashboard);
	updateProgressBar("20%");
	fetchJiraDetails(user.userId, loadJiraDetails);
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
			var jiraControls = document.createElement("div");
			var addWorkLogDay = document.createElement("IMG");
			addWorkLogDay.classList.add("addWorkLog")
			addWorkLogDay.setAttribute("src", "./images/add.png");
			addWorkLogDay.setAttribute("alt", "Add New Day");
			addWorkLogDay.setAttribute("title", "Add New Day");
			addWorkLogDay.setAttribute("onClick","addWorkLogDay(this.parentNode.parentNode)");
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
			key.innerHTML = "<strong>Jira: </strong><a href="+jiraDetails.jiraLink+" target='_blank' class='card-link'>" + jiraDetails.id + "</a>";
			details.appendChild(key);
			var status = document.createElement("div");
			status.id = "status";
			status.innerHTML = "<strong>Status: </strong><img src = "+ jiraDetails.statusIcon +"> "+ jiraDetails.status;
			details.appendChild(status);
			var type = document.createElement("div");
			type.id = "type";
			type.innerHTML = "<strong>Type: </strong><img src = "+ jiraDetails.issueIcon +"> " + jiraDetails.type;
			details.appendChild(type);
			var summery = document.createElement("div");
			summery.id = "summary";
			summery.innerHTML = "<strong>Summary: </strong>" + jiraDetails.summery;
			details.appendChild(summery);
			var workLogs = document.createElement("div");
			workLogs.id = "workLogs";
			workLogs.classList.add("row");
			jira.appendChild(workLogs);
			document.getElementById("dashboard").appendChild(jira);
			var unLoggedDates = getUnLoggedDates(jiraDetails.lastLoggedDate,workLogs,addWorkLogComponent);
			
		} 
		if(jiraDetailsList.length == 0){
			displayInfo("No cards assigned to you.");
		}
		document.getElementById("logWork").classList.remove("disabled");
		updateProgressBar("100%");
		clearProgressBar();
	}catch(err) {
		updateProgressBarWithError("100%");
		displayError("Failed to load. Please contact the administrator.");
	}
	$("#loader").fadeOut("slow");
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
				date.innerHTML = "<strong>" + new Date(datesArray[datesArray.length-1]).toDateString() + "</strong>";
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
					date.innerHTML = "<strong>" + new Date(datesArray[i]).toDateString() + "</strong>";
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
					
				}
			}
		}
	}catch(err) {
		updateProgressBarWithError("100%");
		displayError("Failed to load. Please contact the administrator.");
	}
}

var loggedDivs = [];

function logWork() {
	document.getElementById("loader").style.display = "block";
	updateProgressBar("5%");
	var logs = {};
	logs.userName = sessionStorage.getItem("user");
	logs.password = sessionStorage.getItem("key");
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
		verifyLoggedWork(logs);
	} else {
		displayWarning("Please input timelog before submit.");
		updateProgressBarWithError("100%");
		clearProgressBar();
		$("#loader").fadeOut("slow");
	}
}

function getWorkLog(jira) {
	var workLogs = [];
	for (var i = 0; i < jira.lastElementChild.childNodes.length; i++) {
		if (jira.lastElementChild.childNodes[i].className.match("workLog") && jira.lastElementChild.childNodes[i].childNodes[1].value != "") {
			var workLog = {};
			loggedDivs.push(jira.lastElementChild.childNodes[i]);
			workLog.id = jira.childNodes[1].childNodes[0].innerText
					.substring(6);
			var startDate = new Date(
					jira.lastElementChild.childNodes[i].childNodes[0].innerText);
			if(new Date(startDate) != "Invalid Date"){
				workLog.started = startDate.getFullYear() + "-"
				+ (startDate.getMonth() + 1) + "-" + startDate.getDate()
				+ "T09:00:00.000-0500";
				workLog.timeSpent = jira.lastElementChild.childNodes[i].childNodes[1].value;
				workLog.comment = jira.lastElementChild.childNodes[i].childNodes[2].value;
			}else{
				workLog.started = jira.lastElementChild.childNodes[i].childNodes[0].nextElementSibling.value+"T09:00:00.000-0500";
				workLog.timeSpent = jira.lastElementChild.children[i].children[1].value;
				workLog.comment = jira.lastElementChild.children[i].children[2].value;
			}
			workLogs.push(workLog);
		}
	}
	if (workLogs.length > 0) {
		return workLogs;
	}
	return null;
}

function verifyLoggedWork(logs) {
	updateProgressBar("40%");
	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		if (200 === this.status) {
			updateProgressBar("100%");
			var response = JSON.parse(this.responseText);
			if(response && response.responseCode === 'WLV02'){
				updateProgressBar("100%");
				diplayLogSummaryPopup(logs,response.responseData);
			}else {
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
	};
	xhr.onerror = function(e) {
		updateProgressBarWithError("100%");
		displayError("Unknown Error Occured. Server response not received. Please contact Administrator.");
		clearProgressBarWithOutFooter();
	};
	xhr.open("POST", "http://" + window.location.hostname
			+ ":8090/taskmanagement/details/getWorkLogVerificationSummary", true);
	xhr.setRequestHeader("Content-Type", "application/json");
	updateProgressBar("60%");
	xhr.send(JSON.stringify(logs));
}

function getUnLoggedDates(lastLoggedDates,workLogs,callback){
	if(lastLoggedDates === "0"){
		callback(workLogs,null);
		return;
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

function addSearchedJira(){
	var jiraId = document.getElementById("addJiraInput").value;
	if(jiraId !== ""){
		document.getElementById("loader").style.display = "block";
		document.getElementsByClassName("progress-bar")[0].style.width = "10%";
		var data = "issueKey=" + jiraId + "&userId=" + userId;
		var xhr = new XMLHttpRequest();
		xhr.onload = function() {
			var response = JSON.parse(this.responseText);
			if (200 === this.status) {
				updateProgressBar("25%");
				if(response.responseCode == "JS04"){
					var jiraDetailsList = response.responseData;
					loadJiraDetails(jiraDetailsList);
					document.getElementById("addJiraInput").value = "";
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
	cross.parentNode.parentNode.parentNode.removeChild(cross.parentNode.parentNode);
}

function removeLoggedDates(){
	for(var i = 0; i< loggedDivs.length;i++){
		loggedDivs[i].parentElement.removeChild(loggedDivs[i])
	}
}

function addWorkLogDay(jiraComponent){
	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		var response = this.responseXML;
		if(jiraComponent.childNodes[2].lastChild.classList.contains('alert')){
			jiraComponent.childNodes[2].removeChild(jiraComponent.childNodes[2].lastChild);
		}
		jiraComponent.childNodes[2].appendChild(response.getElementById("workLog"));
		var currentdate = new Date()
		var month = parseInt(currentdate.getMonth()+1);
		if(month < 10){
			month = "0" + month;
		}
		var date = parseInt(currentdate.getDate());
		if(date < 10){
			date = "0" + date;
		}
		var maxdate = currentdate.getFullYear() +"-"+ month + "-"+date;
		jiraComponent.getElementsByClassName("workLog")[jiraComponent.getElementsByClassName("workLog").length-1].firstElementChild.setAttribute("max",maxdate+"T23:59");
	};
	xhr.open("GET", "./html/WorkLog.html", true);
	xhr.responseType = "document";
	xhr.send();
}

function onMyJiraLinkClick(){
	if(document.getElementById("userSummary")){
		document.getElementById("body").removeChild(
				document.getElementById("userSummary"));
	}else if(document.getElementById("userProfile")){
		document.getElementById("body").removeChild(
				document.getElementById("userProfile"));
	}else if(document.getElementById("manageTeam")){
		document.getElementById("body").removeChild(
				document.getElementById("manageTeam"));
	}
	document.getElementById("dashboard").style.display = "block";
	document.getElementById("addJiraComponent").removeAttribute("style");
	document.getElementById("logWork").removeAttribute("disabled");
}