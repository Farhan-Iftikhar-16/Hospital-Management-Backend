const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
  patient: {
    type: String,
    required: true
  },
  doctor: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  recommended: {
    type: Boolean,
    required: false
  },
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true
  },
  updatedAt: {
    type: Date,
    required: true
  }
});

const Review = module.exports = mongoose.model('Reviews', reviewSchema);

module.exports.addReview = (req , res) => {
  const review = new Review({
    patient: req.body.patient,
    doctor: req.body.doctor,
    comment: req.body.comment,
    recommonded: req.body.recommonded,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  review.save(error => {
    if (error) {
      res.status(500).json({success: false, message: 'Error occurred while adding review.'});
      return;
    }

    if (!error){
      res.status(200).json({success: true, message: 'Review added successfully.'});
    }
  });
}

module.exports.updateReview= (req , res) => {
  Review.findOneAndUpdate(req.params._id, req.body,{}, (error) => {
    if (error) {
      res.status(500).json({success: false, message: 'Error occurred while updating review.'});
      return;
    }

    if (!error) {
      res.status(200).json({success: true, message: 'Review details updated successfully.'});
    }
  });
}

module.exports.getReviews = (req, res) => {
  let query = {};

  if (req.params._id) {
    query = {doctor: req.params._id};
  }

  Review.find(query, (error, response) => {
    if(error) {
      res.status(500).json({status: 'Error', message: 'Error occurred while getting reviews.'});
      return
    }

    if(!error) {
      res.status(200).json({status: 'Success', reviews: response});
    }
  });
}

module.exports.deleteReview = (req, res) => {
  Review.findByIdAndDelete({_id: req.params.id}, (error) => {
    if(error) {
      res.status(500).json({success: false, message: 'Error occurred while deleting review.'});
      return;
    }

    if(!error) {
      res.status(200).json({success: true, message: 'Review deleted successfully.'});
    }
  });
}

