const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: false
  },
  password: {
    type: String,
    required: true
  },
  isTemporaryPassword: {
    type: Boolean,
    required: false
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

const User = module.exports = mongoose.model('User', userSchema);

module.exports.createAccount = (req , res) => {
  User.findOne({email: req.body.email}, (error, user) => {
    if (error) {
      res.status(500).json({success: false, message: 'Error occurred while creating account.'});
      return;
    }

    if (user) {
      res.status(409).json({success: false, message: 'User already exists with provided email.'});
      return;
    }

    if(!user) {
      const user = new User({
        email: req.body.email,
        password: req.body.password,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      bcryptjs.genSalt(10, (error, salt) => {
        if(error) {
          res.status(500).json({success: false, message: 'Error occurred while encrypting the password.'});
          return;
        }

        if(!error) {
          bcryptjs.hash(user.password, salt, (error, hash) => {
            if(error) {
              res.status(500).json({success: false, message: 'Error occurred while encrypting the password.'});
              return;
            }

            if(!error) {
              user.password = hash;
              user.role = 'ADMIN';
              user.save((error)=> {
                if(error) {
                  res.status(500).json({success: false, message: 'Error occurred while creating account.'});
                  return;
                }

                if(!error) {
                  res.status(200).json({success: true, message: 'Account created successfully.'});
                }
              });
            }
          })
        }
      });
    }
  });
}

module.exports.getUserByEmail = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({email: email}, (error, user) => {
    if (error) {
      res.status(500).json({success: false, message: 'Error occurred while finding user.'});
      return;
    }

    if (!user) {
      res.status(404).json({success: false, message: 'User not found.'});
      return;
    }

  if(user && !user.isTemporaryPassword) {
      bcryptjs.compare(password, user.password, (error , isMatch) => {
        if (error) {
          res.status(500).json({success: false, message: 'Error occurred while comparing password.'});
          return;
        }

        if (!isMatch) {
          res.status(400).json({success: false, message: 'Password does not match.'});
          return;
        }

        if (isMatch) {
          const token = jwt.sign(user.toJSON(), config.secret, {
            expiresIn: '24h'
          });

          res.status(200).json({
            success: true,
            token: token,
            message: 'Logged in successfully.',
            user: {
              _id: user._id,
              email: user.email,
              role: user.role
            }
          });
        }
      });
    }

    if(user && user.isTemporaryPassword) {
      if (user.password !== password) {
        res.status(400).json({success: false, message: 'Password does not match.'});
        return;
      }

      const token = jwt.sign(user.toJSON(), config.secret, {
        expiresIn: '24h'
      });

      res.status(200).json({
        success: true,
        token: token,
        message: 'Logged in successfully.',
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          isTemporaryPassword: user.isTemporaryPassword
        }
      });
    }
  });
}

module.exports.resetPassword = (req, res) => {
  User.findById(req.body.id, (error, response) => {
    if (error) {
      res.status(500).json({success: false, message: 'Error occurred while finding user.'});
      return;
    }

    if (!response) {
      res.status(404).json({success: false, message: 'User not found.'});
      return;
    }

    if (response && response.isTemporaryPassword) {
      if(response.password !== req.body.recentPassword) {
        res.status(500).json({success: false, message: 'Error occurred while resetting password.'});
        return;
      }

      bcryptjs.genSalt(10, (error, salt) => {
        if(error) {
          res.status(500).json({success: false, message: 'Error occurred while resetting the password.'});
          return;
        }

        if(!error) {
          bcryptjs.hash(req.body.password, salt, (error, hash) => {
            if (error) {
              res.status(500).json({success: false, message: 'Error occurred while resetting the password.'});
              return;
            }

            User.findByIdAndUpdate(req.body.id, {$set: {password: hash}}, (error) => {
              if (error) {
                res.status(500).json({success: false, message: 'Error occurred while resetting the password.'});
                return;
              }

              if (!error) {
                res.status(200).json({success: true, message: 'Password reset successfully. Please login again.'});
              }
            });
          });
        }
      });
    }

    if (response && !response.isTemporaryPassword) {
      bcryptjs.compare(req.body.recentPassword, response.password, (error , isMatch) => {
        if (error) {
          res.status(500).json({success: false, message: 'Error occurred while resetting password.'});
          return;
        }

        if (!isMatch) {
          res.status(400).json({success: false, message: 'Password does not match.'});
          return;
        }

        if (isMatch) {
          bcryptjs.genSalt(10, (error, salt) => {
            if(error) {
              res.status(500).json({success: false, message: 'Error occurred while resetting the password.'});
              return;
            }

            if(!error) {
              bcryptjs.hash(req.body.password, salt, (error, hash) => {
                if (error) {
                  res.status(500).json({success: false, message: 'Error occurred while resetting the password.'});
                  return;
                }

                User.findByIdAndUpdate(req.body.id, {$set: {password: hash}}, (error) => {
                  if (error) {
                    res.status(500).json({success: false, message: 'Error occurred while resetting the password.'});
                    return;
                  }

                  if (!error) {
                    res.status(200).json({success: true, message: 'Password reset successfully. Please login again.'});
                  }
                });
              });
            }
          });
        }
      });
    }
  });
}
