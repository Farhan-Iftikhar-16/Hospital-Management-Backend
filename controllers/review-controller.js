const express = require('express');
const review = require("../models/review-model");

const router = express.Router();

router.post('/add-review', (req, res) => {
  review.addReview(req, res);
});

router.put('/update-review/:id', (req, res) => {
  review.updateReview(req, res);
});

router.get('/get-reviews', (req, res) => {
  review.getReviews(req, res);
});

router.delete('/delete-review/:id', (req, res) => {
  review.deleteReview(req, res);
});

module.exports = router;
