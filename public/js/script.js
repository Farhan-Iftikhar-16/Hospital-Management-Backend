
const SOCKET_IO = require('socket.io')();
SOCKET_IO.on('connection', socket => {

  socket.on('join', async function(data){
    socket.join(data.name);

    const chats = await Chat.find({});

    if (chats && chats.length > 0) {
      const chat = chats.find(item => item.name === data.name);

      if (chat) {
        SOCKET_IO.emit('Room Created', {name:data.name, message:'room created.'});
        return;
      }
    }

    await Chat.createRoom(data).then(
      SOCKET_IO.emit('Room Created', {name:data.name, message:'room created.'})
    );

  });
  socket.on('leave', function(data){
    SOCKET_IO.emit('left room', {user:data.user, message:'has left room.'});
    socket.leave(data.room);
  });
  socket.on('message',async function(data){

    const chat = await Chat.findOne({name: data.room});

    const message = {user: data.user, message: data.message, dateAndTime: new Date()};

    if (chat && chat.messages && chat.messages.length === 0) {
      query = { '$set': { messages:  message }};
    }

    if (chat && chat.messages && chat.messages.length > 0) {
      query = { '$push': {messages: message}};
    }

    await Chat.findByIdAndUpdate(chat._id, query, {}).catch(error => console.log(error));

    SOCKET_IO.in(data.room).emit('new message', message);
  })

});


SOCKET_IO.listen(2000);

socket.emit('join-room', ROOM_ID)
