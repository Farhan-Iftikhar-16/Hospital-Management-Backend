const express = require('express');
const User = require('../models/user-model.js');

const router = express.Router();

router.get('/get-user-details/:id', (req, res) => {
  User.getUserDetails(req, res);
});

module.exports = router;
