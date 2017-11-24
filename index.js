var app = require('express')();
var server = require('http').Server(app);
var mongo = require('mongodb').MongoClient;
var io = require('socket.io')(server);
var path = require('path');

var port = process.env.port || 3000;


// connect mongo db
mongo.connect('mongodb://127.0.0.1/bluebricks1', function(err, db){

	if(err)
	{
		throw err;
	}

	console.log("mongo connected");

		// socket connection
		io.on('connection', function(socket){
			
			// create collection for chats
			var chat = db.collection('chats');

			// user join section
			socket.on('join', function(user){
				
				logdata(user[2] + "A user has connected" + user[1]);
				socket.UserId = user[1];
				socket.UserName = user[2];

				users[user[1]] = socket;
				names[user[1]] = {
					'name' : user[2],
					'socketid' : socket.id 
				}

				// find previous chats
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


server.listen(port);

var users = names = {};


// routing
app.get('/client', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/host', function(req, res) {
    res.sendFile(path.join(__dirname + '/host.html'));
});



// console log 
function logdata(msg){
	var d = new Date();
	var time = '['+d.getHours()+ ':'+ 
		d.getMinutes()+':'+ d.getSeconds()+']';

	console.log(time + msg);	
}


logdata("chat server has booted");





















