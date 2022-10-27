const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const config = require('./config/config');

const authController = require('./controllers/auth-controller');
const imageController = require('./controllers/image-controller');
const hospitalController = require('./controllers/hospital-controller');
const doctorController = require('./controllers/doctor-controller');
const adminController = require('./controllers/admin-controller');
const appointmentController = require('./controllers/appointments-controller');
const patientController = require('./controllers/patient-controller');
const reviewController = require('./controllers/review-controller');
const chatController = require('./controllers/chat-controller');
const analyticsController = require('./controllers/analytics-controller');
const getRecentPatientOrDoctorsController = require('./controllers/recent-appointments-controller');
const Chat = require("./models/chat-model");
const app = express();


mongoose.connect(config.mongoURL).then(() => {
  console.log(`Connected to DB: ${config.mongoURL}`);

});
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/public', express.static('public'));

app.use(cors());

app.options('*', cors());

app.use(session({
  secret: config.secret,
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport-config')(passport);

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


  socket.on('join-video-room', (room) => {
    console.log(room);

    socket.join(room);
    socket.to(room).emit('video-room-joined', {message:'room joined.'})
  })
});


SOCKET_IO.listen(2000);

app.use('/auth', authController);
app.use('/image', imageController);
app.use('/hospital', hospitalController);
app.use('/doctor', doctorController);
app.use('/admin', adminController);
app.use('/appointment', appointmentController);
app.use('/patient', patientController);
app.use('/review', reviewController);
app.use('/chat', chatController);
app.use('/analytics', analyticsController);
app.use('/get-recent-patients-or-doctors', getRecentPatientOrDoctorsController);

app.get('/:room', (req, res) => {
  res.render('room', {room: req.params.room});
})

app.listen(config.PORT, () => {
  console.log(`Server Running On Port: ${config.PORT}`)
})
