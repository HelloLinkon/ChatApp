var app = require('express')();
var server = require('http').Server(app);

var io = require('socket.io')(server);

var path = require('path');

server.listen(3000);

var users = names = {};



app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});




function logdata(msg){
	var d = new Date();
	var time = '['+d.getHours()+ ':'+ 
		d.getMinutes()+':'+ d.getSeconds()+']';

	console.log(time + msg);	
}


logdata("chat server has booted");

io.on('connection', function(socket){
	
	socket.on('join', function(user){
		logdata(user[2] + "A user has connected" + user[1]);
		socket.UserId = user[1];
		socket.UserName = user[2];

		users[user[1]] = socket;
		names[user[1]] = {
			'name' : user[2],
			'socketid' : socket.id 
		}

		function updateNames(){
			io.emit('chat.' + user[0] + '.names', names);
		}

		updateNames();

		socket.on('chat', function(playload){
			io.emit('chat.' + playload[0], playload);
		});

		socket.on('disconnect', function(){
			if(!socket.name) return;

			delete users[user[1]];
			delete names[user[1]];

			updateNames();
		});

	});
});




















