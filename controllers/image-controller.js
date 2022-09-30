const express = require('express');
const Image = require('../models/image-model.js');

const router = express.Router();

router.post('/upload-image', (req, res) => {
  Image.uploadImage(req, res);
});


module.exports = router;
