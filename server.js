// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});

let scoreList=[];
let roundsList=[];

// Add the WebSocket handlers
io.on('connection', function(socket) {

	io.sockets.emit('numberOfUsers',io.engine.clientsCount);
	AddToScoreList(socket.id);
	
	//Show last active round or create new if game just started
	if (roundsList.length>0)
	{
		socket.emit("newRound",roundsList[roundsList.length-1]);
	}
	else
	{
		socket.emit("newRound",CreateRound());
	}
  
	socket.on('disconnect', function(){
		io.sockets.emit('numberOfUsers',io.engine.clientsCount);
	});

	socket.on('result', function (round,result,userID) {
		
		UpdateNumberPlayed(round,userID);
		
	   //Call function to check correctness
	   if(IsCorrect(round,result))
	   {
		   console.log("Updating");
		   UpdateScoreList(userID);		   
		   
		   //Broadcast response to all if correct
		   io.sockets.emit('result',true, userID,scoreList);		   		   
		   
		    //Broadcast new round
		   let newRound = CreateRound();
		   io.sockets.emit('newRound',newRound);
	   }
	   else
	   {
		   //Send response to client if incorrect
		   socket.emit('result',false,userID,scoreList);	

		   if(roundsList[round-1].numberPlayed == io.engine.clientsCount)
		   {
				//Broadcast new round
				let newRound = CreateRound();
				io.sockets.emit('newRound',newRound);
		   }
	   }	  
	});	
});

var IsCorrect = function(round,result)
{
	return roundsList[round-1].correctResult == result;
}

function CreateRound()
{
	let roundNum = roundsList.length+1;
	let _x= Math.floor(Math.random() * 10);
	let _y= Math.floor(Math.random() * 10);
	let operations=['+','-','*','/'];
	let operationIndex = Math.floor(Math.random() * 3);
	let _operation = operations[operationIndex];

	let round={
		round:roundNum,
		x:_x,
		y:_y,
		operation:_operation,
		numberPlayed:0,
		correctResult: function(operationIndex){
			switch(operationIndex){
				case 0:
					console.log(_x+_y);
					return _x+_y;
					break;
				case 1:
					return _x-_y;
					break;
				case 2:
					return _x*_y;
					break;
				case 3:
					return _x/_y;
					break;
			}
		}(operationIndex)
	};
	
	roundsList.push(round);
	
	return round;
}

function UpdateScoreList(userID){

	if (scoreList.findIndex((obj => obj.userID == userID))!=-1)
	{
		objIndex = scoreList.findIndex((obj => obj.userID == userID));
		scoreList[objIndex].value += 1;
	}
}

function AddToScoreList(userID){

	if (scoreList.findIndex((obj => obj.userID == userID))===-1)
	{
		scoreList.push({userID:userID,value:0});
	}
}

function UpdateNumberPlayed(round,userID){
	roundsList[round-1].numberPlayed+=1;
}


