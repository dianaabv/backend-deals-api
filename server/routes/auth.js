const express = require('express');
const passport = require('passport');
var User = require('../models/user');

const router = new express.Router();



router.post('/login', (req, res, next) => {
  // console.log(req.body.username, req.body.password, 'userData')
  // var res = req.body.username.substr(1);
  // console.log(res)
  // User.findOne({username: res}).exec((err, user) => {
  //   if(err) console.log(err)
  //   if(user){
  //     if(user.isRegistered==1){
  //       console.log('ok')
  //     } else {
  //       console.log('neok')
  //     }
  //   }
  // })
  return passport.authenticate('local-login', (err, token, userData) => {
    if (err) {
      if (err.name === 'IncorrectCredentialsError') {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Проверьте поля'
      });
    }
    return res.json({
      success: true,
      message: 'Вы успешно авторизовались!',
      token,
      user: userData
    });
  })(req, res, next);
});

module.exports = router;
