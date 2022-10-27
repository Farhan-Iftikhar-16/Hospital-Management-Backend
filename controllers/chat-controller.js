const express = require('express');
const Chat = require('../models/chat-model');

const router = express.Router();

router.get('/get-user-recent-chats', (req, res) => {
  Chat.getUserRecentChats(req, res);
});


router.get('/get-users', (req, res) => {
  Chat.getUsers(req, res);
});

module.exports = router;
