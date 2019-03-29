var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var port = process.env.PORT || 2000;
var colorList = ['#FF0000' , '#800000' , '#FFFF00' , '#808000' ,
                 '#00FF00' , '#008000' , '#00FFFF' , '#0000FF' , 
                 '#000080' , '#FF00FF' , '#800080'];
var index = 0;
app.get('/', function(req,res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('newconnection', function(){
    if (index > 11){
      socket.emit('setup', '#FFFFFF', -1, 'spect')
    }
    else {
      socket.emit('setup', colorList[index], index, 'playing');
    }
    index+=1;
    console.log('new connection');
  });
  
  socket.on('startgame', function(){
    io.sockets.emit('start');
    console.log('game started');
  });
  
  socket.on('movement', function(x,y,c){
    io.sockets.emit('move',x,y,c);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});