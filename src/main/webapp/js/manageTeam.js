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

function addTeam(){
	var teamName = document.getElementById("teamName").value;
	if(teamName){
		updateProgressBar("10%");
		var xhr = new XMLHttpRequest();
		xhr.onload = function() {
			var response = JSON.parse(this.responseText);
			if (200 === this.status) {
				updateProgressBar("25%");
				if(response.responseCode == "T01"){
					document.getElementById("teamName").value = "";
					displaySuccessMessage(response.responseMessage);
					updateProgressBar("100%");
				}else{
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
		xhr.onError = function(){
			updateProgressBarWithError("100%");
			displayWarning("Failed to create the team. Please try after sometime.");
		}
		xhr.open("POST", "http://" + window.location.hostname
				+ ":8090/taskmanagement/userDetails/createTeam", true);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.send(teamName);
	}else{
		displayError("Please, Fill the team name.");
	}
}