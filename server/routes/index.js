const express = require('express')
const router = express.Router()
const User = require('../models/user')
const mobizon = require('mobizon')("7659d70aa4c09e6fa1a93f3f85f84a38dadd8413");
const Relation = require('../models/user_init/relation')
const Deal = require('../models/deal_init/alldealtypes')
const DealParent = require('../models/deal_init/DealParent')
const DealState = require('../models/deal_init/DealState')
const DealTimeline = require('../models/deal_init/DealTimeline')
const UserTimeline = require('../models/deal_init/UserTimeline')
const DealReason = require('../models/deal_init/DealReason')
const DealFinal = require('../models/deal_init/DealFinal')
const Deal683 = require('../models/deal_fields/Deal683')
const Deal506 = require('../models/deal_fields/Deal506')
const Deal715 = require('../models/deal_fields/Deal715')
const Deal865 = require('../models/deal_fields/Deal865')
const Deal768 = require('../models/deal_fields/Deal768')
const Deal688 = require('../models/deal_fields/Deal688')
const Deal616 = require('../models/deal_fields/Deal616')
const Deal604 = require('../models/deal_fields/Deal604')
const Deal540 = require('../models/deal_fields/Deal540')
const Deal846 = require('../models/deal_fields/Deal846')
const Deal501 = require('../models/deal_fields/Deal501')
const Deal406 = require('../models/deal_fields/Deal406')

const Deal506Old = require('../models/deal_fields/Deal506Old')
const Deal715Old = require('../models/deal_fields/Deal715Old')
const Deal865Old = require('../models/deal_fields/Deal865Old')
const Deal768Old = require('../models/deal_fields/Deal768Old')
const Deal688Old = require('../models/deal_fields/Deal688Old')
const Deal616Old = require('../models/deal_fields/Deal616Old')
const Deal683Old = require('../models/deal_fields/Deal683Old')
const Deal604Old = require('../models/deal_fields/Deal604Old')
const Deal540Old = require('../models/deal_fields/Deal540Old')
const Deal846Old = require('../models/deal_fields/Deal846Old')
const Deal501Old = require('../models/deal_fields/Deal501Old')
const Deal406Old = require('../models/deal_fields/Deal406Old')

const Device = require('../models/device')
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs')
const jwtDecode = require('jwt-decode')
const mongoose = require('mongoose')

var admin = require("firebase-admin");
const CryptoJS = require("crypto-js");
const fieldEncryption = require('mongoose-field-encryption');

const SK = 'mFJH=YR%xZ?8cC'


router.post('/needfinalsubmission', function(req,res){
  var token = req.headers.authorization.split(' ')[1];
  var decoded = jwtDecode(token);
  var deal_id = req.body.deal_id;
  DealState.findOne({deal_id:deal_id}).exec((err, ok) => {
    if(err)console.log(err)
    if(ok){
      if(ok.acceptor==decoded.sub){
        if(ok.acceptor_status == 'finished_deal'){
          res.send({message:'Вы уже указали ваш ответ.', satisfied:false})
        } else {
          res.send({satisfied:true, message: ''})
        }
      }
      if(ok.initiator==decoded.sub){
        if(ok.initiator_status == 'finished_deal'){
          res.send({message:'Вы уже указали ваш ответ.', satisfied:false})
        } else {
          res.send({satisfied:true, message: ''})
        }
      }
    }
  })
})
router.post('/updatefinisheddeal', function(req,res){
  var token = req.headers.authorization.split(' ')[1];
  var decoded = jwtDecode(token);
  var sat = JSON.parse(req.body.sat);
  var deal_id = req.body.deal_id;
  // console.log(sat,'1111')
  if(!sat.reason){
    sat["reason"] = "";
  }
  // console.log(sat,'222')
  function checkParent(){
    DealState.findOne({deal_id: deal_id}).exec((err, state) => {
      if(err) console.log(err)
      if(state) {
        if(state.initiator_status == 'finished_deal' && state.acceptor_status == 'finished_deal'){
          DealParent.findOneAndUpdate({_id: deal_id}, {status: 'completed'}).exec((err, ok) => {
            if(err) console.log(err)
            else{
              dealCompleteTimeline(deal_id, ok.side1, ok.side2, ok.lawid,ok._id)
            }
          })
        }
      }
    })
  }
  function saveDealFinal(sat, role){
    DealFinal.findOne({deal_id:deal_id}).exec((err, ok) => {
      if(err) console.log(err)
      if(ok){
        if(role=='inititor'){
          DealFinal.findOneAndUpdate({deal_id: deal_id}, {initiator: sat.initiator, initiator_answer: sat.initiator_answer, initiator_message:sat.initiator_message}).exec((err, ok) => {
            if(err) console.log(err)
            if(ok){
              res.send({message:'Мы приняли ваш ответ. Cпасибо, что воспользовались сервисом LegCo'});
            }
          })
        }
        if(role=='acceptor'){
          DealFinal.findOneAndUpdate({deal_id: deal_id}, {acceptor: sat.acceptor,acceptor_answer: sat.acceptor_answer,acceptor_message: sat.acceptor_message}).exec((err, ok) => {
            if(err) console.log(err)
            if(ok) {
              res.send({message:'Мы приняли ваш ответ. Cпасибо, что воспользовались сервисом LegCo'});
            }
          })
        }
      }
      if(!ok){
        const newSat = new DealFinal(sat);
        newSat.save((err, savedUser) => {
        if (err) console.log(err);
            else {
                res.send({message:'Мы приняли ваш ответ. Cпасибо, что воспользовались сервисом LegCo'});
            }
        })
      }
    })
  }
  DealState.findOne({deal_id: deal_id}).exec((err, state) => {
    if(err) console.log(err)
    if(state){
      if(state.initiator == decoded.sub){
        dealFinalTimeline(decoded.sub,state.acceptor, deal_id, sat, state.lawid)
        var data = {
          deal_id:deal_id,
          initiator: decoded.sub,
          initiator_answer: sat.ans,
          initiator_message: sat.reason,
        }
        saveDealFinal(data, 'inititor')
        DealState.findOneAndUpdate({deal_id: deal_id}, {initiator_status: 'finished_deal'}).exec((err, ok) => {
          if(err) cnsole.log(err)
          if(ok) checkParent()
        })
      }
      if(state.acceptor == decoded.sub){
        dealFinalTimeline(decoded.sub,state.initiator, deal_id, sat, state.lawid)
        var data = {
          deal_id:deal_id,
          acceptor: decoded.sub,
          acceptor_answer: sat.ans,
          acceptor_message: sat.reason
        }
        saveDealFinal(data, 'acceptor')
        DealState.findOneAndUpdate({deal_id: deal_id}, {acceptor_status: 'finished_deal'}).exec((err, ok) => {
          if(err) cnsole.log(err)
          if(ok) checkParent()
        })
      }
    }
  })
})
router.post('/savemydevice', function(req, res) {
    var decoded = jwtDecode(req.body.userid);
    console.log(req.body.devicePlatform, 'ssssssssss')
    Device.findOne({userid: decoded.sub}).exec((err, user) => {
        if(err) console.log(err)
            if(user){
                Device.findOneAndUpdate({userid: decoded.sub}, {device:req.body.deviceToken, devicePlatform: req.body.devicePlatform}).exec((err, user) => {
                    if(err) console.log(err)
                })
            }
            if(!user){
                var userData = {
                    userid: decoded.sub,
                    device: req.body.deviceToken,
                    devicePlatform: req.body.devicePlatform
                }
                const newUser = new Device(userData);
                newUser.save((err, savedUser) => {
                    if (err) console.log(err);
                })

            }
    })
})
var sendSms = function(rand, phone){
  console.log(rand, phone)
  mobizon.Message.SendSMSMessage({recipient: '+'+phone, text: 'Legco: '+ rand},function(error, data){
    if(error) console.log(error)
    if(data) console.log(data)
  })
}
var sendRegLetter = function(email, firstname){
          // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: 'smtp.mail.ru',
                port: 465,
                secure: true, // secure:true for port 465, secure:false for port 587
                auth: {
                    user: process.env.EMAIL_HOST,
                    pass: process.env.EMAIL_PASS
                }
            });
            // setup email data with unicode symbols
            let mailOptions = {
                from: '"Legco" <process.env.EMAIL_HOST>', // sender address
                to: email, // list of receivers
                subject: 'Cделки LegCo ✔', // Subject line
                text: 'Cделки LegCo ', // plain text body
                html: '<table width="100%" border="0" cellspacing="0" cellpadding="0" style="min-width:320px"><tbody><tr><td align="center" bgcolor="#eff3f8"><table border="0" cellspacing="0" cellpadding="0" class="m_6607120692376060800table_width_100" width="100%" style="max-width:680px;min-width:300px"><tbody><tr><td><div style="height:10px;line-height:80px;font-size:10px">&nbsp;</div></td></tr><tr><td align="center" style="background-color:#84a4e8"><div style="height:15px;line-height:30px;font-size:10px">&nbsp;</div><table width="90%" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td align="left"> <a href="http://legco.kz" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=ru&amp;q=http://legco.kz&amp;source=gmail&amp;ust=1518493396904000&amp;usg=AFQjCNGX3t2RhMvY9tFax9ERhwoOJqEwjQ"><img src="https://ci4.googleusercontent.com/proxy/yoOjNgg5RnirdDy1-SI5ZV3LLB0kaf2BBj-bhptbRmmI4r8x2mN4OG2ZdNtvOeOnwwnu31rZ69qo=s0-d-e1-ft#http://legco.kz/mailer/logomail.png" style="height:100px;width:auto" class="CToWUd"></a></td></tr></tbody></table><div style="height:10px;line-height:50px;font-size:10px">&nbsp;</div></td></tr><tr><td align="center" bgcolor="#fbfcfd"><table width="90%" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td align="left"><div style="height:60px;line-height:60px;font-size:10px">&nbsp;</div><div style="line-height:44px"> <font face="Arial, Helvetica, sans-serif" size="5" color="#57697e" style="font-size:24px"> <span style="font-family:Arial,Helvetica,sans-serif;font-size:17px;color:#57697e"> Уважаемый(-ая) '+firstname+', </span></font></div></td></tr><tr><td align="left"><div style="line-height:24px"> <font face="Arial, Helvetica, sans-serif" size="4" color="#57697e" style="font-size:15px"> <span style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#57697e"> Команда LegCo благодарит Вас за присоединение к нашему веб-сервису, предоставляющему доступ к законодательству Республики Казахстан и цифровомузаключению сделок. </span> </font> <font face="Arial, Helvetica, sans-serif" size="4" color="#57697e" style="font-size:15px"> <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#57697e"><table><thead><tr style="height:20px"></tr><tr><td align="left"><div style="line-height:24px"> <font face="Arial, Helvetica, sans-serif" size="4" color="#57697e" style="font-size:15px"> <span style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#57697e"> Мы хотим, чтобы Ваш опыт использования веб-сервиса был максимально комфортным и полезным. </span> </font> <font face="Arial, Helvetica, sans-serif" size="4" color="#57697e" style="font-size:15px"> <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#57697e"><table><thead><tr style="height:20px"></tr><tr><td align="left"><div style="line-height:24px"> <font face="Arial, Helvetica, sans-serif" size="4" color="#57697e" style="font-size:15px"> <span style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#57697e"> Пользоваться веб-сервисом LegCo просто: </span></br><ul style="list-style-type:disc"><li style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#57697e">Скачайте приложение на смартфон, планшет или перейдите на веб-версию на персональном компьютере</li></br><li style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#57697e">Зарегистрируйтесь</li></br><li style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#57697e">Найдите своего партнера по сделке</li></br><li style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#57697e">Заполните форму сделки и заключите ее с партнером</li></br><li style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#57697e">Вносите изменения в сделку при необходимости</li></br><li style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#57697e">Получайте справку по сделке для представления ее в суд в случае спора с партнером</li></ul> </font> <font face="Arial, Helvetica, sans-serif" size="4" color="#57697e" style="font-size:15px"> <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#57697e"><table><thead><tr style="height:20px"></tr></tbody></table> </span></font></div><div style="height:40px;line-height:40px;font-size:10px">&nbsp;</div></td></tr><tr><td align="left"><div style="line-height:24px"> <font face="Arial, Helvetica, sans-serif" size="4" color="#57697e" style="font-size:15px"> <span style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#57697e"><table><tbody><tr><td> Искренне Ваша</td></tr><tr><td>Команда LegCo</td></tr><tr><td>тел.: <a href="tel:+7%20727%20292%201937" value="+77272921937" target="_blank">+7 (727) 292 19 37</a></td></tr><tr><td><a href="mailto:email%3Alegco@legco.kz" target="_blank">email: legco@legco.kz</a></td></tr><tr><td><a href="http://www.legco.kz" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=ru&amp;q=http://www.legco.kz&amp;source=gmail&amp;ust=1518493396905000&amp;usg=AFQjCNFoNEGDDQyJ1wSYPOwnIsL5FtXD1w">www.legco.kz</a></td></tr></tbody></table></span></font></div><div style="height:40px;line-height:40px;font-size:10px">&nbsp;</div></td></tr><tr><td align="center"><div class="m_6607120692376060800mob_100" style="float:left;display:inline-block;width:33%"><table class="m_6607120692376060800mob_100" width="100%" border="0" cellspacing="0" cellpadding="0" align="left" style="border-collapse:collapse"><tbody><tr><td align="left" style="line-height:14px;padding:0 24px"><div style="height:30px;line-height:30px;font-size:10px">&nbsp;</div><div style="line-height:14px"> <a href="http://legco.kz/lists.html" style="color:#596167;font-family:Arial,Helvetica,sans-serif;font-size:12px" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=ru&amp;q=http://legco.kz/lists.html&amp;source=gmail&amp;ust=1518493396905000&amp;usg=AFQjCNHhTn_Rq1dReElUkWA29XVEB7AKkA"> <font face="Arial, Helvetica, sans-serif" size="2" color="#596167"> <img src="https://ci6.googleusercontent.com/proxy/RXxqT43mGtlcXARntXk-o9n7ij_dJOloGv-Iy5eIfUmV1TDupq3R_y-q5e5WjL6RucsQVHxPs78=s0-d-e1-ft#http://legco.kz/mailer/spravki.png" width="107" alt="Списки_LegCo" border="0" class="m_6607120692376060800mob_width_50 CToWUd" style="display:block;width:100%;height:auto"></font></a></div></td></tr></tbody></table></div><div class="m_6607120692376060800mob_100" style="float:left;display:inline-block;width:33%"><table class="m_6607120692376060800mob_100" width="100%" border="0" cellspacing="0" cellpadding="0" align="left" style="border-collapse:collapse"><tbody><tr><td align="center" style="line-height:14px;padding:0 24px"><div style="height:30px;line-height:30px;font-size:10px">&nbsp;</div><div style="line-height:14px"> <a href="http://legco.kz/deals.html" style="color:#596167;font-family:Arial,Helvetica,sans-serif;font-size:12px" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=ru&amp;q=http://legco.kz/deals.html&amp;source=gmail&amp;ust=1518493396905000&amp;usg=AFQjCNEJ53WDBBHR_Wb8KVBqgymgR1ZT5Q"> <font face="Arial, Helvetica, sans-serif" size="2" color="#596167"> <img src="https://ci6.googleusercontent.com/proxy/GCxTJ6OZhjli9LvJNouiOI0qvcKdvTCroJ-UxCKUW7OtJxez8ZJ3XS4iBtzafb3U9Aol=s0-d-e1-ft#http://legco.kz/mailer/se.png" width="103" alt="ie" border="0" class="m_6607120692376060800mob_width_50 CToWUd" style="display:block;width:100%;height:auto"></font></a></div></td></tr></tbody></table></div><div class="m_6607120692376060800mob_100" style="float:left;display:inline-block;width:33%"><table class="m_6607120692376060800mob_100" width="100%" border="0" cellspacing="0" cellpadding="0" align="left" style="border-collapse:collapse"><tbody><tr><td align="right" style="line-height:14px;padding:0 24px"><div style="height:30px;line-height:30px;font-size:10px">&nbsp;</div><div style="line-height:14px"> <a href="http://legco.kz/citizen.html" style="color:#596167;font-family:Arial,Helvetica,sans-serif;font-size:12px" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=ru&amp;q=http://legco.kz/citizen.html&amp;source=gmail&amp;ust=1518493396905000&amp;usg=AFQjCNHVqPJ88BqQGnjBUr0OpYmK7zYWFw"> <font face="Arial, Helvetica, sans-serif" size="2" color="#596167"> <img src="https://ci3.googleusercontent.com/proxy/vbxrWuz4SqIWPtSU4WNPDWz9YtDrxNcJhvqwLPFqmOKm1YG7_L_LV7caN1AoTxMaXIfUndDmqkQ=s0-d-e1-ft#http://legco.kz/mailer/citizen.png" width="116" alt="citizen" border="0" class="m_6607120692376060800mob_width_50 CToWUd" style="display:block;width:100%;height:auto"></font></a></div></td></tr></tbody></table></div></td></tr><tr><td><div style="height:28px;line-height:28px;font-size:10px">&nbsp;</div></td></tr></tbody></table></td></tr><tr><td align="center" bgcolor="#ffffff" style="border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:#eff2f4"><table width="94%" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td><div style="height:28px;line-height:28px;font-size:10px">&nbsp;</div></td></tr></tbody></table></td></tr><tr><td class="m_6607120692376060800iage_footer" align="center" bgcolor="#ffffff"><div style="height:40px;line-height:80px;font-size:10px">&nbsp;</div><table width="100%" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td align="left"> <font face="Arial, Helvetica, sans-serif" size="3" color="#96a5b5" style="font-size:13px"> <span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#96a5b5"> Товарный знак “LegCo” (Legal Communications) принадлежит товариществу с ограниченной ответственностью <a href="http://katpartners.kz" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=ru&amp;q=http://katpartners.kz&amp;source=gmail&amp;ust=1518493396905000&amp;usg=AFQjCNGEpkYGL7raUBfvMwGw6MnWPmHC0g">“K&amp;T Partners (Кей энд Ти Партнерс)”</a>  на основании регистрации от 2 октября 2017 года. <br><br><a href="http://deals.legco.kz/files/agreement1.pdf" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=ru&amp;q=http://legco.kz/docs/agreement.pdf&amp;source=gmail&amp;ust=1518493396905000&amp;usg=AFQjCNEEAFmPQaxLD2p0rMsdz6BKiDcKTQ"> Пользовательское соглашение</a> <br><a href="http://deals.legco.kz/files/policy1.pdf" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=ru&amp;q=http://legco.kz/docs/privacy.pdf&amp;source=gmail&amp;ust=1518493396905000&amp;usg=AFQjCNHKVzIJ-SKkRGoyAm7Cx00MjIx--A"> Политика конфиденциальности</a><br><a href="http://deals.legco.kz/files/paid1.pdf" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=ru&amp;q=http://legco.kz/docs/privacy.pdf&amp;source=gmail&amp;ust=1518493396905000&amp;usg=AFQjCNHKVzIJ-SKkRGoyAm7Cx00MjIx--A"> Соглашение об оказании платных услуг через веб-сервис сделки LegCo</a></span></font></td></tr></tbody></table><div style="height:30px;line-height:30px;font-size:10px">&nbsp;</div></td></tr><tr><td><div style="height:80px;line-height:80px;font-size:10px">&nbsp;</div></td></tr></tbody></table></td></tr></tbody></table>'// html body

            };
            transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                //res.send({message:'Такой почты не зарегестрированно'})
                return console.log(error, 'error');
            } if(info) {
                console.log(info)
            }
        })

}
router.post('/repeatsms1', function(req, res) {
  console.log( req.body.user_id, 'repeatsms1')
  var val = Math.floor(1000 + Math.random() * 9000)
  User.findOne({username: req.body.user_id}).exec((err, user) => {
      if(err) console.log(err)
          if(user){
                sendSms(val, user.username)
                User.findOneAndUpdate({username: req.body.user_id}, {myRandom:val}).exec((err, user) => {
                    if(err) console.log(err)
                        if(user){
                            res.send({message: 'Мы выслали вам повторный код.'})
                        }
                })
          }
          if(!user){
            res.send({message: 'Такой сотовый не зарегестрирован.'})
          }
  })
})
router.post('/repeatsms', function(req, res) {
  console.log( req.body.user_id)
  var val = Math.floor(1000 + Math.random() * 9000)
  User.findOne({_id: req.body.user_id}).exec((err, user) => {
      if(err) console.log(err)
          if(user){
                sendSms(val, user.username)
                User.findOneAndUpdate({_id: req.body.user_id}, {myRandom:val}).exec((err, user) => {
                    if(err) console.log(err)
                        if(user){
                            res.send({message: 'Мы выслали вам повторный код. Если к вам не пришла смс, проверьте указанный вами сотовый.'})
                        }
                })
          }
  })
})

router.post('/verifysms1', function(req, res){
  // console.log( req.body.user_id, req.body.smscode)
  User.findOne({username: req.body.user_id}).exec((err, user) => {
      if(err) console.log(err)
          if(user){
            if(user.myRandom == req.body.smscode){
                User.findOneAndUpdate({username: req.body.user_id}, {isRegistered:true}).exec((err, user) => {
                    if(err) console.log(err)
                        if(user){
                            res.send({message: 'Поздравляем! Вы успешно прошли регистрацию.'})
                        }
                })
            } else {
              res.send({message: 'Неверный Код. Попробуйте еще.'})
            }
          }
  })
})
router.post('/verifysms', function(req, res){
  // console.log( req.body.user_id, req.body.smscode)
  User.findOne({_id: req.body.user_id}).exec((err, user) => {
      if(err) console.log(err)
          if(user){
            if(user.myRandom == req.body.smscode){
                User.findOneAndUpdate({_id: req.body.user_id}, {isRegistered:true}).exec((err, user) => {
                    if(err) console.log(err)
                        if(user){
                            res.send({message: 'Поздравляем! Вы успешно прошли регистрацию.'})
                        }
                })
            } else {
              res.send({message: 'Неверный Код. Попробуйте еще.'})
            }
          }
  })
})
router.post('/signup', function(req, res) {
	var person = JSON.parse(req.body.person);
    username=req.body.username.replace(/[{()}]/g, '')
    username=username.replace(/[{ }]/g, '');
    username=username.replace(/-/g, '');
    if(person.birthDate){
       var birthday=dateFormat(person.birthDate).slice(0,10)
    } else{
       var birthday=person.dob_day+'/'+person.dob_month+'/'+person.dob_year
    }
    if(person.issueddate_day){
        var issueddate = dateFormat(person.issueddate_day).slice(0,10)
    } else{
        var issueddate=person.issueddate_day+'/'+person.issueddate_month+'/'+person.issueddate_year
    }
		User.findOne({  $or: [
            { username : username},
            { email: person.email }
          ]}, function(err, user){
            if(err) {console.log(err);}
            if(!user){

                sendRegLetter(person.email, person.firstname)
                var val = Math.floor(1000 + Math.random() * 9000)
                sendSms(val, username)
                var userData = {
                            username: username,
                            password: bcrypt.hashSync(person.password,10),
  							            firstname: person.firstname,
              							lastname: person.lastname,
              							midname: req.body.midname,
                            birthday: birthday,
                            issueddate: issueddate,
              							email: person.email,
              							udv: person.udv,
              							issuedby: person.issuedby,
              							iin: person.iin,
              							address: person.address,
                            isRegistered: false,
                            myRandom: val,
                            status: 'Физическое Лицо'
                }
                const newUser = new User(userData);
                newUser.save((err, savedUser) => {
                    if (err) console.log(err);
                    else {
                        res.send({my_id: savedUser._id, message:'Поздравляем! Вы успешно прошли регистрацию в роли Физ. лица.'});
                    }
                })
			}
			if(user){
                res.send({message:'Аккаунт с таким номером, либо email уже зарегестрирован.'})
            }
    })
});

router.post('/signupip', function(req, res) {
    var person = JSON.parse(req.body.person);
    username=req.body.username.replace(/[{()}]/g, '')
    username=username.replace(/[{ }]/g, '');
    username=username.replace(/-/g, '');
    console.log(person.dateregip)
    console.log(dateFormat(person.dateregip).slice(0,10))
    if(person.birthDate){
        var birthday=dateFormat(person.birthDate).slice(0,10)
    } else{
       var birthday=person.dob_day+'/'+person.dob_month+'/'+person.dob_year
    }
    if(person.issueddate_day){
        var issueddate = dateFormat(person.issueddate_day).slice(0,10)
    } else{
        var issueddate=person.issueddate_day+'/'+person.issueddate_month+'/'+person.issueddate_year
    }
    if(person.dateregip){

        var dateregip = dateFormat(person.dateregip).slice(0,10)
    } else{
       var dateregip=person.dateregip_day+'/'+person.dateregip_month+'/'+person.dateregip_year
    }
            User.findOne({  $or: [
            { username : username},
            { email: person.email }
          ]}, function(err, user){
            if(err) {console.log(err);}
            if(!user){
                sendRegLetter(person.email, person.firstname)
                var val = Math.floor(1000 + Math.random() * 9000)
                sendSms(val, username)
                var userData = {
                            username: username,
                            password: bcrypt.hashSync(person.password,10),
                            firstname: person.firstname,
                            lastname: person.lastname,
                            midname: req.body.midname,
                            birthday: birthday,
                            issueddate: issueddate,
                            email: person.email,
                            udv: person.udv,
                            issuedby: person.issuedby,
                            iin: person.iin,
                            address: person.address,
                            nameip: person.nameip,
                            noregip: person.noregip,
                            addressregip: person.addressregip,
                            dateregip: dateregip,
                            isRegistered: false,
                            myRandom: val,
                            status: 'Индивидуальный предприниматель'
                           }
                        const newUser = new User(userData);
                        newUser.save((err, savedUser) => {
                        if (err) console.log(err);
                            else {
                                res.send({my_id: savedUser._id, message:'Поздравляем! Вы успешно прошли регистрацию в роли Индивидуального предпринимателя'});
                            }
                        })
            }
            if(user){
                res.send({message:'Аккаунт с таким номером, либо email уже зарегестрирован'})
            }
    })
});
router.get('/getmyname', function(req, res){
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    User.findOne({_id: decoded.sub}).exec((err, user) => {
        if(err) console.log(err)
            if(user){
                res.send({firstname: user.firstname})
            }
    })
})
router.get('/updateemail', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var email = req.query.email
    User.findOneAndUpdate({_id: decoded.sub}, {email:email}).exec((err, user) => {
        if(err) console.log(err)
            if(user){
                res.send({message: 'Email успешно обновлен.'})
            }
    })
})
router.post('/updateipinfo', function(req, res) {
    var changeIp = JSON.parse(req.body.changeIp);
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var itemsProcessed = 0;
    const removeEmpty = (obj) => {
        Object.keys(obj).forEach((key) => (obj[key] == '') && delete obj[key]);
        return obj;
    }
    var mainobj=removeEmpty(changeIp)
    Object.keys(mainobj).forEach(function(i){
        itemsProcessed++;
        if(itemsProcessed==Object.keys(mainobj).length){
            sendAnsw()
        }
        User.findOneAndUpdate({_id: decoded.sub},{[i]:  mainobj[i]}).exec((err, upd) => {
        if(err) console.log(err)
            if(upd){
                console.log('ya update ', i)
            }
        })
    })
    function sendAnsw(){
        res.send({message: "Информация об ИП успешно обновлена."})
    }
    if(req.body.dateregip!=''){
        User.findOneAndUpdate({_id: decoded.sub},{dateregip: req.body.dateregip}).exec((err, upd) => {
            if(err) console.log(err)
                if(upd){
                   // console.log(mainobj[i])
                    console.log('ya update dateregip')
                }
        })
    }
})



router.post('/updatepersonalinfo', function(req, res) {
    var person = JSON.parse(req.body.person);
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var itemsProcessed = 0;
    const removeEmpty = (obj) => {
        Object.keys(obj).forEach((key) => (obj[key] == '') && delete obj[key]);
        return obj;
    }
    var mainobj=removeEmpty(person)
    Object.keys(mainobj).forEach(function(i){
        itemsProcessed++;
        if(itemsProcessed==Object.keys(mainobj).length){
            sendAnsw()
        }
        User.findOneAndUpdate({_id: decoded.sub},{[i]:  mainobj[i]}).exec((err, upd) => {
        if(err) console.log(err)
            if(upd){
                // console.log(mainobj[i])
                console.log('ya update ', i)
            }
        })
    })
    function sendAnsw(){
        res.send({message: "Персональная ифнормация успешно обновлена."})
    }
    if(req.body.birthday!='//'){
        User.findOneAndUpdate({_id: decoded.sub},{birthday: req.body.birthday}).exec((err, upd) => {
            if(err) console.log(err)
                if(upd){
                   // console.log(mainobj[i])
                    console.log('ya update birthday')
                }
        })
    }
    if(req.body.issueddate!='//'){
        User.findOneAndUpdate({_id: decoded.sub},{issueddate: req.body.issueddate}).exec((err, upd) => {
            if(err) console.log(err)
                if(upd){
                   // console.log(mainobj[i])
                    console.log('ya update issueddate')
                }
        })
    }
})
router.post('/updatepassword', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    User.findOne({_id: decoded.sub}).exec((err, user) => {
        if(err) console.log(err)
            if(user){
                return user.comparePassword(req.body.oldpassword, (passwordErr, isMatch) => {
                    if (err) { return done(err); }
                    if (!isMatch) {
                        res.send({message: 'Вы указали неверный пароль'})
                    }
                    if(isMatch){
                        console.log('isMatch')
                        User.findOneAndUpdate({_id: decoded.sub},{password: bcrypt.hashSync(req.body.password,10),}).exec((err, upd) => {
                            if(err) console.log(err)
                                if(upd){
                                    res.send({message: 'Пароль успешно обновлен.'})
                                    console.log('ya update password')
                                }
                        })
                    }
                });
            }
    })
})
router.post('/changepassword', function(req, res) {
      User.findOne({username:req.body.username}).exec((err, user) => {
        if(err) console.log(err)
        if(user){
          if(user.myRandom==req.body.smscode){
            User.findOneAndUpdate({username: req.body.username},{password: bcrypt.hashSync(req.body.password,10),}).exec((err, upd) => {
              if(err) cosnole.log(err)
              if(upd){
                res.send({message: 'Пароль успешно изменен.'})
              }
            })
          } else {
            res.send({message: 'Вы ввели неверный код.'})
          }
        }
      })

})
router.get('/getalldeals', function(req,res) {
    Deal.find({}, (err, deals) => {
        if(err) console.log(err)
            if(deals){
                // User.find({}, function(err, users){
                //     if(err) console.log(err)
                //         else {
                //             res.send({
                //                 deals: deals,
                //                 users: users
                //             })
                //         }
                // })
                res.send({
                    deals:deals
                })
            }
    })

})
function dateFormat(date){
   var fDate = new Date(date);

   var m = ((fDate.getMonth() * 1 + 1) < 10) ? ("0" + (fDate.getMonth() * 1 + 1)) : (fDate.getMonth() * 1 + 1);
   var d = ((fDate.getDate() * 1) < 10) ? ("0" + (fDate.getDate() * 1)) : (fDate.getDate() * 1);
   return d + "/" + m + "/" + fDate.getFullYear()+'-'+fDate.getHours()+':'+fDate.getMinutes()
 }
function UserTimeLineRequest(to_user, from_user, status){
        //console.log('createee')

    var today =  Date()
    var timeLine = {
        iam: to_user,
        from: from_user,
        date: dateFormat(today),
        title: status,
        isOpen: 'false'
    }
    const newDealTimeline = new UserTimeline(timeLine);
    newDealTimeline.save((err, timeline) => {
        if(err) console.log(err)
    })

}
router.get('/addtofriend', function(req, res) {
    var friend_id = req.query.friend_id
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    sendPush(friend_id, 'Запрос на добавление в друзья','111','111')
    UserTimeLineRequest(friend_id,  decoded.sub, 'Запрос на добавление в друзья')
    var relationState1 = {
        iam: decoded.sub,
        myfriend:friend_id,
        status: 'waiting'
    }
    relationState2 = {
        iam: friend_id,
        myfriend: decoded.sub,
        status: 'requested'
    }
    Relation.findOne({iam: decoded.sub, myfriend:friend_id }).exec((err, rel) => {
        if(err) console.log(err)
            if(rel) {
                res.send({message: 'Запрос уже отправлен. Ожидайте ответ.'})
            }
            if(!rel){
               Save()
            }
    })

    function  Save() {
        const newRelation= new Relation(relationState1);
        newRelation.save((err, relation) => {
            if(err) console.log(err)
                if(relation) {
                    const newRelation2 = new Relation(relationState2);
                    newRelation2.save((err, relation) => {
                        if(err) console.log(err)
                            if(relation) {
                                res.send({message: 'Запрос был успешно отправлен. Ожидайте ответ.', roomname: relation._id})
                            }
                    })
                }
        })
    }


})
router.get('/acceptfriendship', function(req, res) {
    var friend_id = req.query.friend_id
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    sendPush(friend_id, 'Контрагент принял ваш запрос на добавление','222','222')
    UserTimeLineRequest(friend_id,  decoded.sub, 'Контрагент принял ваш запрос на добавление')
    var roomname = ''
    Relation.findOneAndUpdate({iam: decoded.sub, myfriend: friend_id},{status: "accepted" }).exec((err, upd) => {
        if(err) console.log(err)
            if(upd) {
                roomname = upd._id
                // console.log(upd._id, '1')
                Relation.findOneAndUpdate({iam:friend_id,  myfriend: decoded.sub},{status: "accepted" }).exec((err, upd) => {
                    if(err) console.log(err)
                        if(upd) {
                            //console.log(upd._id, '2')
                            res.send({message: 'Вы добавили контрагента.', roomname: roomname})
                        }
                })
            }
    })
})
router.get('/refusefriendship', function(req, res) {
    var friend_id = req.query.friend_id
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    sendPush(friend_id, 'Контрагент отклонил ваш запрос на добавление','222','222')
    UserTimeLineRequest(friend_id,  decoded.sub, 'Контрагент отклонил ваш запрос на добавление')
    Relation.findOne({iam:decoded.sub, myfriend: friend_id}).remove().exec((err, del) => {
        if (err) console.log(err)
            if(del) {
                Relation.findOne({iam: friend_id, myfriend: decoded.sub}).remove().exec((err, del) => {
                    if(err) console.log('err')
                        if(del) {

                            res.send({message: 'Вы отклонили контрагента.'})
                        }
                })
            }
    })
})
router.get('/getmyrequests', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    function out_requests(income_req) {

        Relation.find({iam: decoded.sub, status: 'waiting'}).populate('myfriend').exec((err, out_requests) => {
        if(err) console.log(err)
            if(out_requests){
                res.send({in_requests: income_req, out_requests: out_requests})
            }
        })

    }
    Relation.find({iam: decoded.sub, status: 'requested'}).populate('myfriend').exec((err, in_requests) => {
        if(err) console.log(err)
            if(in_requests){
                out_requests(in_requests)
                //res.send({in_requests: in_requests})
            }
    })
})
router.get('/getmykontragents', function(req, res) {
    var token = req.headers.authorization.split(' ')[1]
    var decoded = jwtDecode(token);
    // console.log(decoded)
    Relation.find({iam:decoded.sub, status: 'accepted'}).populate('myfriend').exec((err, kontragents) => {
        if(err) console.log(err)
            if(kontragents){
                // console.log(kontragents, 'kontragents')
                res.send({kontragents: kontragents})
            }
    })
})
router.get('/getmydashboard', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    User.findOne({_id: decoded.sub}).exec((err, user) => {
        if(err) console.log(err)
            if(user){
                res.send({user:user})
            }
    })
})
router.post('/getolddeal', function(req, res){
    var lawid = req.body.lawid
    var deal_id = req.body.dealid
    function Dec(ciphertext){
        let decrypted = fieldEncryption.decrypt(ciphertext, SK);
        return decrypted
    }
    if(lawid=='406'){
      Deal406Old.findOne({deal_id: dealid}).populate('buyer seller').exec((err, oldd) => {
          if(err) console.log('err')
              if(oldd){
                  var itemname = Dec(oldd.itemname)
                  var quantity = Dec(oldd.quantity)
                  var price = Dec(oldd.price)
                  var payday = Dec(oldd.payday)
                  var getbackday = Dec(oldd.getbackday)
                  var quality = Dec(oldd.quality)
                  var description = Dec(oldd.description)
                  var state = Dec(oldd.state)
                  var expire = Dec(oldd.expire)
                  var complexity = Dec(oldd.complexity)
                  var additional = Dec(oldd.additional)
                  //console.log(deal1)
                  var olddeal = {
                      deal_name: oldd.deal_name,
                      lawid:oldd.lawid,
                      deal_id:oldd.deal_id,
                      duedate:oldd.duedate,
                      seller: oldd.seller,
                      buyer: oldd.buyer,

                      itemname: itemname,
                      quantity: quantity,
                      price: price,
                      payday: payday,
                      getbackday:getbackday,
                      quality: quality,
                      description: description,
                      state: state,
                      expire: expire,
                      complexity: complexity,
                      additional:additional
                  }
                  res.send({
                      olddeal:olddeal
                  })
              }
              if(!oldd) res.send({olddeal: {}})
      })

    }
    if(lawid=='501'){
      Deal501Old.findOne({deal_id: deal_id}).populate('side1 side2').exec((err, oldd) => {
          if(err) console.log('err')
              if(oldd){
                  var itemname1 = Dec(oldd.itemname1)
                  var quantity1 = Dec(oldd.quantity1)
                  var price1 = Dec(oldd.price1)
                  var quality1 = Dec(oldd.quality1)
                  var description1 = Dec(oldd.description1)
                  var state1 = Dec(oldd.state1)
                  var itemname2 = Dec(oldd.itemname2)
                  var quantity2 = Dec(oldd.quantity2)
                  var price2 = Dec(oldd.price2)
                  var quality2 = Dec(oldd.quality2)
                  var description2 = Dec(oldd.description2)
                  var state2 = Dec(oldd.state2)

                  var deadline = Dec(oldd.deadline)
                  var additional = Dec(oldd.additional)
                  //console.log(deal1)
                  var olddeal = {
                      deal_name: oldd.deal_name,
                      lawid:oldd.lawid,
                      deal_id:oldd.deal_id,
                      duedate:oldd.duedate,
                      side1: oldd.side1,
                      side2: oldd.side2,

                      itemname1: itemname1,
                      quantity1: quantity1,
                      price1: price1,
                      quality1: quality1,
                      description1: description1,
                      state1:state1,
                      itemname2: itemname2,
                      quantity2: quantity2,
                      price2: price2,
                      quality2: quality2,
                      description2: description2,
                      state2: state2,
                      deadline: deadline,
                      additional:additional
                  }
                  res.send({
                      olddeal:olddeal
                  })
              }
              if(!oldd) res.send({olddeal: {}})
      })

    }
    if(lawid=='846'){
      Deal846Old.findOne({deal_id: dealid}).populate('attorney principal').exec((err, oldd) => {
          if(err) console.log('err')
              if(oldd){
                  var description = Dec(oldd.description)
                  var priceaward = Dec(oldd.priceaward)
                  var payday = Dec(oldd.payday)
                  var rules = Dec(oldd.rules)
                  var additional = Dec(oldd.additional)

                  var olddeal = {
                      deal_name: oldd.deal_name,
                      lawid:oldd.lawid,
                      deal_id:oldd.deal_id,
                      duedate:oldd.duedate,
                      termofassignment:oldd.termofassignment,
                      attorney: oldd.attorney,
                      principal: oldd.principal,

                      description: description,
                      priceaward: priceaward,
                      payday: payday,
                      rules: rules,
                      additional:additional
                  }
                  res.send({
                      olddeal:olddeal
                  })
              }
              if(!oldd) res.send({olddeal: {}})
      })

    }
    if(lawid=='540'){
      Deal540Old.findOne({deal_id: dealid}).populate('employer employee').exec((err, oldd) => {
          if(err) console.log('err')
              if(oldd){
                  var deadline = Dec(oldd.deadline)
                  var usecondition = Dec(oldd.usecondition)
                  var keepcondition = Dec(oldd.keepcondition)
                  var itemdata = Dec(oldd.itemdata)
                  var payday = Dec(oldd.payday)
                  var additional = Dec(oldd.additional)
                  //console.log(deal1)
                  var olddeal = {
                      deal_name: oldd.deal_name,
                      lawid:oldd.lawid,
                      deal_id:oldd.deal_id,
                      duedate:oldd.duedate,
                      employer: oldd.employer,
                      employee: oldd.employee,

                      itemdata: itemdata,
                      keepcondition: keepcondition,
                      usecondition: usecondition,
                      payday: payday,
                      deadline: deadline,
                      additional:additional
                  }
                  res.send({olddeal:olddeal})
              }
              if(!oldd) res.send({olddeal: {}})
      })
    }
    if(lawid=='604'){
      Deal604Old.findOne({deal_id: dealid}).populate('lender borrower').exec((err, oldd) => {
          if(err) console.log('err')
              if(oldd){
                  var giveawaydeadline = Dec(oldd.giveawaydeadline)
                  var usecondition = Dec(oldd.usecondition)
                  var keepcondition = Dec(oldd.keepcondition)
                  var itemdata = Dec(oldd.itemdata)
                  var additional = Dec(oldd.additional)
                  //console.log(deal1)
                  var olddeal = {
                      deal_name: oldd.deal_name,
                      lawid:oldd.lawid,
                      deal_id:oldd.deal_id,
                      duedate:oldd.duedate,
                      usedeadline: oldd.usedeadline,
                      lender: oldd.lender,
                      borrower: oldd.borrower,

                      itemdata: itemdata,
                      keepcondition: keepcondition,
                      usecondition: usecondition,
                      giveawaydeadline: giveawaydeadline,
                      additional:additional
                  }
                  res.send({olddeal:olddeal})
              }
              if(!oldd) res.send({olddeal: {}})
      })
    }
    if(lawid=='683'){
        Deal683Old.findOne({deal_id: dealid}).populate('employer employee').exec((err, oldd) => {
            if(err) console.log('err')
                if(oldd){
                    var olddeal={
                        deal_name: oldd.deal_name,
                        lawid:oldd.lawid,
                        deal_id:oldd.deal_id,
                        duedate:oldd.duedate,
                        deadline: oldd.deadline,
                        employer: oldd.employer,
                        employee: oldd.employee,

                        description: Dec(oldd.description),
                        price: Dec(oldd.price),
                        quality: Dec(oldd.quality),
                        paydeadline: Dec(oldd.paydeadline),
                        additional:Dec(oldd.additional)

                    }
                     res.send({olddeal:olddeal})
                }
                if(!oldd) res.send({olddeal: {}})
        })
    }
    if(lawid == '865' ){
        Deal865Old.findOne({deal_id: deal_id}).populate('agent principal').exec((err, oldd) => {
            if(err) console.log(err)
                if(oldd) {
                    var olddeal = {
                        deal_name: oldd.deal_name,
                        lawid:oldd.lawid,
                        deal_id:oldd.deal_id,
                        duedate:oldd.duedate,
                        additional: Dec(oldd.additional),
                        agent:oldd.agent,
                        principal:oldd.principal,
                        instructionprincipal: Dec(oldd.instructionprincipal),
                        sizeaward: Dec(oldd.sizeaward),
                        order: Dec(oldd.order),
                        payday:Dec(oldd.payday)

                    }
                    res.send({olddeal:olddeal})
                }
                if(!oldd) res.send({olddeal: {}})
        })
    }
    if(lawid == '768' ){
        Deal768Old.findOne({deal_id: deal_id}).populate('keeper bailor').exec((err, oldd) => {
            if(err) console.log(err)
                if(oldd) {
                    var olddeal = {
                            deal_name: oldd.deal_name,
                            lawid: oldd.lawid,
                            deal_id: oldd.deal_id,
                            duedate: oldd.duedate,
                            shelfdate: oldd.shelfdate,
                            keeper: oldd.keeper,
                            bailor: oldd.bailor,

                            payday: Dec(oldd.payday),
                            itemname: Dec(oldd.itemname),
                            awardamount: Dec(oldd.awardamount),
                            responsibility: Dec(oldd.responsibility),
                            additional: Dec(oldd.additional),
                    }
                    res.send({olddeal:olddeal})
                }
                if(!oldd) res.send({olddeal: {}})
        })
    }
    if(lawid == '688' ){
        Deal688Old.findOne({deal_id: deal_id}).populate('sender сarrier').exec((err, oldd) => {
            if(err) console.log(err)
                if(oldd) {
                    //tut ostanovilas
                                var olddeal = {
                            deal_name: oldd.deal_name,
                            lawid: oldd.lawid,
                            deal_id: oldd.deal_id,
                            duedate: oldd.duedate,
                            shippingday: oldd.shippingday,
                            сarrier: oldd.сarrier,
                            sender: oldd.sender,

                            transportableproperty: Dec(oldd.transportableproperty),
                            shippingaddress: Dec(oldd.shippingaddress),
                            payday:Dec(oldd.payday),
                            deliveryaddress: Dec(oldd.deliveryaddress),
                            recipientofproperty: Dec(oldd.recipientofproperty),
                            shippingprice: Dec(oldd.shippingprice),
                            additional:Dec(oldd.additional),
                        }
                     res.send({olddeal:olddeal})
                }
                if(!oldd) {
                    res.send({olddeal: {}})
                }
        })
    }
    if(lawid == '616' ){
        Deal616Old.findOne({deal_id: deal_id}).populate('employer employee').exec((err, oldd) => {
            if(err) console.log(err)
                if(oldd) {
                        var olddeal = {
                            deal_name: oldd.deal_name,
                            lawid: oldd.lawid,
                            deal_id: oldd.deal_id,
                            duedate: oldd.duedate,
                            workdeadline: oldd.workdeadline,
                            employer: oldd.employer,
                            employee: oldd.employee,

                            payday: Dec(oldd.payday),
                            workdescription: Dec(oldd.workdescription),
                            workaddress: Dec(oldd.workaddress),
                            workprice: Dec(oldd.workprice),
                            workcheck: Dec(oldd.workcheck),
                            quantity: Dec(oldd.quantity),
                            additional: Dec(oldd.additional)
                        }
                     res.send({olddeal:olddeal})
                }
                if(!oldd) {
                    res.send({olddeal: {}})
                }
        })
    }
    if(lawid == '506'){
        Deal506Old.findOne({deal_id: dealid}).populate('presenter receiver').exec((err, oldd) => {
            if(err) console.log('err')
                if(oldd){
                    var itemname = Dec(oldd.itemname)
                    var quantity = Dec(oldd.quantity)
                    var additional = Dec(oldd.additional)
                    var deadline = Dec(oldd.deadline)
                    var olddeal = {
                            deal_name: oldd.deal_name,
                            lawid: lawid,
                            deal_id: oldd.deal_id,
                            duedate: oldd.duedate,
                            presenter: oldd.presenter,
                            receiver: oldd.receiver,

                            itemname: itemname,
                            quantity: quantity,
                            additional: additional,
                            deadline: deadline
                    }
                    res.send({
                        olddeal: olddeal
                    })
                }
                if(!oldd) {
                    res.send({olddeal: {}})
                }
        })
    }
        if(lawid=='715'){
        Deal715Old.findOne({deal_id: dealid}).populate('giver borrower').exec((err, oldd) => {
            if(err) console.log('err')
                if(oldd){
                    var additional = Dec(oldd.additional)
                    var deadline = Dec(oldd.deadline)
                    var awardamount = Dec(oldd.awardamount)
                    var loanamount = Dec(oldd.loanamount)
                    //console.log(deal1)
                    var olddeal={
                        deal_name: oldd.deal_name,
                        lawid:oldd.lawid,
                        deal_id:oldd.deal_id,
                        duedate:oldd.duedate,
                        loanterm: oldd.loanterm,

                        borrower: oldd.borrower,
                        giver: oldd.giver,
                        loanamount: loanamount,
                        awardamount: awardamount,
                        deadline: deadline,
                        additional:additional

                    }
                      res.send({
                        olddeal: olddeal
                    })
                }
                  if(!oldd) {
                    res.send({olddeal: {}})
                }
        })
    }
})

router.post('/getinfodeal', function(req, res) {
    lawid=req.body.lawid
    dealid=req.body.dealid
    function Dec(ciphertext){
        let decrypted = fieldEncryption.decrypt(ciphertext, SK);
        return decrypted
    }
    if(lawid=='406'){
      Deal406.findOne({deal_id: dealid}).populate('seller buyer').exec((err, deal1) => {
          if(err) console.log('err')
              if(deal1){
                  var itemname = Dec(deal1.itemname)
                  var quantity = Dec(deal1.quantity)
                  var price = Dec(deal1.price)
                  var payday = Dec(deal1.payday)
                  var getbackday = Dec(deal1.getbackday)
                  var quality = Dec(deal1.quality)
                  var description = Dec(deal1.description)
                  var state = Dec(deal1.state)
                  var expire = Dec(deal1.expire)
                  var complexity = Dec(deal1.complexity)
                  var additional = Dec(deal1.additional)
                  //console.log(deal1)
                  var deal = {
                      deal_name: deal1.deal_name,
                      lawid:deal1.lawid,
                      deal_id:deal1.deal_id,
                      duedate:deal1.duedate,
                      seller: deal1.seller,
                      buyer: deal1.buyer,

                      itemname: itemname,
                      quantity: quantity,
                      price: price,
                      payday: payday,
                      getbackday:getbackday,
                      quality: quality,
                      description: description,
                      state: state,
                      expire: expire,
                      complexity: complexity,
                      additional:additional
                  }
                  res.send({
                      deal:deal
                  })
              }
      })

    }
    if(lawid=='501'){
      Deal501.findOne({deal_id: dealid}).populate('side1 side2').exec((err, deal1) => {
          if(err) console.log('err')
              if(deal1){
                  var itemname1 = Dec(deal1.itemname1)
                  var quantity1 = Dec(deal1.quantity1)
                  var price1 = Dec(deal1.price1)
                  var quality1 = Dec(deal1.quality1)
                  var description1 = Dec(deal1.description1)
                  var state1 = Dec(deal1.state1)
                  var itemname2 = Dec(deal1.itemname2)
                  var quantity2 = Dec(deal1.quantity2)
                  var price2 = Dec(deal1.price2)
                  var quality2 = Dec(deal1.quality2)
                  var description2 = Dec(deal1.description2)
                  var state2 = Dec(deal1.state2)

                  var deadline = Dec(deal1.deadline)
                  var additional = Dec(deal1.additional)
                  //console.log(deal1)
                  var deal = {
                      deal_name: deal1.deal_name,
                      lawid:deal1.lawid,
                      deal_id:deal1.deal_id,
                      duedate:deal1.duedate,
                      side1: deal1.side1,
                      side2: deal1.side2,

                      itemname1: itemname1,
                      quantity1: quantity1,
                      price1: price1,
                      quality1: quality1,
                      description1: description1,
                      state1:state1,
                      itemname2: itemname2,
                      quantity2: quantity2,
                      price2: price2,
                      quality2: quality2,
                      description2: description2,
                      state2: state2,
                      deadline: deadline,
                      additional:additional
                  }
                  res.send({
                      deal:deal
                  })
              }
      })

    }
    if(lawid=='846'){
      Deal846.findOne({deal_id: dealid}).populate('attorney principal').exec((err, deal1) => {
          if(err) console.log('err')
              if(deal1){
                  var description = Dec(deal1.description)
                  var priceaward = Dec(deal1.priceaward)
                  var payday = Dec(deal1.payday)
                  var rules = Dec(deal1.rules)
                  var additional = Dec(deal1.additional)
                  //console.log(deal1)
                  var deal = {
                      deal_name: deal1.deal_name,
                      lawid:deal1.lawid,
                      deal_id:deal1.deal_id,
                      duedate:deal1.duedate,
                      termofassignment:deal1.termofassignment,
                      attorney: deal1.attorney,
                      principal: deal1.principal,

                      description: description,
                      priceaward: priceaward,
                      payday: payday,
                      rules: rules,
                      additional:additional
                  }
                  res.send({
                      deal:deal
                  })
              }
      })

    }
    if(lawid=='540'){
      Deal540.findOne({deal_id: dealid}).populate('employer employee').exec((err, deal1) => {
          if(err) console.log('err')
              if(deal1){
                  var itemdata = Dec(deal1.itemdata)
                  var keepcondition = Dec(deal1.keepcondition)
                  var usecondition = Dec(deal1.usecondition)
                  var payday = Dec(deal1.payday)
                  var deadline = Dec(deal1.deadline)
                  var additional = Dec(deal1.additional)
                  //console.log(deal1)
                  var deal = {
                      deal_name: deal1.deal_name,
                      lawid:deal1.lawid,
                      deal_id:deal1.deal_id,
                      duedate:deal1.duedate,
                      employer: deal1.employer,
                      employee: deal1.employee,

                      itemdata: itemdata,
                      keepcondition: keepcondition,
                      usecondition: usecondition,
                      payday: payday,
                      deadline: deadline,
                      additional:additional
                  }
                  res.send({
                      deal:deal
                  })
              }
      })

    }
    if(lawid=='604'){
      Deal604.findOne({deal_id: dealid}).populate('lender borrower').exec((err, deal1) => {
          if(err) console.log('err')
              if(deal1){
                  var giveawaydeadline = Dec(deal1.giveawaydeadline)
                  var usecondition = Dec(deal1.usecondition)
                  var keepcondition = Dec(deal1.keepcondition)
                  var itemdata = Dec(deal1.itemdata)
                  var additional = Dec(deal1.additional)
                  //console.log(deal1)
                  var deal = {
                      deal_name: deal1.deal_name,
                      lawid:deal1.lawid,
                      deal_id:deal1.deal_id,
                      duedate:deal1.duedate,
                      usedeadline: deal1.usedeadline,
                      lender: deal1.lender,
                      borrower: deal1.borrower,

                      itemdata: itemdata,
                      keepcondition: keepcondition,
                      usecondition: usecondition,
                      giveawaydeadline: giveawaydeadline,
                      additional:additional
                  }
                  res.send({
                      deal:deal
                  })
              }
      })
    }
    if(lawid=='683'){
        Deal683.findOne({deal_id: dealid}).populate('employer employee').exec((err, deal1) => {
            if(err) console.log('err')
                if(deal1){
                    var description = Dec(deal1.description)
                    var price = Dec(deal1.price)
                    var quality = Dec(deal1.quality)
                    var paydeadline = Dec(deal1.paydeadline)
                    var additional = Dec(deal1.additional)
                    //console.log(deal1)
                    var deal = {
                        deal_name: deal1.deal_name,
                        lawid:deal1.lawid,
                        deal_id:deal1.deal_id,
                        duedate:deal1.duedate,
                        deadline: deal1.deadline,
                        employer: deal1.employer,
                        employee: deal1.employee,

                        description: description,
                        price: price,
                        quality: quality,
                        paydeadline: paydeadline,
                        additional:additional
                    }
                    res.send({
                        deal:deal
                    })
                }
        })
    }
    if(lawid=='715'){
        Deal715.findOne({deal_id: dealid}).populate('giver borrower').exec((err, deal1) => {
            if(err) console.log('err')
                if(deal1){
                    var additional = Dec(deal1.additional)
                    var deadline = Dec(deal1.deadline)
                    var awardamount = Dec(deal1.awardamount)
                    var loanamount = Dec(deal1.loanamount)
                    //console.log(deal1)
                    var deal={
                        deal_name: deal1.deal_name,
                        lawid:deal1.lawid,
                        deal_id:deal1.deal_id,
                        duedate:deal1.duedate,
                        loanterm: deal1.loanterm,

                        borrower: deal1.borrower,
                        giver: deal1.giver,
                        loanamount: loanamount,
                        awardamount: awardamount,
                        deadline: deadline,
                        additional:additional

                    }
                    res.send({
                        deal:deal
                    })
                }
        })
    }
    if(lawid=='865'){
        Deal865.findOne({deal_id: dealid}).populate('agent principal').exec((err, deal1) => {
            if(err) console.log('err')
                if(deal1){
                    var additional = Dec(deal1.additional)
                    var instructionprincipal = Dec(deal1.instructionprincipal)
                    var sizeaward = Dec(deal1.sizeaward)
                    var order = Dec(deal1.order)
                    var payday = Dec(deal1.payday)
                    //console.log(deal1)
                    var deal={
                        deal_name: deal1.deal_name,
                        lawid:deal1.lawid,
                        deal_id:deal1.deal_id,
                        duedate:deal1.duedate,
                        additional: additional,
                        agent:deal1.agent,
                        principal:deal1.principal,
                        instructionprincipal: instructionprincipal,
                        sizeaward: sizeaward,
                        order: order,
                        payday: payday
                    }
                    res.send({
                        deal:deal
                    })
                }
        })
    }
    if(lawid=='768'){
        Deal768.findOne({deal_id: dealid}).populate('keeper bailor').exec((err, deal1) => {
            if(err) console.log('err')
                if(deal1){
                    var itemname = Dec(deal1.itemname)
                    var awardamount = Dec(deal1.awardamount)
                    var responsibility = Dec(deal1.responsibility)
                    var additional = Dec(deal1.additional)
                    var payday = Dec(deal1.payday)
                    var deal = {
                        deal_name: 'Договор хранения',
                        lawid: lawid,
                        deal_id: deal1.deal_id,
                        duedate: deal1.duedate,
                        shelfdate: deal1.shelfdate,
                        keeper: deal1.keeper,
                        bailor: deal1.bailor,

                        payday: payday,
                        itemname: itemname,
                        awardamount: awardamount,
                        responsibility: responsibility,
                        additional: additional,
                    }
                    res.send({
                        deal: deal
                    })
                }
        })
    }
    if(lawid=='688'){
        Deal688.findOne({deal_id: dealid}).populate('сarrier sender').exec((err, deal1) => {
            if(err) console.log('err')
                if(deal1){
                    var transportableproperty = Dec(deal1.transportableproperty)
                    var shippingaddress = Dec(deal1.shippingaddress)
                    var payday = Dec(deal1.payday)
                    var deliveryaddress = Dec(deal1.deliveryaddress)
                    var recipientofproperty = Dec(deal1.recipientofproperty)
                    var shippingprice = Dec(deal1.shippingprice)
                    var additional = Dec(deal1.additional)
                    var deal = {
                            deal_name: 'Договор перевозки',
                            lawid: lawid,
                            deal_id: deal1.deal_id,
                            duedate: deal1.duedate,
                            shippingday: deal1.shippingday,
                            сarrier: deal1.сarrier,
                            sender: deal1.sender,

                            transportableproperty: transportableproperty,
                            shippingaddress: shippingaddress,
                            payday: payday,
                            deliveryaddress: deliveryaddress,
                            recipientofproperty: recipientofproperty,
                            shippingprice: shippingprice,
                            additional:additional
                    }
                    res.send({
                        deal: deal
                    })
                }
        })
    }
    if(lawid=='616'){

        Deal616.findOne({deal_id: dealid}).populate('employer employee').exec((err, deal1) => {
            if(err) console.log('err')
                if(deal1){
                    var workdescription = Dec(deal1.workdescription)
                    var workaddress = Dec(deal1.workaddress)
                    var workprice = Dec(deal1.workprice)
                    var workcheck = Dec(deal1.workcheck)
                    var quantity = Dec(deal1.quantity)
                    var additional = Dec(deal1.additional)
                    var payday = Dec(deal1.payday)
                    var deal = {
                            deal_name: deal1.deal_name,
                            lawid: lawid,
                            deal_id: deal1.deal_id,
                            duedate: deal1.duedate,
                            workdeadline: deal1.workdeadline,
                            employer: deal1.employer,
                            employee: deal1.employee,

                            payday: payday,
                            workdescription: workdescription,
                            workaddress: workaddress,
                            workprice: workprice,
                            workcheck: workcheck,
                            quantity: quantity,
                            additional:additional
                    }
                    res.send({
                        deal: deal
                    })
                }
        })
    }
    if(lawid=='506'){

        Deal506.findOne({deal_id: dealid}).populate('receiver presenter').exec((err, deal1) => {
            if(err) console.log('err')
                if(deal1){
                    var itemname = Dec(deal1.itemname)
                    var quantity = Dec(deal1.quantity)
                    var additional = Dec(deal1.additional)
                    var deadline = Dec(deal1.deadline)
                    var deal = {
                            deal_name: deal1.deal_name,
                            lawid: lawid,
                            deal_id: deal1.deal_id,
                            duedate: deal1.duedate,
                            presenter: deal1.presenter,
                            receiver: deal1.receiver,

                            itemname: itemname,
                            quantity: quantity,
                            additional: additional,
                            deadline: deadline
                    }
                    res.send({
                        deal: deal
                    })
                }
        })
    }
})

router.get('/searchmykontragents', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var remove_them=[]
    remove_them.push(decoded.sub)
    function updateUsers () {
        User.find({_id : {$nin : remove_them}}, (err, allusers) => {
            if(err) console.log(err)
                if(allusers){

                    res.send({allusers:allusers})
                }
        })
    }
    var itemsProcessed = 0;
    Relation.find({iam:decoded.sub}).exec((err, relation) => {
        if(err) console.log(err)
            if(relation) {
                relation.forEach(function(i) {
                    itemsProcessed++;
                    remove_them.push(i.myfriend)
                    if(itemsProcessed==relation.length){
                        updateUsers()
                    }
                    // else {
                    //     remove_them.push(i.myfriend)
                    //     itemsProcessed++;
                    // }
                })
            }
            if(relation.length==0){
                //console.log('ppp')
                updateUsers()
            }
    })
})
router.get('/getmypersonalinfo', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    // console.log(decoded.sub, 'eeeeeeeeeee')
    User.findOne({_id: decoded.sub}).exec((err, me) => {
        if(err) console.log(err)
            if(me){
                res.send({me:me})
            }
    })
})
router.get('/getmystatus', function(req, res) {
    var deal_id=req.query.deal_id
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var create_as_ip_str =''
    //console.log('eeeeeeeeeee')
    var create_as_ip = function(){
        DealTimeline.findOne({action_initiator: decoded.sub, deal_id:deal_id, title: 'Cоздан проект сделки.'}).exec((err,ip)=>{
        if(err) console.log(err)
            if(ip){
                if(ip.role_status=='Индивидуальный предприниматель' ){
                    create_as_ip_str='accept_as_ip'
                } else{
                    create_as_ip_str='accept_as_fiz'
                }
            }
            if(!ip) {
                return create_as_ip_str
            }
        })
    }
    var a = create_as_ip()

    //var b = create_as_fiz()
    DealState.findOne({deal_id: deal_id}).populate('deal_id').exec((err, deal1) => {
        if(err) console.log(err)
            if(deal1){
                if(deal1.initiator == decoded.sub){
                    // console.log(create_as_ip_str,'11')
                    res.send({
                        status: 'initiator',
                        dealstatus: deal1.deal_id.status,
                        acceptor_status: deal1.acceptor_status,
                        initiator_status: deal1.initiator_status,
                        create_as_ip: create_as_ip_str
                    })
                } else {
                    //console.log(create_as_ip_str,'22')
                    res.send({
                        status:'acceptor',
                        acceptor_status: deal1.acceptor_status,
                        initiator_status: deal1.initiator_status,
                        dealstatus: deal1.deal_id.status,
                        create_as_ip: create_as_ip_str
                    })
                }

            }
    })
})



router.get('/getdenyreason', function(req, res) {
    var deal_id=req.query.deal_id
    console.log()
    DealReason.findOne({deal_id: deal_id}).exec((err, reason) => {
        if(err) console.log(err)
            if(reason){
                console.log(reason)
                res.send({message: reason.reason})
            }
    })
})
router.get('/acceptdeny', function(req, res) {
    var deal_id=req.query.deal_id
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    DealParent.findOneAndUpdate({_id:deal_id}, {status: 'denied2'}).exec((err, upd) => {
                        if(err) console.log(err)
                            if(upd){
                                DealState.findOneAndUpdate({deal_id:deal_id}, {acceptor_status: 'accepted_deny'}).exec((err, upd) => {
                                    if(err) console.log(err)
                                        if(upd){
                                          var sendto = ''
                                          if(upd.initiator == decoded.sub) {
                                            //  modifyDealstate(upd.acceptor)
                                              sendto = upd.acceptor
                                          } else{
                                              //modifyDealstate(upd.initiator)
                                              sendto = upd.initiator
                                          }
                                            acceptDenyTimeline(decoded.sub, deal_id, upd.lawid, sendto)
                                            res.send({message: 'Вы приняли запрос на расторжение сделки. Cделка расторгнута.'})
                                        }
                                })
                            }
    })
})
router.get('/denydeny', function(req, res) {
    var deal_id=req.query.deal_id
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    DealParent.findOneAndUpdate({_id:deal_id}, {status: 'dealdenied'}).exec((err, upd) => {
                        if(err) console.log(err)
                            if(upd){

                                DealState.findOneAndUpdate({deal_id:deal_id}, {acceptor_status: 'accepted_deny'}).exec((err, upd) => {
                                    if(err) console.log(err)
                                        if(upd){
                                          var sendto = ''
                                          if(upd.initiator == decoded.sub) {
                                              // modifyDealstate(upd.acceptor)
                                              sendto = upd.acceptor
                                          } else{
                                            // modifyDealstate(upd.initiator)
                                              sendto = upd.initiator
                                          }
                                            denyDenyTimeline(decoded.sub, deal_id, upd.lawid, sendto)
                                            res.send({message: 'Вы отклонили запрос на расторжение сделки. Cделка не расторгнута.'})
                                        }
                                })
                            }
    })
})
router.post('/denydeal', function(req, res) {
    //console.log(req.body.reason)
    var deal_id=req.body.deal_id
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    saveReason(decoded.sub, deal_id, req.body.reason)
    DealParent.findOne({_id: deal_id}).exec((err, par) => {
        if(err) console.log(err)
            if(par){
                if(par.status=='accepted'){
                    DealParent.findOneAndUpdate({_id:deal_id}, {status: 'request_deny'}).exec((err, upd) => {
                        if(err) console.log(err)
                            if(upd){
                                DealState.findOne({deal_id: deal_id}).exec((err, state) => {
                                    if(err) console.log(err)
                                    if(state){
                                        //console.log(state)
                                        //var deny_acceptor = ''
                                        var sendto = ''
                                        if(state.initiator == decoded.sub) {
                                            modifyDealstate(state.acceptor)
                                            sendto = state.acceptor
                                        } else{
                                            modifyDealstate(state.initiator)
                                            sendto = state.initiator
                                        }
                                        function modifyDealstate(deny_acceptor) {
                                            DealState.findOneAndUpdate({deal_id: deal_id}, {$set: {initiator:decoded.sub,initiator_status:'accepted_deny', acceptor: deny_acceptor, acceptor_status: 'requested_deny'}}).exec((err, upd)=>{
                                                if(err) console.log(err)
                                                    if(upd){
                                                        //console.log(upd)
                                                        requestDenyDealTimeline(decoded.sub, deal_id, sendto, upd.lawid)
                                                        res.send({message:'Вы отправили запрос на расторжение сделки. Ожидайте ответа от контрагента.'})
                                                    }
                                            })
                                        }
                                    }
                                })
                            }
                    })
                }
                if(par.status=='requested'){
                    DealParent.findOneAndUpdate({_id:deal_id}, {status: 'denied'}).exec((err, upd) => {
                        if(err) console.log(err)
                            if(upd){
                              var sendto = ''
                            //  console.log("qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq")
                              if(upd.side1 == decoded.sub) {
                                //  modifyDealstate(state.acceptor)
                                  sendto = upd.side2
                              } else{
                                  //modifyDealstate(state.initiator)
                                  sendto = upd.side1
                              }
                              //console.log(sendto)
                                denyDealTimeline(decoded.sub, deal_id,upd.lawid, sendto)
                                res.send({message: 'Вы отклонили сделку. Cпасибо, что воспользовались сервисом легко.'})
                            }
                    })
                }
            }
    })
})
router.post('/acceptdeal', function(req, res) {
    var deal_id = req.body.deal_id
    var status = req.body.status
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var to_side = ''
    DealState.findOneAndUpdate({deal_id: deal_id},{acceptor_status: "accepted" }).exec((err, upd) => {
        if(err)console.log('err')
            if(upd) {
                DealParent.findOneAndUpdate({_id:deal_id}, {status: 'accepted'}).exec((err, upd) => {
                    // console.log('done')''
                    if(upd.side1 == decoded.sub){
                        to_side=upd.side2
                    } else {
                        to_side=upd.side1
                    }

                    acceptdealTimeline(deal_id, decoded.sub, status, to_side, upd.lawid)
                    res.send({message: 'Сделка cоздана'})
                })
            }
        })
})


router.get('/getmydeals', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    // console.log(decoded.sub, 'sub')
    finalpackage = [];
        DealParent.find({ $or: [ { side1: decoded.sub }, { side2: decoded.sub} ] }).populate('side1 side2').exec((err, deals)=>{
        if(err) console.log(err)
            else{
                res.send({
                    deals:deals
                })
            }
        })
})
router.get('/getfinisheddeals', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    // console.log(decoded.sub, 'sub')
    finalpackage = [];
        DealParent.find({ $or: [ { side1: decoded.sub }, { side2: decoded.sub} ], status : 'completed'}).populate('side1 side2').exec((err, deals)=>{
        if(err) console.log(err)
            else{
              //console.log(deals, 'getfinisheddeals')
                res.send({
                    deals:deals
                })
            }
        })
})

router.get('/getmynotifications', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    finalpackage = [];
    function getUserTimeline(dtimelines){
        UserTimeline.find({iam: decoded.sub}).populate('iam from').exec((err, userTimeLines) => {
            if(err) console.log(err)
                if(userTimeLines){
                    var sumNoty = dtimelines.length+userTimeLines.length
                    function func() {
                        res.send({
                            userTimeLines: userTimeLines,
                            dealtimelines: dtimelines,
                            sumNoty: sumNoty
                        })
}

setTimeout(func, 2000);



                //     var sumNoty = dtimelines.length+userTimeLines.length
                //     if(sumNoty>8){
                //         sumNoty = 8
                //     } else{

                //     }
                //     if(userTimeLines.length==0){
                //         res.send({
                //             userTimeLines: [],
                //             dealtimelines: dtimelines,
                //             sumNoty: sumNoty
                //         })
                //     } else {
                //         res.send({
                //             userTimeLines: userTimeLines,
                //             dealtimelines: dtimelines,
                //             sumNoty: sumNoty
                //         })
                // }
                }
        })
    }
        DealParent.find({ $or: [ { side1: decoded.sub }, { side2: decoded.sub} ] }).exec((err, deals)=>{
        if(err) console.log(err)
            if(deals){
                var dealtimelines = []
                var itemsProcessed = 0
                deals.forEach(function(i){
                    DealTimeline.find({deal_id: i._id}).populate('action_initiator').exec((err, tl) => {
                        if(err) console.log(err)
                            if(tl){
                                tl.forEach(function(i){
                                    itemsProcessed++
                                    dealtimelines.push(i)
                                    if(itemsProcessed == tl.length){
                                        getUserTimeline(dealtimelines)
                                    }
                                })
                            }
                    })
                })
            } if(deals.length == 0) {
                  getUserTimeline([])
            }
        })
})

//перепиши, лучше лишний раз модифай чем такой говнокод
function initialUpdate(date, deal, user ) {
    function updateState(){
        DealState.findOne({deal_id: deal}).exec((err, state) => {
            if(err) console.log(err)
                if(state){
                    if(state.acceptor==user){
                        DealState.findOneAndUpdate({deal_id: deal},{initiator: user, acceptor : state.initiator }).exec((err,s)=>{
                            if(err) console.log(err)
                                if(s) console.log('s')
                        })
                    }
                    if(state.initiator==user){
                        DealState.findOneAndUpdate({deal_id: deal},{inititor: user,  acceptor: state.acceptor }).exec((err,s)=>{
                            if(err) console.log(err)
                                if(s) console.log('s')
                        })
                    }
                }
        })
    }
    if(date!=''){
        DealParent.findOneAndUpdate({_id:deal}, {duedate:date}).exec((err,suc)=>{
            if(err) console.log(err)
                if(suc) {
                  updateState()
                }
        })
    } else{
        updateState()
    }
}
router.post('/gethistorydeal', function(req, res){
    var deal_id=req.body.dealid
    DealTimeline.find({deal_id: deal_id}).populate('action_initiator').exec((err, time) => {
        if(err) console.log(err)
            if(time){
                res.send({time:time})
            }
    })
})

router.post('/updateDeal865', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var deal865 = JSON.parse(req.body.deal865);
    var lawid='865'
    var deal_id = req.body.deal_id
    var side2 = ''
    var x = initialUpdate(req.body.duedate, deal_id, decoded.sub)
    Deal865.findOne({deal_id: deal_id}).exec((err, olddeal) => {
        if(err) console.log(err)
            if(olddeal) {
                    if(olddeal.principal == decoded.sub){
                        side2=olddeal.agent
                    } else {
                        side2=olddeal.principal
                    }
                    var deal865Data = {
                            deal_name: olddeal.deal_name,
                            lawid: olddeal.lawid,
                            deal_id: olddeal.deal_id,
                            duedate: olddeal.duedate,
                            additional: olddeal.additional,
                            agent: olddeal.agent,
                            principal: olddeal.principal,
                            instructionprincipal: olddeal.instructionprincipal,
                            sizeaward: olddeal.sizeaward,
                            order: olddeal.order,
                            payday: olddeal.payday,
                    }
                    function saveOldDeal(){
                       // console.log('old')
                        const newDeal865 = new Deal865Old(deal865Data);
                        newDeal865.save((err, saveddeal) => {
                            if(err) console.log(err)
                                if(saveddeal) {
                                    UpdateNew()
                                }
                            })
                    }
                    function UpdateNew(){
                        //console.log('new')
                        if(req.body.duedate!=''){
                            Deal865.findOneAndUpdate({deal_id: deal_id},{duedate: req.body.duedate}).exec((err, upd) => {
                                if(err) console.log(err)
                                    if(upd){
                                        console.log('ya update duedate')
                                    }
                            })
                        }
                        const removeEmpty = (obj) => {
                            Object.keys(obj).forEach((key) => (obj[key] == '') && delete obj[key]);
                            return obj;
                        }
                        var mainobj=removeEmpty(deal865)
                        var itemsProcessed = 0;
                        var fields = []
                        //console.log(Object.keys(mainobj), 'Object.keys(mainobj)')
                        if(Object.keys(mainobj).length==0){
                             passTimeline()
                        }
                        //console.log(Object.keys(mainobj),'Object.keys(mainobj)')
                        var crypt = ''
                        Object.keys(mainobj).forEach(function(i){
                            itemsProcessed++;
                            fields.push(i)
                            if(itemsProcessed==Object.keys(mainobj).length){
                                        passTimeline()
                            }

                               Deal865.findOneAndUpdate({deal_id: deal_id},{[i]:  fieldEncryption.encrypt(mainobj[i], SK)}).exec((err, upd) => {
                                if(err) console.log(err)
                                    if(upd){

                                    }
                                })

                            })

                        function passTimeline() {
                            res.send({message: 'Вы внесели изменения в сделку. Ожидайте ответа от контрагента.'})
                            //console.log(fields,'fieldssss')
                            var fields_string =''
                            var en = 0
                                if(req.body.duedate != ''){
                                    fields_string = 'Срок действия договора'+ ' , ' +fields_string
                                }
                                if(fields.length==0){
                                    updateTimeline(deal_id, decoded.sub, fields_string, side2, lawid)
                                } else{
                                    fields.forEach(function(i){
                                        en++;
                                        if(i == 'additional'){
                                            //console.log('add')
                                            fields_string = 'Дополнительные условия' + ', ' + fields_string
                                        }
                                        if(i == 'instructionprincipal') {
                                            fields_string = 'Указания комитента' + ', ' + fields_string
                                        }
                                        if(i == 'sizeaward'){
                                            fields_string = 'Размер комиссионного вознаграждения'+ ', ' + fields_string
                                        }
                                        if(i =='payday') {
                                            fields_string = 'Сроки и порядок оплаты комиссионного вознаграждения'+ ', ' + fields_string
                                        }
                                        if(i == 'order') {
                                            fields_string = 'Порядок возмещения расходов по исполнению комиссионного поручения'+ ', ' +fields_string
                                        }
                                        if(en == fields.length){
                                            updateTimeline(deal_id, decoded.sub, fields_string, side2, lawid)
                                        }
                                     })
                                }
                        }
                    }

                    //check if exist
                    Deal865Old.findOne({deal_id: deal_id}).remove().exec((err, del) => {
                        if(err) console.log(err)
                            if(del) {
                                saveOldDeal()
                            }
                            if(!del) {
                                saveOldDeal()
                            }
                    })
            }
    })
})


function compareDeals(new_deal, old_deal) {
    return Object.keys(new_deal).reduce(function(map, k){
        if(new_deal[k]!=old_deal[k]) map[k]=old_deal[k];
        return map;
    }, {})
}
router.post('/createdeal865', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var deal865 = JSON.parse(req.body.deal865);
    lawid=req.body.lawid;
    if(req.body.agent == decoded.sub){
        side2=req.body.principal
    } else {
        side2=req.body.agent
    }
    var dealParent ={
        lawid: lawid,
        lawname: 'Договор комиссии',
        side1: decoded.sub,
        side2: side2,
        duedate: req.body.duedate,
        status: 'requested'
    }
    const newDealParent= new DealParent(dealParent);
    newDealParent.save((err, saveddp) => {
        if(err) console.log(err)
            if(saveddp){
            deal_id=saveddp._id
                var dealState={
                lawid: lawid,
                deal_id:deal_id,
                initiator: decoded.sub,
                initiator_status: 'accepted',
                acceptor: side2,
                acceptor_status: 'requested'
            }
            const newDealState= new DealState(dealState);
            newDealState.save((err, dealstate) => {
                if(err)console.log(err)
                    if(dealstate){
                        //var ciphertext = CryptoJS.AES.encrypt('my message', 'secret key 123');
                        //console.log(dealstate)
                        var additional=''
                        if(deal865.additional){
                            additional = deal865.additional
                        }
                        var payday = fieldEncryption.encrypt(deal865.payday, SK)
                        var deal865Data = {
                            deal_name: 'Договор комиссии',
                            lawid: lawid,
                            deal_id: deal_id,
                            duedate: req.body.duedate,
                            additional: fieldEncryption.encrypt(additional,SK),
                            agent: req.body.agent,
                            principal: req.body.principal,
                            instructionprincipal: fieldEncryption.encrypt(deal865.instructionprincipal, SK),
                            sizeaward: fieldEncryption.encrypt(deal865.sizeaward, SK),
                            order: fieldEncryption.encrypt(deal865.order, SK),
                            payday: payday,

                        }
                        const newDeal865 = new Deal865(deal865Data);
                        newDeal865.save((err, saveddeal) => {
                            if (err) console.log(err);
                            else {
                                //console.log(saveddeal)
                                //sendPush(user_id, 'Cоздан проект сделки.')
                                res.send({message: 'Проект договора комиссии создан. Ожидайте ответ от контрагента.'})
                                timelineCreate(saveddeal.deal_id, decoded.sub, req.body.status, side2, saveddeal.lawid)
                             }
                        })
                    }
                })

            }

    })
})

router.get('/handleisOpen', function(req, res){
    var t_id=req.query.id
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    //var dealtimelines = getDropDown(decoded.sub)
    //console.log(dealtimelines, 'zzz')
    DealTimeline.findOneAndUpdate({_id: t_id},{isOpen: 'true'}).exec((err, upd) => {
        if(err) console.log(err)
            if(upd){
                res.send({message: '1'})
            }
            if(!upd){
               UserTimeline.findOneAndUpdate({_id: t_id},{isOpen: 'true'}).exec((err, upd) => {
                if(err) console.log(err)
                    if(upd) res.send({message: '1'})
               })
            }
    })
})

function sendPush(user_id, msg, lawid, deal_id){
Device.findOne({userid: user_id}).exec((err, upd) => {
    if(err) console.log(err)
        if(upd){
          var payload = {}
          if(upd.devicePlatform=='ios'){
            var payload = {
              data : {
                lawid: lawid.toString(),
                deal_id: deal_id.toString()
              },
              notification: {
                title: "Cделки LegCo",
                text: msg,
                sound : "default"
            }
            }
          } else {

            var payload = {
              data: {
                    lawid: lawid.toString(),
                    deal_id: deal_id.toString(),
                    title: "Cделки LegCo",
                    text: msg,
                notificationOptions: JSON.stringify({
                  id: '4',
                  title: "Cделки LegCo",
                  text: msg,
                  body: 'Test message',
                  smallIcon: 'drawable/icon',
                  largeIcon: 'https://avatars2.githubusercontent.com/u/1174345?v=3&s=96',
                  autoCancel: true,
                  vibrate: [200,300,200,300],
                  color: '0000ff',
                  headsUp: true,
                  sound: true
                })
              }
            };
          }
            var options = {
              priority: "high"
            }

            admin.messaging().sendToDevice(upd.device, payload, options).then(function(response){
              console.log(response)
            }).catch(function(error){
              console.log(error)
            })
        }
})
}


function saveReason(user_id, deal_id, reason){
    // saveReason(decoded.sub, deal_id, req.body.reason)
    var today =  Date()
    var reason = {
        deal_id: deal_id,
        action_initiator: user_id,
        reason: reason,
        date: today
    }
    const newDealReason = new DealReason(reason);
    newDealReason.save((err, timeline) => {
        if(err) console.log(err)
    })
}

//vse po TimeLines
function dealCompleteTimeline(deal_id, s1, s2, lawid, deal_id){
  sendPush(s1, 'Сделка завершена',lawid, deal_id)
  sendPush(s2, 'Сделка завершена',lawid, deal_id)
    var today =  Date()
    var timeLine = {
        deal_id: deal_id,
        title: 'Сделка завершена',
        date: dateFormat(today),
        isOpen: 'false'
    }
    const newDealTimeline = new DealTimeline(timeLine);
    newDealTimeline.save((err, timeline) => {
        if(err) console.log(err)
    })
}


function dealFinalTimeline(user_id, friend_id, deal_id, sat, lawid){
    var today =  Date()
    var timeLine = {}
    if(sat.ans == 'Да'){
      sendPush(friend_id, 'Контрагент удовлетворен итогами сделки.', lawid, deal_id)
      timeLine = {
          deal_id: deal_id,
          action_initiator: user_id,
          title: 'Контрагент удовлетворен итогами сделки.',
          date: dateFormat(today),
          isOpen: 'false'
      }
    }
    if(sat.ans == "Нет"){
      sendPush(friend_id, 'Контрагент не удовлетворен итогами сделки и указал свою претензию.', lawid, deal_id)
      timeLine = {
          deal_id: deal_id,
          action_initiator: user_id,
          title: 'Контрагент не удовлетворен итогами сделки и указал свою претензию.',
          finals: sat.reason,
          date: dateFormat(today),
          isOpen: 'false'
      }
    }
    const newDealTimeline = new DealTimeline(timeLine);
    newDealTimeline.save((err, timeline) => {
        if(err) console.log(err)
    })
}


function denyDenyTimeline(user_id, deal_id, lawid, sendto){
    sendPush(sendto, 'Отклонен запрос на расторжение сделки', lawid, deal_id)
    var today =  Date()
    var timeLine = {
        deal_id: deal_id,
        action_initiator: user_id,
        title: 'Отклонен запрос на расторжение сделки',
        date: dateFormat(today),
        isOpen: 'false'
    }
    const newDealTimeline = new DealTimeline(timeLine);
    newDealTimeline.save((err, timeline) => {
        if(err) console.log(err)
    })
}
function acceptDenyTimeline(user_id, deal_id, lawid, sendto){
    sendPush(sendto, 'Принят запрос на расторжение сделки', lawid, deal_id)
    var today =  Date()
    var timeLine = {
        deal_id: deal_id,
        action_initiator: user_id,
        title: 'Принят запрос на расторжение сделки',
        date: dateFormat(today),
        isOpen: 'false'
    }
    const newDealTimeline = new DealTimeline(timeLine);
    newDealTimeline.save((err, timeline) => {
        if(err) console.log(err)
    })
}

function requestDenyDealTimeline(user_id, deal_id, sendto, lawid){
  sendPush(sendto, 'Запрос на расторжение сделки', lawid, deal_id)
    var today =  Date()
    var timeLine = {
        deal_id: deal_id,
        action_initiator: user_id,
        title: 'Запрос на расторжение сделки',
        date: dateFormat(today),
        isOpen: 'false'
    }
    const newDealTimeline = new DealTimeline(timeLine);
    newDealTimeline.save((err, timeline) => {
        if(err) console.log(err)
    })
}
function denyDealTimeline(user_id, deal_id, lawid, sendto){
    sendPush(sendto, 'Сделка отклонена контрагентом.', lawid, deal_id)
    var today =  Date()
    var timeLine = {
        deal_id: deal_id,
        action_initiator: user_id,
        title: 'Сделка отклонена контрагентом.',
        date: dateFormat(today),
        isOpen: 'false'
    }
    const newDealTimeline = new DealTimeline(timeLine);
    newDealTimeline.save((err, timeline) => {
        if(err) console.log(err)
    })
}
function acceptdealTimeline(deal_id, user_id, status, side2, lawid){
    sendPush(side2, 'Контрагент принял текущие условия сделки. Сделка вступила в силу.', lawid, deal_id)
    var today =  Date()
    var timeLine = {
        deal_id: deal_id,
        action_initiator: user_id,
        title: 'Контрагент принял текущие условия сделки. Сделка вступила в силу.',
        date: dateFormat(today),
        role_status: status,
        isOpen: 'false'
    }
    const newDealTimeline = new DealTimeline(timeLine);
    newDealTimeline.save((err, timeline) => {
        if(err) console.log(err)
    })
}
function updateTimeline(deal_id, user_id, fields, side2, lawid){
    sendPush(side2, 'Внесены изменения в сделку.',lawid, deal_id)
    var today =  Date()
    var timeLine = {
        deal_id: deal_id,
        action_initiator: user_id,
        title: 'Внесены изменения в сделку',
        fields: fields,
        date: dateFormat(today),
        isOpen: 'false'
    }
    const newDealTimeline = new DealTimeline(timeLine);
    newDealTimeline.save((err, timeline) => {
        if(err) console.log(err)
    })

}
function timelineCreate (deal_id, user_id, status, side2, lawid) {
    sendPush(side2, 'Cоздан проект сделки.',lawid, deal_id)
    var today =  Date()
    var timeLine = {
        deal_id: deal_id,
        action_initiator: user_id,
        title: 'Cоздан проект сделки.',
        date: dateFormat(today),
        role_status: status,
        isOpen: 'false'
    }
    const newDealTimeline = new DealTimeline(timeLine);
    newDealTimeline.save((err, timeline) => {
        if(err) console.log(err)
    })

}
module.exports = router;
