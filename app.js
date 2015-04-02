var http = require('http');
var fs = require('fs');
var os  = require('os-utils');
var path = require('path');
var open = require('open');

//Initialize http server. It also serves static files.
var app = http.createServer(function (request, response) {

	var filePath = '.' + request.url;
	if (filePath == './')
		filePath = './index.html';

	var extname = path.extname(filePath);
	var contentType = 'text/html';
	switch (extname) {
		case '.js':
			contentType = 'text/javascript';
			break;
		case '.css':
			contentType = 'text/css';
			break;
	}

	path.exists(filePath, function(exists) {

		if (exists) {
			fs.readFile(filePath, function(error, content) {
				if (error) {
					response.writeHead(500);
					response.end();
				}
				else {
					response.writeHead(200, { 'Content-Type': contentType });
					response.end(content, 'utf-8');
				}
			});
		}
		else {
			response.writeHead(404);
			response.end();
		}
	});

}).listen(3000,function(){console.log("Server started in http://localhost:3000");open('http://localhost:3000');});

//Socket.io will be running in the same address and port. client side: var socket = io('http://localhost:3000');
var io = require('socket.io')(app);

//Send data every second via socket
setInterval(function(){
    var x = (new Date()).getTime(), // current time
        y = os.totalmem()-os.freemem();
        io.emit('memory data updated',x,y);
        os.cpuUsage(function(y){
            io.emit('cpu data updated',x,y*100);
        })
},1000);

io.on('connection', function (socket) {

    socket.on('give me max memory',function(){
        socket.emit('here you have max memory',os.totalmem())
    });

    socket.on('disconnect', function () {
      io.emit('user disconnected');
    });
});