// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('SM1qDmzCgij5h6me');
var express = require('express'),
  http = require ('http'),
  path = require('path'),
  room = require('./server/room'),
  app = express(),
  server = http.createServer(app),
  io = require('socket.io').listen(server),
  oneDay = 24*60*60*1000;




app.configure(function () { 
  app.set('env', process.env.NODE_ENV || 'dev'); 
  app.set('port', app.get('env') === 'dev' ? 8000:80);
  //app.set('views', __dirname + '/views');

  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.methodOverride());
  app.use(express.cookieParser()); //not passing any secret. Don't really need signed cookies for nko.
  
  app.use(express.json()); //not using bodyParser() or multipart() middlewares as we don't need file uploads.
  app.use(app.router);
  //GET /index.html will map to client/index.html
  app.use("/app", express.static(path.join(__dirname, 'client')));

});

app.configure(function () {
  app.use("/app/css", express.static(path.join(__dirname, 'client/css'), { maxAge: oneDay }));
  app.use("/app/js", express.static(path.join(__dirname, 'client/js'), { maxAge: oneDay }));
  app.use("/app/images", express.static(path.join(__dirname, 'client/images'), { maxAge: oneDay }));
  app.use("/app/tests", express.static(path.join(__dirname, 'client/tests'), { maxAge: oneDay }));
  app.use("/app/static", express.static(path.join(__dirname, 'client/static'), { maxAge: oneDay }));
  app.use(express.errorHandler());
});

server.listen(app.get('port'));
// app.listen(app.get('port'), function () {
//   console.log('Server started on port ' + app.get('port'));
// });

app.all('/', function (req, res) {
  res.redirect('/app/');
});

app.all('/app/echo-req', function (req, res) {
  res.json(req, res, {
    cookies: req.cookies,
    body: req.body,
    query: req.query
  });
});


app.post('/app/create-room', function (req, res) {
  room.createRoom(req.body, function (err, result) {
    res.json(result);
  });
});

app.post('/app/create-sample-room', function (req, res) {
  room.createSampleRoom(req.body, function (err, result) {
    res.json(result);
  });
});

app.get('/app/rooms', function (req, res) {
  room.findRooms({}, function(err, rooms) {
    for (var i = 0; i < rooms.length; i++) {
      delete rooms[i].items;
    }
    res.json(rooms);
  })
});

//This will get details of a particular room. Should fetch all the stories in that room.
app.get('/app/rooms/:room_id', function (req, res) {
  room.findRoom({
    'roomId': req.params.room_id
  }, function(err, room) {
    delete room.items;
    res.json(room);
  })
});

//This will get details of a particular room. Should fetch all the stories in that room.
app.get('/app/rooms/:room_id/items', function (req, res) {
  room.findRoomItems({
    'roomId': req.params.room_id
  }, function(err, items) {
    res.json(items);
  })
});

//This will let user join the room. Joining room should take you to the game. Also it should
//load the history of the game and show on the left. Note -- depending on UI needs, history
// may be loaded on demand as the story
app.post('/app/join-room', function (req, res) {
  room.joinRoom({
    roomId: req.body.roomId,
    userName: req.body.userName    
  }, function (err, result) {
    res.json(result);
  });
});

app.post('/app/start-room', function (req, res) {
  room.startRoom({
    roomId: req.body.roomId,
    userName: req.body.userName    
  }, function (err, result) {
    res.json(result);
  });
});


app.post('/app/respond', function (req, res) {
  room.respondToItem({
    'roomId': req.body.roomId,
    'itemId': req.body.itemId,
    'userName': req.body.userName,
    'userResponse': req.body.userResponse
  }, function(err, respObj) {
    res.json(respObj);
  })
});

app.post('/app/rooms/:room_id/next-item', function (req, res) {
  var vote = req.body.vote;
});

app.post('/app/rooms/:room_id/finish', function (req, res) {
  var vote = req.body.vote;
});

//Adds one or more items to the room.
app.post('/app/rooms/:room_id/estimation-items/add', function (req, res) {
  var toAdd = req.body.estimationItems;
});


/////////////////////////socketio test///////////
io.sockets.on('connection', function (socket) {
  //socket.emit('connected', { hello: 'world' });

  socket.on('join', function (data) {
    
    socket.userName = data.userName;
    socket.roomId = data.roomId;
    socket.join(data.roomId);
    console.log('user: ' + data.userName + ' joined channel: ' + data.roomId);

    room.joinRoom({
      roomId: data.roomId,
      userName: data.userName    
    }, function (err, result) {
      console.log('user: ' + data.userName + ' emitting joined to: ' + data.roomId);
      io.sockets.in(data.roomId).emit('joined', result);
    });
  });

  socket.on('respond', function (data) {
    //socket.join(data.roomId);
    room.respondToItem({
      'roomId': data.roomId,
      'userName': data.userName ,  
      'itemId': data.itemId,
      'userResponse': data.userResponse
    }, function (err, result) {
      //io.sockets.emit('responded', result);
      if (result.details && result.details.rac && result.details.rac.finishTime) {
        socket.leave(data.roomId);
      }
      io.sockets.in(data.roomId).emit('responded', result);

    });
  });


  socket.on('start', function (data) {
    //socket.join(data.roomId);
    room.startRoom({
      roomId: data.roomId,
      userName: data.userName    
    }, function (err, result) {
      //io.sockets.emit('started', result);
      io.sockets.in(data.roomId).emit('started', result);
    });
  });

  socket.on('disconnect', function () {
      socket.broadcast.to(socket.roomId).emit('left', {message: 'user ' + socket.userName + ' has left.'});
  });

});



//==========================================================
// Utility functions that can be moved to a separate file or module
//==========================================================




// var io = require('socket.io').listen(app.listen(5000)); // Using port 5000 currently
// io.sockets.on('connection', function (socket) {
  
//   //on connect send a welcome message
//   socket.emit('message', { text : 'Welcome!' });

//   //on subscription request joins specified room
//   //later messages are broadcasted on the rooms
//   socket.on('subscribe', function (data) {
//     socket.join(data.channel);
//   });

//   socket.on('send', function (data) {
//       messages[data.channel].push(data.message);
//       var resp = {'text': data.message, 'channel':data.channel}
//       io.sockets.in(data.channel).emit('message', resp);

//   });  
// });
