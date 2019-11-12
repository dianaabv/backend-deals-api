const jwt = require('jsonwebtoken');
const User = require('mongoose').model('User');
const PassportLocalStrategy = require('passport-local').Strategy;
const config = require('../../config');


/**
 * Return the Passport Local Strategy object.
 */
module.exports = new PassportLocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  session: false,
  passReqToCallback: true
}, (req, username, password, done) => {
  var userData = {
    username: username.trim(),
    password: password.trim()
  };

  // find a user by email address
  return User.findOne({ username: userData.username }, (err, user) => {
    if (err) { return done(err); }

    if (!user) {
      var error = new Error('Неправильный ID аккаунта');
      error.name = 'IncorrectCredentialsError';

      return done(error);
    }

    // check if a hashed user's password is equal to a value saved in the database
    return user.comparePassword(userData.password, (passwordErr, isMatch) => {
      if (err) { return done(err); }

      if (!isMatch) {
        var error = new Error('Неправильный пароль');
        error.name = 'IncorrectCredentialsError';
        return done(error);
      }

      var payload = {
        sub: user._id,
        userstatus: user.status
      };

      // create a token string
      var token = jwt.sign(payload, config.jwtSecret);
      var data = {
        user: user
      };

      return done(null, token, data);
    });
  });
});
