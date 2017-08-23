var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('chat', { title: 'Chat' });
  
  res.sendfile(__dirname.replace('\\routes', '') + '/views/chat.html');
});

var app = express();

// socket io
var server = require('http').createServer(app);
var io = require('socket.io')(8000).listen(server);
var data = { mode: null, value: null, rooms: null }
//var rooms = [{ room_id: null, members: [{ id: null, nickName: null }] }];

/*
io.emit : 접속된 모든 클라이언트에게 메시지를 전송한다.
socket.emit : 메시지를 전송한 클라이언트에게만 메시지를 전송한다.
socket.boradcast.emit : 메시지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메시지를 전송한다.
io.to(id).emit : 특정 클라이언트에게만 메시지를 전송한다. id는 socket 객체의 id 속성값이다.
*/

var g_Room = {
  fn_ExistsRoom: function(d) {
    var result = false;
    if (data.rooms != null) {
      for (var i=0; i<data.rooms.length; i++) {
        if (data.rooms[i].room_id == d.room) {
          result = true;
          break;
        }
      }
    }
    return result;
  },
  fn_ExistsUser: function(d) {
    var result = false;
    for (var i=0; i<data.rooms.length; i++) {
      if (data.rooms[i].room_id == d.room) {
        for (var j=0; j<data.rooms[i].members.length; j++) {
          if (data.rooms[i].members[j].nickName == d.nickName) {
            result = true;
            break;
          }
        }
        break;
      }
    }
    return result;
  },
  fn_Join: function(d) {
    if (data.rooms == null) 
      data.rooms = [{ room_id: d.room, members: [{ id: d.id, nickName: d.nickName }] }];
    else {
      var k = null;
      for (var i=0; i<data.rooms.length; i++) {
        for (var j=0; j<data.rooms[i].members.length; j++) {
          if (data.rooms[i].members[j].nickName == d.nickName) {
            data.rooms[i].members.splice(j, 1);
            k = i;
            break;
          }
        }
      }

      var flag = false;
      for (var i=0; i<data.rooms.length; i++) {
        if (data.rooms[i].room_id == d.room) {
          data.rooms[i].members.push({ id: d.id, nickName: d.nickName });
          flag = true;
          break;
        }
      }
      if (!flag) data.rooms.push({ room_id: d.room, members: [{ id: d.id, nickName: d.nickName }] });

      if (k != null && data.rooms[k].members.length <= 0) data.rooms.splice(k, 1);
    }
  },
  fn_Leave: function(d) {
    for (var i=0; i<data.rooms.length; i++) {
      if (data.rooms[i].room_id == d.room) {
        for (var j=0; j<data.rooms[i].members.length; j++) {
          if (data.rooms[i].members[j].nickName == d.nickName) {
            data.rooms[i].members.splice(j, 1);
            if (data.rooms[i].members.length <= 0) data.rooms.splice(i, 1);
            break;
          }
        }
        break;
      }
    }
  }
}

io.sockets.on('connection', function(socket) {
  socket  
  // 소켓 연결됨
  .emit('connected')
  // 방 조회
  .on('roomList', function(d) {
    data.mode = d.mode;

    socket.emit(data.mode, data);
  })
  // 로비 입장
  .on('joinLobby', function(d) {
    data.mode = d.mode;
    var d = d.value;

    socket.join(d.room);
    socket.room = d.room;
    socket.nickName = d.nickName;

    io.sockets.in(socket.room).emit(data.mode, data);

    console.log(io.sockets.adapter.rooms);
  })
  // 방 생성
  .on('createRoom', function(d) {
    data.mode = d.mode;
    var d = d.value;

    if (!g_Room.fn_ExistsRoom(d)) {
      socket.leave(socket.room);
      socket.join(d.room); 
      socket.room = d.room; 
      socket.nickName = d.nickName; 

      g_Room.fn_Join(d);

      d.result = "Y";
    } else d.result = "N";

    data.value = d;
    socket.emit(data.mode, data);
    socket.broadcast.emit('roomList', data);

    console.log(io.sockets.adapter.rooms);
  })
  // 방 입장
  .on('joinRoom', function(d) {
    data.mode = d.mode;
    var d = d.value;

    if (g_Room.fn_ExistsRoom(d) && !g_Room.fn_ExistsUser(d)) {
      socket.leave(socket.room);
      socket.join(d.room); 
      socket.room = d.room; 
      //socket.id = d.id; 
      socket.nickName = d.nickName; 

      g_Room.fn_Join(d);

      data.value = d;
      io.sockets.in(socket.room).emit(data.mode, data);
    }

    console.log(io.sockets.adapter.rooms);
  })
  // 메세지 보내기
  .on('sendMessage', function(d) {
    data.mode = d.mode;
    data.value = d.value;
    var d = d.value;

    io.sockets.in(socket.room).emit(data.mode, data);

    console.log(socket.room + ' ' + socket.id + ' ' + socket.nickName + ' ' + d.nickName + ' ' + d.message);
    console.log(io.sockets.adapter.rooms);
  })
  // 방 퇴장
  .on('leaveRoom', function(d) {
    data.mode = d.mode;
    data.value = d.value;
    var d = d.value;

    if (g_Room.fn_ExistsUser(d)) {
      g_Room.fn_Leave(d);

      io.sockets.in(socket.room).emit(data.mode, data);
      socket.leave(socket.room);
      socket.join('Lobby');
      socket.room = 'Lobby';
      socket.broadcast.emit('roomList', data);
    }

    console.log(io.sockets.adapter.rooms);
  })
  // 소켓 해제됨
  .on('disconnect', function() {
    //console.log('user disconnected');
  });
});

module.exports = app;
module.exports = router;