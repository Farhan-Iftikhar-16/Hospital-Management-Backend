const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  port: 465,
  host: "smtp.gmail.com",
  auth: {
    user: 'farhaniftikhar16f16@gmail.com',
    pass: 'fanu571096816f16',
  },
  secure: true,
});

module.exports = {
  PORT: 5000,
  mongoURL: 'mongodb://localhost:27017/Hospital-Management-System-Database',
  secret: 'Hospital-Management-System',
  transporter: transporter,
  email: 'farhaniftikhar16f16@gmail.com'
};


