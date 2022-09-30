const express = require('express');
const admin = require('../models/admin-model');

const router = express.Router();

router.post('/add-admin', (req, res) => {
  admin.addAdmin(req, res);
});

router.put('/update-admin-profile/:id', (req, res) => {
  admin.updateProfile(req, res);
});

router.get('/get-admins-list', (req, res) => {
  admin.getAdminsList(req, res);
});

router.get('/get-profile-details/:id', (req, res) => {
  admin.getAdminDetailsById(req, res);
});

router.get('/get-profile-details-by-user-id', (req, res) => {
  admin.getAdminDetailsByUserId(req, res);
});

router.delete('/delete-doctor/:id', (req, res) => {
  admin.deleteAdmin(req, res);
});

router.put('/update-admin-status/:id', (req, res) => {
  admin.updateAdminStatus(req, res);
});

module.exports = router;
