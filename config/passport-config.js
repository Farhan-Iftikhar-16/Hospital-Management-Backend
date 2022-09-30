const User = require('../models/user-model.js');
const config = require('../config/config');

module.exports = (passport) => {

  const JwtStrategy = require('passport-jwt').Strategy;
  const ExtractJwt = require('passport-jwt').ExtractJwt;
  const opts = {}
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = config.secret;

  passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
     User.getUserById(jwt_payload._id, (error, user) => {
      if (error) {
        return done(error, false);
      }

      if (user) {
        return done(null, user);
      }

      if (!user) {
        return done(null, false);
      }
    });
  }));
}

