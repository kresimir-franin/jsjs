var socket = io();
let currentRound;

socket.on('numberOfUsers', function(numberOfUsers) {
	$("#lblNumberOfUsers").html(numberOfUsers);
});

socket.on('result', function(result,userID,scoreList) {
	$("#btnSubmit").remove();

	if (result==true)
	{
		if (socket.id == userID)
			$("#divResult"+currentRound).html("<span>OK</span>");
		else
			$("#divResult"+currentRound).html("<span>Missed</span>");
	}
	else if (result==false){
			$("#divResult"+currentRound).html("<span>Failed</span>");
	}

	$('#lblScore').html(GetMyScore(socket.id,scoreList));
});

socket.on('newRound', function(newRound) {
	$("#btnSubmit").remove();
	currentRound=newRound.round;
	console.log(newRound);
	$("#roundsContainer").append("<div class='row'><div class='col-md-3'>"+currentRound+"</div><div class='col-md-3'>"+newRound.x+ "&nbsp;"+newRound.operation+"&nbsp"+newRound.y+	"</div><div class='col-md-3'><input type='text' id='round"+currentRound+"' style='width:50px;'/>&nbsp;<input type='button' id='btnSubmit' value='Submit'/> </div><div class='col-md-3' id='divResult"+currentRound+"'></div></div>"); 
});


$(document).on('click','#roundsContainer #btnSubmit',function(){
	socket.emit('result',currentRound, $("#round"+currentRound).val(),socket.id ); 
	console.log("sent");
});

function GetMyScore(userID,scoreList){
	objIndex = scoreList.findIndex((obj => obj.userID == userID));
	return scoreList[objIndex].value;
}
