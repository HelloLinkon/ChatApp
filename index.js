var app = require('express')();
var server = require('http').Server(app);
var mongo = require('mongodb').MongoClient;
var io = require('socket.io')(server);

var path = require('path');



mongo.connect('mongodb://127.0.0.1/chatapp4', function(err, db){

	if(err)
	{
		throw err;
	}

	console.log("mongo connected");


		io.on('connection', function(socket){
			

			var chat = db.collection('chats');

			


			socket.on('join', function(user){
				logdata(user[2] + "A user has connected" + user[1]);
				socket.UserId = user[1];
				socket.UserName = user[2];

				users[user[1]] = socket;
				names[user[1]] = {
					'name' : user[2],
					'socketid' : socket.id 
				}

				chat.find().limit(100).sort({_id:1}).toArray(function(err, res){

					if(err)
						throw err;

					io.emit('chat.some', {"res": res, "id": user[1]});

					console.log("response: " + res);
				});

				function updateNames(){
					io.emit('chat.' + user[0] + '.names', names);
				}

				updateNames();

				socket.on('chat', function(playload){

					
					io.emit('chat', playload);

					console.log("user send: " + playload);

					chat.insert(playload, function(){
						console.log("data inserted");
					});
				});

				socket.on('disconnect', function(){
					if(!socket.name) return;

					delete users[user[1]];
					delete names[user[1]];

					updateNames();
				});

			});
		});

});


server.listen(3000);

var users = names = {};



app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/client', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/host', function(req, res) {
    res.sendFile(path.join(__dirname + '/host.html'));
});




function logdata(msg){
	var d = new Date();
	var time = '['+d.getHours()+ ':'+ 
		d.getMinutes()+':'+ d.getSeconds()+']';

	console.log(time + msg);	
}


logdata("chat server has booted");





















