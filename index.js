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
const app = express();

mongoose.connect(config.mongoURL).then(() => {
  console.log(`Connected to DB: ${config.mongoURL}`);

});
app.use(bodyParser.json());

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

app.use('/auth', authController);
app.use('/image', imageController);
app.use('/hospital', hospitalController);
app.use('/doctor', doctorController);
app.use('/admin', adminController);
app.use('/appointment', appointmentController);
app.use('/patient', patientController);
app.use('/review', reviewController);

app.listen(config.PORT, () => {
  console.log(`Server Running On Port: ${config.PORT}`)
})

