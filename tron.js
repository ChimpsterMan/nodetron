var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var port = process.env.PORT || 2000;
var colorList = ['#800000' , '#808000' , '#008000' , '#000080' , '#800080'];
var playerList = [];
var index = 0;
var inGame = false;
var online = 0;
var alive = 0;

app.get('/', function(req,res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('newconnection', function(){
    if (index > 11 && !inGame){
      socket.emit('setup', '#FFFFFF', 0, 'spect');
    }
    else {
      socket.emit('setup', colorList[index], index, 'playing');
    }
    index+=1;
    online+=1;
    io.sockets.emit('onlineUpdate', online);
    playerList.push(socket.id);
    console.log('new connection');
  });
  
  socket.on('startgame', function(){
    inGame = true;
    io.sockets.emit('start');
    console.log('game started');
  });
  
  socket.on('alive', function(){
    alive += 1;
    console.log('alive check' + alive);
  });
  
  socket.on('movement', function(x,y,c){
    io.sockets.emit('move',x,y,c);
  });
  
  socket.on('lines', function(l){
    console.log('lines');
    io.sockets.emit('redraw', l);
  });
  
  socket.on('death', function(){
    console.log('death');
    io.sockets.emit('removetrail', findPlayer(socket.id));
    alive -= 1;
    if (alive <= 1 && inGame){
      io.sockets.emit('gameover');
      reset(3000);
    }
    console.log(alive);
  });
  
  socket.on('disconnect', function(){
    console.log('disconnection');
    online-=1;
    alive = 0;
    setTimeout(function(){
    io.sockets.emit('playercheck');
    }, 500);
    setTimeout(function(){
    if (alive <= 1 && inGame){
      io.sockets.emit('gameover');
      reset(3000);
    }
    }, 5000);
    if (!inGame){
      reset(0);
    }
    io.sockets.emit('remove', findPlayer(socket.id));
    io.sockets.emit('onlineUpdate', online);
  });
  
  socket.on('forcereset', function(){
    reset(0);
  });
  
  function reset(timeDelay){
    console.log('resetting');
    setTimeout(function(){
    playerList = [];
    index = 0;
    inGame = false;
    online = 0;
    alive = 0;
    io.sockets.emit('reconnect');
    }, timeDelay);
  }
  
  function findPlayer(id){
  for (var i = 0; i < playerList.length; i++){
    if (playerList[i] == id){
      return i;
    }
  }
}
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});