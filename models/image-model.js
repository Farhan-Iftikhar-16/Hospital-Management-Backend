const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const imageSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
});

const Image = module.exports = mongoose.model('Image', imageSchema);

const storage = multer.diskStorage({
  destination: './public/images/',
  filename: function (req, file, callback) {
    callback(null, file.originalname.split('.')[0] + '-' + new Date().getTime() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
}).single('image');

module.exports.uploadImage = (req , res) => {
  upload(req, res , (error) => {
    if (error) {
      res.status(500).json({status: 'Error', message: 'Error occurred while uploading image.'});
      return;
    }

    if (!error) {
      const image = new Image({
        name: req.file.filename,
      });


      image.save((error, response) => {
        if (error) {
          res.status(500).json({status: 'Error', message: 'Error occurred while uploading image.'});
          return
        }

        if (!error) {
          res.status(200).json({status: 'Success', message: 'Image uploaded successfully.', image: response});
        }
      });
    }
  });
}

module.exports.getImageById = (id) => {
  return new Promise((resolve) => {
    Image.findById({_id: id}, (error, response) => {
      if (error) {
        resolve({});
      }

      if (!response) {
        resolve({});
      }

      if (response) {
        resolve(response);
      }
    });
  })
}
