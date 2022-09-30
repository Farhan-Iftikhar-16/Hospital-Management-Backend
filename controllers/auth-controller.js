const express = require('express');
const User = require('../models/user-model.js');

const router = express.Router();

router.post('/login', (req, res) => {
  User.getUserByEmail(req, res);
});

router.post('/create-account', (req, res) => {
  User.createAccount(req, res);
});

module.exports = router;
