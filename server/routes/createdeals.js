const express = require('express')
const router = express.Router()
const User = require('../models/user')

// const Relation = require('../models/user_init/relation')
// const Deal = require('../models/deal_init/alldealtypes')

const DealParent = require('../models/deal_init/DealParent')
const DealState = require('../models/deal_init/DealState')


const Deal865 = require('../models/deal_fields/Deal865')
const Deal768 = require('../models/deal_fields/Deal768')
const Deal688 = require('../models/deal_fields/Deal688')
const Deal616 = require('../models/deal_fields/Deal616')
const Deal506 = require('../models/deal_fields/Deal506')
const Deal715 = require('../models/deal_fields/Deal715')
const Deal683 = require('../models/deal_fields/Deal683')

const Deal604 = require('../models/deal_fields/Deal604')
const Deal540 = require('../models/deal_fields/Deal540')
const Deal846 = require('../models/deal_fields/Deal846')
const Deal501 = require('../models/deal_fields/Deal501')
const Deal406 = require('../models/deal_fields/Deal406')



// const Deal506Old = require('../models/deal_fields/Deal506Old')
// const Deal715Old = require('../models/deal_fields/Deal715Old')
// const Deal865Old = require('../models/deal_fields/Deal865Old')
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs')
const jwtDecode = require('jwt-decode')
const mongoose = require('mongoose')
// const PDFDocument = require ('pdfkit')
// const blobStream  = require ('blob-stream')
const utf8 = require('utf8');
var file = require('file-system');
var fs = require('fs');
var pdf = require('html-pdf');
var createHTML = require('create-html')
const DealTimeline = require('../models/deal_init/DealTimeline')
const fieldEncryption = require('mongoose-field-encryption')
const SK = 'mFJH=YR%xZ?8cC'

const Device = require('../models/device')
var admin = require("firebase-admin");

function sendPush(user_id, msg,lawid, deal_id){
//  console.log(typeof(deal_id), lawid,'222222lawid')
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
            // var payload = {
            //   data : {
            //     lawid: lawid,
            //     deal_id: deal_id.toString()
            //   },
            //   notification: {
            //     title: "Cделки LegCo",
            //     text: msg,
            //     sound : "default"
            // }
            // }
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

function dateFormat(date){
   var fDate = new Date(date);
   var m = ((fDate.getMonth() * 1 + 1) < 10) ? ("0" + (fDate.getMonth() * 1 + 1)) : (fDate.getMonth() * 1 + 1);
   var d = ((fDate.getDate() * 1) < 10) ? ("0" + (fDate.getDate() * 1)) : (fDate.getDate() * 1);
   return d + "/" + m + "/" + fDate.getFullYear()+'-'+fDate.getHours()+':'+fDate.getMinutes()
 }
function timelineCreate (deal_id, user_id, status, side2,lawid) {
    //console.log('createee')
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


router.post('/createdeal406', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var deal406 = JSON.parse(req.body.deal406);
    lawid=req.body.lawid;
    if(req.body.seller == decoded.sub){
        side2=req.body.buyer
    } else {
        side2=req.body.seller
    }
    var dealParent ={
        lawid: lawid,
        lawname: 'Договор Купли-продажи',
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
                        var additional=''
                        var complexity=''
                        var expire=''

                        if(deal406.additional){
                            additional = deal406.additional
                        }
                        if(deal406.complexity){
                            complexity = deal406.complexity
                        }
                        if(deal406.expire){
                            expire = deal406.expire
                        }
                        var dealData = {
                            deal_name: 'Договор Купли-продажи',
                            lawid: lawid,
                            deal_id: deal_id,
                            duedate: req.body.duedate,
                            seller: req.body.seller,
                            buyer: req.body.buyer,

                            itemname: fieldEncryption.encrypt(deal406.itemname, SK),
                            quantity: fieldEncryption.encrypt(deal406.quantity, SK),
                            price: fieldEncryption.encrypt(deal406.price, SK),
                            payday: fieldEncryption.encrypt(deal406.payday, SK),
                            getbackday:fieldEncryption.encrypt(deal406.getbackday, SK),
                            quality: fieldEncryption.encrypt(deal406.quality, SK),
                            description: fieldEncryption.encrypt(deal406.description, SK),
                            state: fieldEncryption.encrypt(deal406.state, SK),

                            expire: fieldEncryption.encrypt(expire, SK),
                            complexity: fieldEncryption.encrypt(complexity, SK),
                            additional: fieldEncryption.encrypt(additional, SK)
                        }
                        const newDeal = new Deal406(dealData);
                        newDeal.save((err, saveddeal) => {
                            if (err) console.log(err);
                            else {
                                //console.log(saveddeal)
                                res.send({message: 'Проект договора купли-продажи создан. Ожидайте ответ от контрагента.'})
                                timelineCreate(saveddeal.deal_id, decoded.sub, req.body.status, side2,saveddeal.lawid)

                             }
                        })
                    }
                })

            }

    })
})



router.post('/createdeal501', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var deal501 = JSON.parse(req.body.deal501);
    lawid=req.body.lawid;
    if(req.body.side1 == decoded.sub){
        side2=req.body.side2
    } else {
        side2=req.body.side1
    }
    var dealParent ={
        lawid: lawid,
        lawname: 'Договор Мены',
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
                        var additional=''
                        if(deal501.additional){
                            additional = deal501.additional
                        }
                        var dealData = {
                            deal_name: 'Договор Мены',
                            lawid: lawid,
                            deal_id: deal_id,
                            duedate: req.body.duedate,
                            side1: req.body.side1,
                            side2: req.body.side2,

                            itemname1: fieldEncryption.encrypt(deal501.itemname1, SK),
                            quantity1: fieldEncryption.encrypt(deal501.quantity1, SK),
                            price1: fieldEncryption.encrypt(deal501.price1, SK),
                            quality1: fieldEncryption.encrypt(deal501.quality1, SK),
                            description1: fieldEncryption.encrypt(deal501.description1, SK),
                            state1: fieldEncryption.encrypt(deal501.state1, SK),

                            itemname2: fieldEncryption.encrypt(deal501.itemname2, SK),
                            quantity2: fieldEncryption.encrypt(deal501.quantity2, SK),
                            price2: fieldEncryption.encrypt(deal501.price2, SK),
                            quality2: fieldEncryption.encrypt(deal501.quality2, SK),
                            description2: fieldEncryption.encrypt(deal501.description2, SK),
                            state2: fieldEncryption.encrypt(deal501.state2, SK),

                            deadline: fieldEncryption.encrypt(deal501.deadline, SK),
                            additional: fieldEncryption.encrypt(additional, SK)
                        }
                        const newDeal = new Deal501(dealData);
                        newDeal.save((err, saveddeal) => {
                            if (err) console.log(err);
                            else {
                                //console.log(saveddeal)
                                res.send({message: 'Проект договора мены создан. Ожидайте ответ от контрагента.'})
                                timelineCreate(saveddeal.deal_id, decoded.sub, req.body.status, side2,saveddeal.lawid)

                             }
                        })
                    }
                })

            }

    })
})
router.post('/createdeal846', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var deal846 = JSON.parse(req.body.deal846);
    lawid=req.body.lawid;
    if(req.body.attorney == decoded.sub){
        side2=req.body.principal
    } else {
        side2=req.body.attorney
    }
    var dealParent ={
        lawid: lawid,
        lawname: 'Договор Поручения',
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
                        var additional=''
                        if(deal846.additional){
                            additional = deal846.additional
                        }
                        var dealData = {
                            deal_name: 'Договор Поручения',
                            lawid: lawid,
                            deal_id: deal_id,
                            duedate: req.body.duedate,
                            termofassignment: req.body.termofassignment,
                            principal: req.body.principal,
                            attorney: req.body.attorney,

                            description: fieldEncryption.encrypt(deal846.description, SK),
                            priceaward: fieldEncryption.encrypt(deal846.priceaward, SK),
                            payday: fieldEncryption.encrypt(deal846.payday, SK),
                            rules: fieldEncryption.encrypt(deal846.rules, SK),
                            additional: fieldEncryption.encrypt(additional, SK)
                        }
                        const newDeal = new Deal846(dealData);
                        newDeal.save((err, saveddeal) => {
                            if (err) console.log(err);
                            else {
                                //console.log(saveddeal)
                                res.send({message: 'Проект договора поручения создан. Ожидайте ответ от контрагента.'})
                                timelineCreate(saveddeal.deal_id, decoded.sub, req.body.status, side2,saveddeal.lawid)

                             }
                        })
                    }
                })

            }

    })
})
router.post('/createdeal540', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var deal540 = JSON.parse(req.body.deal540);
    lawid=req.body.lawid;
    if(req.body.employer == decoded.sub){
        side2=req.body.employee
    } else {
        side2=req.body.employer
    }
    var dealParent ={
        lawid: lawid,
        lawname: 'Договор Имущественного найма (аренды)',
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
                        var additional=''
                        if(deal540.additional){
                            additional = deal540.additional
                        }
                        var dealData = {
                            deal_name: 'Договор Имущественного найма (аренды)',
                            lawid: lawid,
                            deal_id: deal_id,
                            duedate: req.body.duedate,
                            employee: req.body.employee,
                            employer: req.body.employer,

                            itemdata: fieldEncryption.encrypt(deal540.itemdata, SK),
                            keepcondition: fieldEncryption.encrypt(deal540.keepcondition, SK),
                            usecondition: fieldEncryption.encrypt(deal540.usecondition, SK),
                            payday: fieldEncryption.encrypt(deal540.payday, SK),
                            deadline: fieldEncryption.encrypt(deal540.deadline, SK),
                            additional: fieldEncryption.encrypt(additional, SK)
                        }
                        const newDeal = new Deal540(dealData);
                        newDeal.save((err, saveddeal) => {
                            if (err) console.log(err);
                            else {
                                //console.log(saveddeal)
                                res.send({message: 'Проект договора имущественного найма (аренды) создан. Ожидайте ответ от контрагента.'})
                                timelineCreate(saveddeal.deal_id, decoded.sub, req.body.status, side2,saveddeal.lawid)

                             }
                        })
                    }
                })

            }

    })
})
router.post('/createdeal604', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var deal604 = JSON.parse(req.body.deal604);
    lawid=req.body.lawid;
    if(req.body.lender == decoded.sub){
        side2=req.body.borrower
    } else {
        side2=req.body.lender
    }
    var dealParent ={
        lawid: lawid,
        lawname: 'Договор Безвозмездного пользования имуществом',
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
                        var additional=''
                        if(deal604.additional){
                            additional = deal604.additional
                        }
                        var dealData = {
                            deal_name: 'Договор Безвозмездного пользования имуществом',
                            lawid: lawid,
                            deal_id: deal_id,
                            duedate: req.body.duedate,
                            usedeadline: req.body.usedeadline,
                            borrower: req.body.borrower,
                            lender: req.body.lender,

                            itemdata: fieldEncryption.encrypt(deal604.itemdata, SK),
                            keepcondition: fieldEncryption.encrypt(deal604.keepcondition, SK),
                            usecondition: fieldEncryption.encrypt(deal604.usecondition, SK),
                            giveawaydeadline: fieldEncryption.encrypt(deal604.giveawaydeadline, SK),
                            additional: fieldEncryption.encrypt(additional, SK)
                        }
                        const newDeal = new Deal604(dealData);
                        newDeal.save((err, saveddeal) => {
                            if (err) console.log(err);
                            else {
                                //console.log(saveddeal)
                                res.send({message: 'Проект договора безвозмездного пользования имуществом создан. Ожидайте ответ от контрагента.'})
                                timelineCreate(saveddeal.deal_id, decoded.sub, req.body.status, side2,saveddeal.lawid)

                             }
                        })
                    }
                })

            }

    })
})
router.post('/createdeal715', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var deal715 = JSON.parse(req.body.deal715);
    lawid=req.body.lawid;
    if(req.body.giver == decoded.sub){
        side2=req.body.borrower
    } else {
        side2=req.body.giver
    }
    var dealParent ={
        lawid: lawid,
        lawname: 'Договор Займа',
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
                        var additional=''
                        if(deal715.additional){
                            additional = deal715.additional
                        }
                        var dealData = {
                            deal_name: 'Договор Займа',
                            lawid: lawid,
                            deal_id: deal_id,
                            duedate: req.body.duedate,
                            loanterm: req.body.loanterm,
                            borrower: req.body.borrower,
                            giver: req.body.giver,

                            loanamount: fieldEncryption.encrypt(deal715.loanamount, SK),
                            awardamount: fieldEncryption.encrypt(deal715.awardamount, SK),
                            deadline: fieldEncryption.encrypt(deal715.deadline, SK),
                            additional: fieldEncryption.encrypt(additional, SK)
                        }
                        const newDeal = new Deal715(dealData);
                        newDeal.save((err, saveddeal) => {
                            if (err) console.log(err);
                            else {
                                //console.log(saveddeal)
                                res.send({message: 'Проект договора займа создан. Ожидайте ответ от контрагента.'})
                                timelineCreate(saveddeal.deal_id, decoded.sub, req.body.status, side2,saveddeal.lawid)

                             }
                        })
                    }
                })

            }

    })
})

router.post('/createdeal506', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var deal506 = JSON.parse(req.body.deal506);
    lawid=req.body.lawid;
    if(req.body.receiver == decoded.sub){
        side2=req.body.presenter
    } else {
        side2=req.body.receiver
    }
    var dealParent ={
        lawid: lawid,
        lawname: 'Договор Дарения',
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
                        var additional=''
                        if(deal506.additional){
                            additional = deal506.additional
                        }
                        var dealData = {
                            deal_name: 'Договор Дарения',
                            lawid: lawid,
                            deal_id: deal_id,
                            duedate: req.body.duedate,
                            presenter: req.body.presenter,
                            receiver: req.body.receiver,

                            itemname: fieldEncryption.encrypt(deal506.itemname, SK),
                            quantity: fieldEncryption.encrypt(deal506.quantity, SK),
                            deadline: fieldEncryption.encrypt(deal506.deadline, SK),
                            additional: fieldEncryption.encrypt(additional,SK)
                        }
                        const newDeal = new Deal506(dealData);
                        newDeal.save((err, saveddeal) => {
                            if (err) console.log(err);
                            else {
                                //console.log(saveddeal)
                                res.send({message: 'Проект договора дарения создан. Ожидайте ответ от контрагента.'})
                                timelineCreate(saveddeal.deal_id, decoded.sub, req.body.status, side2,saveddeal.lawid)

                             }
                        })
                    }
                })

            }

    })
})

router.post('/createdeal768', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var deal768 = JSON.parse(req.body.deal768);
    lawid=req.body.lawid;
    if(req.body.keeper == decoded.sub){
        side2=req.body.bailor
    } else {
        side2=req.body.keeper
    }
    var dealParent ={
        lawid: lawid,
        lawname: 'Договор Xранения',
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
                        var additional=''
                        if(deal768.additional){
                            additional = deal768.additional
                        }
                        var deal768Data = {
                            deal_name: 'Договор Xранения',
                            lawid: lawid,
                            deal_id: deal_id,
                            duedate: req.body.duedate,
                            shelfdate: req.body.shelfdate,
                            keeper: req.body.keeper,
                            bailor: req.body.bailor,

                            payday: fieldEncryption.encrypt(deal768.payday, SK),
                            itemname: fieldEncryption.encrypt(deal768.itemname,SK),
                            awardamount: fieldEncryption.encrypt(deal768.awardamount,SK),
                            responsibility: fieldEncryption.encrypt(deal768.responsibility,SK),
                            additional:fieldEncryption.encrypt(additional,SK)
                        }
                        const newDeal768 = new Deal768(deal768Data);
                        newDeal768.save((err, saveddeal) => {
                            if (err) console.log(err);
                            else {
                                //console.log(saveddeal)
                                res.send({message: 'Проект договора хранения создан. Ожидайте ответ от контрагента.'})
                                timelineCreate(saveddeal.deal_id, decoded.sub, req.body.status, side2,saveddeal.lawid)

                             }
                        })
                    }
                })

            }

    })
})


router.post('/createdeal688', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var deal688 = JSON.parse(req.body.deal688);
    lawid=req.body.lawid;
    if(req.body.sender == decoded.sub){
        side2=req.body.сarrier
    } else {
        side2=req.body.sender
    }

    var dealParent ={
        lawid: lawid,
        lawname: 'Договор Перевозки',
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
                        var additional=''
                        if(deal688.additional){
                            additional = deal688.additional
                        }


                        var deal688Data = {
                            deal_name: 'Договор Перевозки',
                            lawid: lawid,
                            deal_id: deal_id,
                            duedate: req.body.duedate,
                            shippingday: req.body.shippingday,
                            сarrier: req.body.сarrier,
                            sender: req.body.sender,

                            transportableproperty: fieldEncryption.encrypt(deal688.transportableproperty,SK),
                            shippingaddress: fieldEncryption.encrypt(deal688.shippingaddress,SK),
                            payday: fieldEncryption.encrypt(deal688.payday,SK),
                            deliveryaddress: fieldEncryption.encrypt(deal688.deliveryaddress,SK),
                            recipientofproperty: fieldEncryption.encrypt(deal688.recipientofproperty,SK),
                            shippingprice: fieldEncryption.encrypt(deal688.shippingprice,SK),
                            additional:fieldEncryption.encrypt(additional,SK),
                        }
                        const newDeal688 = new Deal688(deal688Data);
                        newDeal688.save((err, saveddeal) => {
                            if (err) console.log(err);
                            else {
                                //console.log(saveddeal)
                                res.send({message: 'Проект договора перевозки создан. Ожидайте ответ от контрагента.'})
                                timelineCreate(saveddeal.deal_id, decoded.sub, req.body.status, side2,saveddeal.lawid)
                             }
                        })
                    }
                })

            }

    })
})
router.post('/createdeal683', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var deal683 = JSON.parse(req.body.deal683);
    lawid=req.body.lawid;
    if(req.body.employer == decoded.sub){
        side2=req.body.employee
    } else {
        side2=req.body.employer
    }

    var dealParent ={
        lawid: lawid,
        lawname: 'Договор Возмездного оказания услуг',
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
                        var additional=''
                        if(deal683.additional){
                            additional = deal683.additional
                        }
                        var dealData = {
                            deal_name: 'Договор Возмездного оказания услуг',
                            lawid: lawid,
                            deal_id: deal_id,
                            duedate: req.body.duedate,
                            deadline: req.body.deadline,
                            employer: req.body.employer,
                            employee: req.body.employee,

                            description: fieldEncryption.encrypt(deal683.description,SK),
                            price: fieldEncryption.encrypt(deal683.price,SK),
                            quality: fieldEncryption.encrypt(deal683.quality,SK),
                            paydeadline: fieldEncryption.encrypt(deal683.paydeadline,SK),
                            additional: fieldEncryption.encrypt(additional,SK),

                        }
                        const newDeal = new Deal683(dealData);
                        newDeal.save((err, saveddeal) => {
                            if (err) console.log(err);
                            else {
                                //console.log(saveddeal)
                                res.send({message: 'Проект договора возмездного оказания услуг создан. Ожидайте ответ от контрагента.'})
                                timelineCreate(saveddeal.deal_id, decoded.sub, req.body.status, side2,saveddeal.lawid)
                             }
                        })
                    }
                })

            }

    })
})

router.post('/createdeal616', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var deal616 = JSON.parse(req.body.deal616);
    lawid=req.body.lawid;
    if(req.body.employer == decoded.sub){
        side2=req.body.employee
    } else {
        side2=req.body.employer
    }

    var dealParent ={
        lawid: lawid,
        lawname: 'Договор Подряда',
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
                        var additional=''
                        if(deal616.additional){
                            additional = deal616.additional
                        }
                        var deal616Data = {
                            deal_name: 'Договор Подряда',
                            lawid: lawid,
                            deal_id: deal_id,
                            duedate: req.body.duedate,
                            workdeadline: req.body.workdeadline,
                            employer: req.body.employer,
                            employee: req.body.employee,

                            payday: fieldEncryption.encrypt(deal616.payday,SK),
                            workdescription: fieldEncryption.encrypt(deal616.workdescription,SK),
                            workaddress: fieldEncryption.encrypt(deal616.workaddress,SK),
                            workprice: fieldEncryption.encrypt(deal616.workprice,SK),
                            workcheck: fieldEncryption.encrypt(deal616.workcheck,SK),
                            quantity: fieldEncryption.encrypt(deal616.quantity,SK),
                            additional: fieldEncryption.encrypt(additional,SK),
                        }
                        const newDeal616 = new Deal616(deal616Data);
                        newDeal616.save((err, saveddeal) => {
                            if (err) console.log(err);
                            else {
                                //console.log(saveddeal)
                                res.send({message: 'Проект договора подряда создан. Ожидайте ответ от контрагента.'})
                                timelineCreate(saveddeal.deal_id, decoded.sub, req.body.status, side2,saveddeal.lawid)
                             }
                        })
                    }
                })

            }

    })
})
module.exports = router;
