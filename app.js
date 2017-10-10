const roundGenerator = require('./roundGenerator');
const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const app = express();
const server = http.Server(app);
const io = socketIO(server);

app.set('port', 5000);
app.use('/static', express.static(
	__dirname + '/static')
);

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

// Starts the server
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});

let scoreList=[];
let roundsList=[];

// Add the WebSocket handlers
io.on('connection', function(socket) {
	io.sockets.emit('numberOfUsers', io.engine.clientsCount);
	addToScoreList(socket.id);
	
	// Show last active round or create new if game just started
	if (roundsList.length > 0) {
		socket.emit("newRound", roundsList[roundsList.length-1]);
	} else {
        startNewRound();
    }
  
	socket.on('disconnect', function() {
		io.sockets.emit('numberOfUsers', io.engine.clientsCount);
	});

	socket.on('result', function (round, result, userID) {
		updateNumberPlayed(round, userID);
	   // Call function to check correctness
        if (isCorrect(round, result)) {
		   console.log("Updating");
		   updateScoreList(userID);
		   // Broadcast response to all if correct
		   io.sockets.emit('result', true, userID, scoreList);
           startNewRound();
       }
	   else {
		   socket.emit('result', false, userID, scoreList);
		   if (roundsList[round-1].numberPlayed == io.engine.clientsCount) {
               startNewRound();
		   }
	   }	  
	});	
});

function isCorrect(round, result) {
	return roundsList[round-1].correctResult == result;
}

function updateScoreList(userID) {
	if (scoreList.findIndex((obj => obj.userID == userID)) != -1) {
		objIndex = scoreList.findIndex((obj => obj.userID == userID));
		scoreList[objIndex].value += 1;
	}
}

function addToScoreList(userID) {
	if (scoreList.findIndex((obj => obj.userID == userID)) === -1) {
		scoreList.push(
			{
				userID: userID,
				value: 0
			}
		);
	}
}

function updateNumberPlayed(round) {
	roundsList[round-1].numberPlayed+=1;
}

function startNewRound() {
    let newRound = roundGenerator.createRound();
    roundsList.push(newRound);
    io.sockets.emit('newRound', newRound);
}
