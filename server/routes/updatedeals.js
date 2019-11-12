const express = require('express')
const router = express.Router()
const User = require('../models/user')

// const Relation = require('../models/user_init/relation')
// const Deal = require('../models/deal_init/alldealtypes')
const DealParent = require('../models/deal_init/DealParent')
const DealState = require('../models/deal_init/DealState')
// const DealTimeline = require('../models/deal_init/DealTimeline')
// const Deal506 = require('../models/deal_fields/Deal506')
const Deal683 = require('../models/deal_fields/Deal683')
const Deal715 = require('../models/deal_fields/Deal715')
const Deal506 = require('../models/deal_fields/Deal506')

const Deal865 = require('../models/deal_fields/Deal865')
const Deal768 = require('../models/deal_fields/Deal768')
const Deal688 = require('../models/deal_fields/Deal688')
const Deal616 = require('../models/deal_fields/Deal616')
const Deal604 = require('../models/deal_fields/Deal604')
const Deal540 = require('../models/deal_fields/Deal540')
const Deal846 = require('../models/deal_fields/Deal846')
const Deal501 = require('../models/deal_fields/Deal501')
const Deal406 = require('../models/deal_fields/Deal406')

const Deal683Old = require('../models/deal_fields/Deal683Old')
const Deal715Old = require('../models/deal_fields/Deal715Old')
const Deal506Old = require('../models/deal_fields/Deal506Old')
const Deal768Old = require('../models/deal_fields/Deal768Old')
const Deal688Old = require('../models/deal_fields/Deal688Old')
const Deal616Old = require('../models/deal_fields/Deal616Old')
const Deal604Old = require('../models/deal_fields/Deal604Old')
const Deal540Old = require('../models/deal_fields/Deal540Old')
const Deal846Old = require('../models/deal_fields/Deal846Old')
const Deal501Old = require('../models/deal_fields/Deal501Old')
const Deal406Old = require('../models/deal_fields/Deal406Old')

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
//const Deal865 = require('../models/deal_fields/Deal865')
const DealTimeline = require('../models/deal_init/DealTimeline')
const fieldEncryption = require('mongoose-field-encryption')
const SK = 'mFJH=YR%xZ?8cC'

const Device = require('../models/device')
var admin = require("firebase-admin");

// const gcm = require('node-gcm');
// const sender = new gcm.Sender('AIzaSyBO67ehwpp2lvZY627-hP_h2w4T5MyQ6Co');

function sendPush(user_id, msg,lawid, deal_id){
//  console.log(user_id, lawid, deal_id, 'wwwwwwww')
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
          //     lawid: lawid.toString(),
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

function initialUpdate(date, deal, user ) {
    DealParent.findOneAndUpdate({_id:deal, status:"accepted"}, {status:"requested"}).exec((err,suc)=>{
      if(err) console.log(err)
    })
    function updateState(){
        DealState.findOne({deal_id: deal}).exec((err, state) => {
            if(err) console.log(err)
                if(state){
                    if(state.acceptor==user){
                        DealState.findOneAndUpdate({deal_id: deal},{initiator: user, acceptor : state.initiator, initiator_status: 'accepted', acceptor_status: 'requested'}).exec((err,s)=>{
                            if(err) console.log(err)
                                if(s) console.log('s')
                        })
                    }
                    if(state.initiator==user){
                        DealState.findOneAndUpdate({deal_id: deal},{inititor: user,  acceptor: state.acceptor, initiator_status: 'accepted', acceptor_status: 'requested' }).exec((err,s)=>{
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


router.post('/updateDeal406', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var deal406 = JSON.parse(req.body.deal406);
    var lawid='406'
    var deal_id = req.body.deal_id
    var x = initialUpdate(req.body.duedate, deal_id, decoded.sub)
    var side2 = ''
    Deal406.findOne({deal_id: deal_id}).exec((err, olddeal) => {
        if(err) console.log(err)
            if(olddeal) {
                    if(olddeal.seller == decoded.sub){
                        side2=olddeal.buyer
                    } else {
                        side2=olddeal.seller
                    }
                    var dealData = {
                            deal_name: olddeal.deal_name,
                            lawid: olddeal.lawid,
                            deal_id: olddeal.deal_id,
                            duedate: olddeal.duedate,
                            seller: olddeal.seller,
                            buyer: olddeal.buyer,

                            itemname: olddeal.itemname,
                            quantity: olddeal.quantity,
                            price: olddeal.price,
                            payday: olddeal.payday,
                            getbackday:olddeal.getbackday,
                            quality: olddeal.quality,
                            description: olddeal.description,
                            state: olddeal.state,
                            expire: olddeal.expire,
                            complexity: olddeal.complexity,

                            additional: olddeal.additional,
                    }
                    function saveOldDeal(){
                       // console.log('old')
                        const newDeal = new Deal406Old(dealData);
                        newDeal.save((err, saveddeal) => {
                            if(err) console.log(err)
                                if(saveddeal) {
                                    UpdateNew()
                                }
                            })
                    }
                    function UpdateNew(){
                        //console.log('new')
                        if(req.body.duedate!=''){
                            Deal406.findOneAndUpdate({deal_id: deal_id},{duedate: req.body.duedate}).exec((err, upd) => {
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
                        var mainobj=removeEmpty(deal406)
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

                               Deal406.findOneAndUpdate({deal_id: deal_id},{[i]:  fieldEncryption.encrypt(mainobj[i], SK)}).exec((err, upd) => {
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
                                        if(i == 'itemname'){
                                            fields_string = 'Наименование (ассортимент) товара' + ', ' + fields_string
                                        }
                                         if(i == 'quantity'){
                                            fields_string = 'Количество товара' + ', ' + fields_string
                                        }
                                        if(i == 'price') {
                                            fields_string = 'Цена товара, тенге' + ', ' + fields_string
                                        }
                                         if(i == 'payday') {
                                            fields_string = 'Сроки и порядок оплаты товара' + ', ' + fields_string
                                        }
                                        if(i == 'getbackday') {
                                            fields_string = 'Сроки и порядок передачи товара' + ', ' + fields_string
                                        }
                                         if(i == 'quality') {
                                            fields_string = 'Качество товара' + ', ' + fields_string
                                        }

                                        if(i == 'description'){
                                            fields_string = 'Характеристика товара' + ', ' + fields_string
                                        }
                                         if(i == 'state'){
                                            fields_string = 'Cостояние товара (б/у или новое)' + ', ' + fields_string
                                        }
                                        if(i == 'expire') {
                                            fields_string = 'Срок годности товара/гарантии (если применимо)' + ', ' + fields_string
                                        }
                                         if(i == 'complexity') {
                                            fields_string = 'Комплектность товара (если применимо)' + ', ' + fields_string
                                        }

                                        if(i == 'additional') {
                                            fields_string = 'Дополнительные условия'+ ', ' +fields_string
                                        }
                                        if(en == fields.length){
                                            updateTimeline(deal_id, decoded.sub, fields_string, side2,lawid)
                                        }
                                    //tut
                                    })
                                }
                        }
                    }

                    //check if exist
                    Deal406Old.findOne({deal_id: deal_id}).remove().exec((err, del) => {
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



router.post('/updateDeal501', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var deal501 = JSON.parse(req.body.deal501);
    var lawid='501'
    var deal_id = req.body.deal_id
    var x = initialUpdate(req.body.duedate, deal_id, decoded.sub)
    var side2 = ''
    Deal501.findOne({deal_id: deal_id}).exec((err, olddeal) => {
        if(err) console.log(err)
            if(olddeal) {
                    if(olddeal.side1 == decoded.sub){
                        side2=olddeal.side2
                    } else {
                        side2=olddeal.side1
                    }
                    var dealData = {
                            deal_name: olddeal.deal_name,
                            lawid: olddeal.lawid,
                            deal_id: olddeal.deal_id,
                            duedate: olddeal.duedate,
                            side1: olddeal.side1,
                            side2: olddeal.side2,

                            itemname1: olddeal.itemname1,
                            quantity1: olddeal.quantity1,
                            price1: olddeal.price1,
                            quality1: olddeal.quality1,
                            description1: olddeal.description1,
                            state1:olddeal.state1,
                            itemname2: olddeal.itemname2,
                            quantity2: olddeal.quantity2,
                            price2: olddeal.price2,
                            quality2: olddeal.quality2,
                            description2: olddeal.description2,
                            state2: olddeal.state2,

                            deadline: olddeal.deadline,
                            additional: olddeal.additional,
                    }
                    function saveOldDeal(){
                       // console.log('old')
                        const newDeal = new Deal501Old(dealData);
                        newDeal.save((err, saveddeal) => {
                            if(err) console.log(err)
                                if(saveddeal) {
                                    UpdateNew()
                                }
                            })
                    }
                    function UpdateNew(){
                        //console.log('new')
                        if(req.body.duedate!=''){
                            Deal501.findOneAndUpdate({deal_id: deal_id},{duedate: req.body.duedate}).exec((err, upd) => {
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
                        var mainobj=removeEmpty(deal501)
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

                               Deal501.findOneAndUpdate({deal_id: deal_id},{[i]:  fieldEncryption.encrypt(mainobj[i], SK)}).exec((err, upd) => {
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
                                    updateTimeline(deal_id, decoded.sub, fields_string, side2,lawid)
                                } else{
                                    fields.forEach(function(i){

                                        en++;
                                        if(i == 'itemname1'){
                                            fields_string = 'Наименование имущества подлежащего передаче Стороной 1' + ', ' + fields_string
                                        }
                                         if(i == 'quantity1'){
                                            fields_string = 'Количество имущества, подлежащего передаче Стороной 1' + ', ' + fields_string
                                        }
                                        if(i == 'price1') {
                                            fields_string = 'Стоимость имущества,  подлежащего передаче Стороной 1' + ', ' + fields_string
                                        }
                                         if(i == 'quality1') {
                                            fields_string = 'Качество имущества подлежащего передаче Стороной 1' + ', ' + fields_string
                                        }
                                        if(i == 'description1') {
                                            fields_string = 'Характеристика имущества подлежащего передаче Стороной 1' + ', ' + fields_string
                                        }
                                         if(i == 'state1') {
                                            fields_string = 'Cостояние имущества подлежащего передаче Стороной 1' + ', ' + fields_string
                                        }

                                        if(i == 'itemname2'){
                                            fields_string = 'Наименование имущества подлежащего передаче Стороной 2' + ', ' + fields_string
                                        }
                                         if(i == 'quantity2'){
                                            fields_string = 'Количество имущества, подлежащего передаче Стороной 2' + ', ' + fields_string
                                        }
                                        if(i == 'price2') {
                                            fields_string = 'Стоимость имущества,  подлежащего передаче Стороной 2' + ', ' + fields_string
                                        }
                                         if(i == 'quality2') {
                                            fields_string = 'Качество имущества подлежащего передаче Стороной 2' + ', ' + fields_string
                                        }
                                        if(i == 'description2') {
                                            fields_string = 'Характеристика имущества подлежащего передаче Стороной 2' + ', ' + fields_string
                                        }
                                         if(i == 'state2') {
                                            fields_string = 'Cостояние имущества подлежащего передаче Стороной 2' + ', ' + fields_string
                                        }
                                        if(i == 'deadline') {
                                           fields_string = 'Сроки и порядок обмена имуществом' + ', ' + fields_string
                                       }


                                        if(i == 'additional') {
                                            fields_string = 'Дополнительные условия'+ ', ' +fields_string
                                        }
                                        if(en == fields.length){
                                            updateTimeline(deal_id, decoded.sub, fields_string, side2,lawid)
                                        }
                                    //tut
                                    })
                                }
                        }
                    }

                    //check if exist
                    Deal501Old.findOne({deal_id: deal_id}).remove().exec((err, del) => {
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
router.post('/updateDeal846', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var deal846 = JSON.parse(req.body.deal846);
    var lawid='846'
    var deal_id = req.body.deal_id
    var x = initialUpdate(req.body.duedate, deal_id, decoded.sub)
    var side2 = ''
    Deal846.findOne({deal_id: deal_id}).exec((err, olddeal) => {
        if(err) console.log(err)
            if(olddeal) {
                    if(olddeal.attorney == decoded.sub){
                        side2=olddeal.principal
                    } else {
                        side2=olddeal.attorney
                    }
                    var dealData = {
                            deal_name: olddeal.deal_name,
                            lawid: olddeal.lawid,
                            deal_id: olddeal.deal_id,
                            duedate: olddeal.duedate,
                            termofassignment: olddeal.termofassignment,
                            attorney: olddeal.attorney,
                            principal: olddeal.principal,

                            description: olddeal.description,
                            priceaward: olddeal.priceaward,
                            payday: olddeal.payday,
                            rules: olddeal.rules,
                            additional: olddeal.additional,
                    }
                    function saveOldDeal(){
                       // console.log('old')
                        const newDeal = new Deal846Old(dealData);
                        newDeal.save((err, saveddeal) => {
                            if(err) console.log(err)
                                if(saveddeal) {
                                    UpdateNew()
                                }
                            })
                    }
                    function UpdateNew(){
                        //console.log('new')
                        if(req.body.duedate!=''){
                            Deal846.findOneAndUpdate({deal_id: deal_id},{duedate: req.body.duedate}).exec((err, upd) => {
                                if(err) console.log(err)
                                    if(upd){
                                        console.log('ya update duedate')
                                    }
                            })
                        }
                        if(req.body.termofassignment!=''){
                            Deal846.findOneAndUpdate({deal_id: deal_id},{termofassignment: req.body.termofassignment}).exec((err, upd) => {
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
                        var mainobj=removeEmpty(deal846)
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

                               Deal846.findOneAndUpdate({deal_id: deal_id},{[i]:  fieldEncryption.encrypt(mainobj[i], SK)}).exec((err, upd) => {
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
                                if(req.body.termofassignment != ''){
                                    fields_string = 'Срок поручения'+ ' , ' +fields_string
                                }
                                if(fields.length==0){
                                    updateTimeline(deal_id, decoded.sub, fields_string, side2, lawid)
                                } else{
                                    fields.forEach(function(i){

                                        en++;
                                        if(i == 'description'){
                                            fields_string = 'Описание поручаемых действий' + ', ' + fields_string
                                        }
                                         if(i == 'priceaward'){
                                            fields_string = 'Размер вознаграждения поверенного, тенге' + ', ' + fields_string
                                        }
                                        if(i == 'payday') {
                                            fields_string = 'Сроки и порядок оплаты вознаграждения' + ', ' + fields_string
                                        }
                                         if(i == 'rules') {
                                            fields_string = 'Указания доверителя' + ', ' + fields_string
                                        }
                                        if(i == 'additional') {
                                            fields_string = 'Дополнительные условия'+ ', ' +fields_string
                                        }
                                        if(en == fields.length){
                                            updateTimeline(deal_id, decoded.sub, fields_string, side2, lawid)
                                        }
                                    //tut
                                    })
                                }
                        }
                    }

                    //check if exist
                    Deal846Old.findOne({deal_id: deal_id}).remove().exec((err, del) => {
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


router.post('/updateDeal540', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var deal540 = JSON.parse(req.body.deal540);
    var lawid='540'
    var deal_id = req.body.deal_id
    var x = initialUpdate(req.body.duedate, deal_id, decoded.sub)
    var side2 = ''
    Deal540.findOne({deal_id: deal_id}).exec((err, olddeal) => {
        if(err) console.log(err)
            if(olddeal) {
                    if(olddeal.employee == decoded.sub){
                        side2=olddeal.employer
                    } else {
                        side2=olddeal.employee
                    }
                    var dealData = {
                            deal_name: olddeal.deal_name,
                            lawid: olddeal.lawid,
                            deal_id: olddeal.deal_id,
                            duedate: olddeal.duedate,
                            employer: olddeal.employer,
                            employee: olddeal.employee,

                            itemdata: olddeal.itemdata,
                            keepcondition: olddeal.keepcondition,
                            usecondition: olddeal.usecondition,
                            payday: olddeal.payday,
                            deadline: olddeal.deadline,
                            additional: olddeal.additional,
                    }
                    function saveOldDeal(){
                       // console.log('old')
                        const newDeal = new Deal540Old(dealData);
                        newDeal.save((err, saveddeal) => {
                            if(err) console.log(err)
                                if(saveddeal) {
                                    UpdateNew()
                                }
                            })
                    }
                    function UpdateNew(){
                        //console.log('new')
                        if(req.body.duedate!=''){
                            Deal540.findOneAndUpdate({deal_id: deal_id},{duedate: req.body.duedate}).exec((err, upd) => {
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
                        var mainobj=removeEmpty(deal540)
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

                               Deal540.findOneAndUpdate({deal_id: deal_id},{[i]:  fieldEncryption.encrypt(mainobj[i], SK)}).exec((err, upd) => {
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
                                        if(i == 'itemdata'){
                                            fields_string = 'Данные, позволяющие установить имущество, подлежащее передаче' + ', ' + fields_string
                                        }
                                         if(i == 'deadline'){
                                            fields_string = 'Cроки и порядок передачи/возврата имущества' + ', ' + fields_string
                                        }
                                        if(i == 'keepcondition') {
                                            fields_string = 'Условия о содержании/улучшении имущества' + ', ' + fields_string
                                        }
                                         if(i == 'usecondition') {
                                            fields_string = 'Условия об использовании имущества (в т.ч. пределах распоряжения)' + ', ' + fields_string
                                        }
                                        if(i == 'additional') {
                                            fields_string = 'Дополнительные условия'+ ', ' +fields_string
                                        }
                                        if(en == fields.length){
                                            updateTimeline(deal_id, decoded.sub, fields_string, side2, lawid)
                                        }
                                    //tut
                                    })
                                }
                        }
                    }

                    //check if exist
                    Deal540Old.findOne({deal_id: deal_id}).remove().exec((err, del) => {
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


router.post('/updateDeal604', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var deal604 = JSON.parse(req.body.deal604);
    var lawid='604'
    var deal_id = req.body.deal_id
    var x = initialUpdate(req.body.duedate, deal_id, decoded.sub)
    var side2 = ''
    Deal604.findOne({deal_id: deal_id}).exec((err, olddeal) => {
        if(err) console.log(err)
            if(olddeal) {
                    if(olddeal.lender == decoded.sub){
                        side2=olddeal.borrower
                    } else {
                        side2=olddeal.lender
                    }
                    var dealData = {
                            deal_name: olddeal.deal_name,
                            lawid: olddeal.lawid,
                            deal_id: olddeal.deal_id,
                            duedate: olddeal.duedate,
                            usedeadline: olddeal.usedeadline,
                            lender: olddeal.lender,
                            borrower: olddeal.borrower,

                            itemdata: olddeal.itemdata,
                            keepcondition: olddeal.keepcondition,
                            usecondition: olddeal.usecondition,
                            giveawaydeadline: olddeal.giveawaydeadline,
                            additional: olddeal.additional,
                    }
                    function saveOldDeal(){
                       // console.log('old')
                        const newDeal = new Deal604Old(dealData);
                        newDeal.save((err, saveddeal) => {
                            if(err) console.log(err)
                                if(saveddeal) {
                                    UpdateNew()
                                }
                            })
                    }
                    function UpdateNew(){
                        //console.log('new')
                        if(req.body.duedate!=''){
                            Deal604.findOneAndUpdate({deal_id: deal_id},{duedate: req.body.duedate}).exec((err, upd) => {
                                if(err) console.log(err)
                                    if(upd){
                                        console.log('ya update duedate')
                                    }
                            })
                        }
                        if(req.body.usedeadline!=''){
                            Deal604.findOneAndUpdate({deal_id: deal_id},{usedeadline: req.body.usedeadline}).exec((err, upd) => {
                                if(err) console.log(err)
                                    if(upd){
                                        console.log('ya update usedeadline')
                                    }
                            })
                        }
                        const removeEmpty = (obj) => {
                            Object.keys(obj).forEach((key) => (obj[key] == '') && delete obj[key]);
                            return obj;
                        }
                        var mainobj=removeEmpty(deal604)
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

                               Deal604.findOneAndUpdate({deal_id: deal_id},{[i]:  fieldEncryption.encrypt(mainobj[i], SK)}).exec((err, upd) => {
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
                                if(req.body.usedeadline != ''){
                                    fields_string = 'Срок пользования имуществом'+ ', ' +fields_string
                                }
                                if(fields.length==0){
                                    updateTimeline(deal_id, decoded.sub, fields_string, side2, lawid)
                                } else{
                                    fields.forEach(function(i){

                                        en++;
                                        if(i == 'itemdata'){
                                            fields_string = 'Данные, позволяющие установить имущество, подлежащее передаче' + ', ' + fields_string
                                        }
                                         if(i == 'giveawaydeadline'){
                                            fields_string = 'Сроки и порядок передачи имущества' + ', ' + fields_string
                                        }
                                        if(i == 'keepcondition') {
                                            fields_string = 'Условия о содержании имущества' + ', ' + fields_string
                                        }
                                         if(i == 'usecondition') {
                                            fields_string = 'Условия об использовании имущества' + ', ' + fields_string
                                        }
                                        if(i == 'additional') {
                                            fields_string = 'Дополнительные условия'+ ', ' +fields_string
                                        }
                                        if(en == fields.length){
                                            updateTimeline(deal_id, decoded.sub, fields_string, side2, lawid)
                                        }
                                    //tut
                                    })
                                }
                        }
                    }

                    //check if exist
                    Deal604Old.findOne({deal_id: deal_id}).remove().exec((err, del) => {
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



router.post('/updateDeal683', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var deal683 = JSON.parse(req.body.deal683);
    var lawid='683'
    var deal_id = req.body.deal_id
    var x = initialUpdate(req.body.duedate, deal_id, decoded.sub)
    var side2 = ''
    Deal683.findOne({deal_id: deal_id}).exec((err, olddeal) => {
        if(err) console.log(err)
            if(olddeal) {
                    if(olddeal.employee == decoded.sub){
                        side2=olddeal.employer
                    } else {
                        side2=olddeal.employee
                    }
                    var dealData = {
                            deal_name: olddeal.deal_name,
                            lawid: olddeal.lawid,
                            deal_id: olddeal.deal_id,
                            duedate: olddeal.duedate,
                            deadline: olddeal.deadline,
                            employer: olddeal.employer,
                            employee: olddeal.employee,

                            description: olddeal.description,
                            price: olddeal.price,
                            quality: olddeal.quality,
                            paydeadline: olddeal.paydeadline,
                            additional: olddeal.additional,
                    }
                    function saveOldDeal(){
                       // console.log('old')
                        const newDeal = new Deal683Old(dealData);
                        newDeal.save((err, saveddeal) => {
                            if(err) console.log(err)
                                if(saveddeal) {
                                    UpdateNew()
                                }
                            })
                    }
                    function UpdateNew(){
                        //console.log('new')
                        if(req.body.duedate!=''){
                            Deal683.findOneAndUpdate({deal_id: deal_id},{duedate: req.body.duedate}).exec((err, upd) => {
                                if(err) console.log(err)
                                    if(upd){
                                        console.log('ya update duedate')
                                    }
                            })
                        }
                        if(req.body.deadline!=''){
                            Deal683.findOneAndUpdate({deal_id: deal_id},{deadline: req.body.deadline}).exec((err, upd) => {
                                if(err) console.log(err)
                                    if(upd){
                                        console.log('ya update deadline')
                                    }
                            })
                        }
                        const removeEmpty = (obj) => {
                            Object.keys(obj).forEach((key) => (obj[key] == '') && delete obj[key]);
                            return obj;
                        }
                        var mainobj=removeEmpty(deal683)
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

                               Deal683.findOneAndUpdate({deal_id: deal_id},{[i]:  fieldEncryption.encrypt(mainobj[i], SK)}).exec((err, upd) => {
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
                                if(req.body.deadline != ''){
                                    fields_string = 'Срок займа'+ ', ' +fields_string
                                }
                                if(fields.length==0){
                                    updateTimeline(deal_id, decoded.sub, fields_string, side2, lawid)
                                } else{
                                    fields.forEach(function(i){

                                        en++;
                                        if(i == 'description'){
                                            fields_string = 'Описание услуг' + ', ' + fields_string
                                        }
                                         if(i == 'price'){
                                            fields_string = 'Цена услуг, тенге' + ', ' + fields_string
                                        }
                                        if(i == 'paydeadline') {
                                            fields_string = 'Сроки и порядок оплаты' + ', ' + fields_string
                                        }
                                         if(i == 'quality') {
                                            fields_string = 'Качество услуг' + ', ' + fields_string
                                        }
                                        if(i == 'additional') {
                                            fields_string = 'Дополнительные условия'+ ', ' +fields_string
                                        }
                                        if(en == fields.length){
                                            updateTimeline(deal_id, decoded.sub, fields_string, side2, lawid)
                                        }
                                    //tut
                                    })
                                }
                        }
                    }

                    //check if exist
                    Deal683Old.findOne({deal_id: deal_id}).remove().exec((err, del) => {
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

router.post('/updateDeal715', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var deal715 = JSON.parse(req.body.deal715);
    var lawid='715'
    var deal_id = req.body.deal_id
    var x = initialUpdate(req.body.duedate, deal_id, decoded.sub)
    var side2 = ''
    Deal715.findOne({deal_id: deal_id}).exec((err, olddeal) => {
        if(err) console.log(err)
            if(olddeal) {
                    if(olddeal.borrower == decoded.sub){
                        side2=olddeal.giver
                    } else {
                        side2=olddeal.borrower
                    }
                    var deal688Data = {
                            deal_name: olddeal.deal_name,
                            lawid: olddeal.lawid,
                            deal_id: olddeal.deal_id,
                            duedate: olddeal.duedate,
                            loanterm: olddeal.loanterm,
                            giver: olddeal.giver,
                            borrower: olddeal.borrower,

                            loanamount: olddeal.loanamount,
                            awardamount: olddeal.awardamount,
                            additional: olddeal.additional,
                            deadline: olddeal.deadline,
                    }
                    function saveOldDeal(){
                       // console.log('old')
                        const newDeal = new Deal715Old(deal688Data);
                        newDeal.save((err, saveddeal) => {
                            if(err) console.log(err)
                                if(saveddeal) {
                                    UpdateNew()
                                }
                            })
                    }
                    function UpdateNew(){
                        //console.log('new')
                        if(req.body.duedate!=''){
                            Deal715.findOneAndUpdate({deal_id: deal_id},{duedate: req.body.duedate}).exec((err, upd) => {
                                if(err) console.log(err)
                                    if(upd){
                                        console.log('ya update duedate')
                                    }
                            })
                        }
                        if(req.body.loanterm!=''){
                            Deal715.findOneAndUpdate({deal_id: deal_id},{loanterm: req.body.loanterm}).exec((err, upd) => {
                                if(err) console.log(err)
                                    if(upd){
                                        console.log('ya update loanterm')
                                    }
                            })
                        }
                        const removeEmpty = (obj) => {
                            Object.keys(obj).forEach((key) => (obj[key] == '') && delete obj[key]);
                            return obj;
                        }
                        var mainobj=removeEmpty(deal715)
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

                               Deal715.findOneAndUpdate({deal_id: deal_id},{[i]:  fieldEncryption.encrypt(mainobj[i], SK)}).exec((err, upd) => {
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
                                if(req.body.loanterm != ''){
                                    fields_string = 'Срок займа'+ ', ' +fields_string
                                }
                                if(fields.length==0){
                                    updateTimeline(deal_id, decoded.sub, fields_string, side2, lawid)
                                } else{
                                    fields.forEach(function(i){

                                        en++;
                                        if(i == 'loanamount'){
                                            fields_string = 'Cумма займа' + ', ' + fields_string
                                        }
                                         if(i == 'awardamount'){
                                            fields_string = 'Размер вознаграждения' + ', ' + fields_string
                                        }
                                        if(i == 'deadline') {
                                            fields_string = 'Сроки и порядок выплаты вознаграждения' + ', ' + fields_string
                                        }
                                        if(i == 'additional') {
                                            fields_string = 'Дополнительные условия'+ ', ' +fields_string
                                        }
                                        if(en == fields.length){
                                            updateTimeline(deal_id, decoded.sub, fields_string, side2, lawid)
                                        }
                                    //tut
                                    })
                                }
                        }
                    }

                    //check if exist
                    Deal715Old.findOne({deal_id: deal_id}).remove().exec((err, del) => {
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

router.post('/updateDeal688', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var deal688 = JSON.parse(req.body.deal688);
    var lawid='688'
    var deal_id = req.body.deal_id
    var x = initialUpdate(req.body.duedate, deal_id, decoded.sub)
    var side2 = ''
    Deal688.findOne({deal_id: deal_id}).exec((err, olddeal) => {
        if(err) console.log(err)
            if(olddeal) {
                    if(olddeal.sender == decoded.sub){
                        side2=olddeal.сarrier
                    } else {
                        side2=olddeal.sender
                    }
                    var deal688Data = {
                            deal_name: olddeal.deal_name,
                            lawid: olddeal.lawid,
                            deal_id: olddeal.deal_id,
                            duedate: olddeal.duedate,
                            shippingday: olddeal.shippingday,
                            сarrier: olddeal.сarrier,
                            sender: olddeal.sender,

                            transportableproperty: olddeal.transportableproperty,
                            shippingaddress: olddeal.shippingaddress,
                            payday: olddeal.payday,
                            deliveryaddress: olddeal.deliveryaddress,
                            recipientofproperty: olddeal.recipientofproperty,
                            shippingprice: olddeal.shippingprice,
                            additional: olddeal.additional,
                    }
                    function saveOldDeal(){
                       // console.log('old')
                        const newDeal688 = new Deal688Old(deal688Data);
                        newDeal688.save((err, saveddeal) => {
                            if(err) console.log(err)
                                if(saveddeal) {
                                    UpdateNew()
                                }
                            })
                    }
                    function UpdateNew(){
                        //console.log('new')
                        if(req.body.duedate!=''){
                            Deal688.findOneAndUpdate({deal_id: deal_id},{duedate: req.body.duedate}).exec((err, upd) => {
                                if(err) console.log(err)
                                    if(upd){
                                        console.log('ya update duedate')
                                    }
                            })
                        }
                        if(req.body.shippingday!=''){
                            Deal688.findOneAndUpdate({deal_id: deal_id},{shelfdate: req.body.shippingday}).exec((err, upd) => {
                                if(err) console.log(err)
                                    if(upd){
                                        console.log('ya update shippingday')
                                    }
                            })
                        }
                        const removeEmpty = (obj) => {
                            Object.keys(obj).forEach((key) => (obj[key] == '') && delete obj[key]);
                            return obj;
                        }
                        var mainobj=removeEmpty(deal688)
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

                               Deal688.findOneAndUpdate({deal_id: deal_id},{[i]:  fieldEncryption.encrypt(mainobj[i], SK)}).exec((err, upd) => {
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
                                if(req.body.shippingday != ''){
                                    fields_string = 'Срок доставки'+ ', ' +fields_string
                                }
                                if(fields.length==0){
                                    updateTimeline(deal_id, decoded.sub, fields_string, side2, lawid)
                                } else{
                                    fields.forEach(function(i){

                                        en++;
                                        if(i == 'transportableproperty'){
                                            fields_string = 'Перевозимое имущество' + ', ' + fields_string
                                        }
                                         if(i == 'payday'){
                                            fields_string = 'Порядок оплаты' + ', ' + fields_string
                                        }
                                        if(i == 'shippingaddress') {
                                            fields_string = 'Адрес отправки' + ', ' + fields_string
                                        }
                                        if(i == 'deliveryaddress'){
                                            fields_string = 'Адрес доставки'+ ', ' + fields_string
                                        }
                                        if(i == 'recipientofproperty'){
                                            fields_string = 'Получатель имущества'+ ', ' + fields_string
                                        }
                                        if(i == 'shippingprice'){
                                            fields_string = 'Цена доставки'+ ', ' + fields_string
                                        }
                                        if(i == 'additional') {
                                            fields_string = 'Дополнительные условия'+ ', ' +fields_string
                                        }
                                        if(en == fields.length){
                                            updateTimeline(deal_id, decoded.sub, fields_string, side2, lawid)
                                        }
                                    //tut
                                    })
                                }
                        }
                    }

                    //check if exist
                    Deal688Old.findOne({deal_id: deal_id}).remove().exec((err, del) => {
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

router.post('/updateDeal506', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var deal506 = JSON.parse(req.body.deal506);
    var lawid='506'
    var deal_id = req.body.deal_id
    var side2 = ''
    var x = initialUpdate(req.body.duedate, deal_id, decoded.sub)
    Deal506.findOne({deal_id: deal_id}).exec((err, olddeal) => {
        if(err) console.log(err)
            if(olddeal) {
                    if(olddeal.presenter == decoded.sub){
                        side2=olddeal.receiver
                    } else {
                        side2=olddeal.presenter
                    }
                    var dealData = {
                            deal_name: olddeal.deal_name,
                            lawid: olddeal.lawid,
                            deal_id: olddeal.deal_id,
                            duedate: olddeal.duedate,
                            presenter: olddeal.presenter,
                            receiver: olddeal.receiver,

                            itemname: olddeal.itemname,
                            quantity: olddeal.quantity,
                            deadline: olddeal.deadline,
                            additional: olddeal.additional,
                    }
                    function saveOldDeal(){
                       // console.log('old')
                        const newDeal = new Deal506Old(dealData);
                        newDeal.save((err, saveddeal) => {
                            if(err) console.log(err)
                                if(saveddeal) {
                                    UpdateNew()
                                }
                            })
                    }
                    function UpdateNew(){
                        //console.log('new')
                        if(req.body.duedate!=''){
                            Deal506.findOneAndUpdate({deal_id: deal_id},{duedate: req.body.duedate}).exec((err, upd) => {
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
                        var mainobj=removeEmpty(deal506)
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

                               Deal506.findOneAndUpdate({deal_id: deal_id},{[i]:  fieldEncryption.encrypt(mainobj[i], SK)}).exec((err, upd) => {
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
                                        if(i == 'itemname'){
                                            fields_string = 'Наименование дара (вещи или имущественного права (требование) либо освобождения от имущественной обязанности)'+ ', ' +fields_string
                                        }
                                        if(i == 'quantity'){
                                            fields_string = 'Количество дара' + ', ' + fields_string
                                        }
                                        if(i == 'deadline') {
                                            fields_string = 'Сроки и порядок передачи дара(момент перехода права собственности)' + ', ' + fields_string
                                        }
                                        if(i == 'additional') {
                                            fields_string = 'Дополнительные условия'+ ', ' +fields_string
                                        }
                                        if(en == fields.length){
                                            updateTimeline(deal_id, decoded.sub, fields_string, side2, lawid)
                                        }
                                    //tut
                                    })
                                }
                        }
                    }

                    //check if exist
                    Deal506Old.findOne({deal_id: deal_id}).remove().exec((err, del) => {
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


router.post('/updateDeal768', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var deal768 = JSON.parse(req.body.deal768);
    var lawid='768'
    var deal_id = req.body.deal_id
    var side2 = ''
    var x = initialUpdate(req.body.duedate, deal_id, decoded.sub)
    Deal768.findOne({deal_id: deal_id}).exec((err, olddeal) => {
        if(err) console.log(err)
            if(olddeal) {
                    if(olddeal.keeper == decoded.sub){
                        side2=olddeal.bailor
                    } else {
                        side2=olddeal.keeper
                    }
                    var deal768Data = {
                            deal_name: olddeal.deal_name,
                            lawid: olddeal.lawid,
                            deal_id: olddeal.deal_id,
                            duedate: olddeal.duedate,
                            payday: olddeal.payday,
                            shelfdate: olddeal.shelfdate,
                            keeper: olddeal.keeper,
                            bailor: olddeal.bailor,

                            itemname: olddeal.itemname,
                            awardamount: olddeal.awardamount,
                            responsibility: olddeal.responsibility,
                            additional: olddeal.additional,
                    }
                    function saveOldDeal(){
                       // console.log('old')
                        const newDeal768 = new Deal768Old(deal768Data);
                        newDeal768.save((err, saveddeal) => {
                            if(err) console.log(err)
                                if(saveddeal) {
                                    UpdateNew()
                                }
                            })
                    }
                    function UpdateNew(){
                        //console.log('new')
                        if(req.body.duedate!=''){
                            Deal768.findOneAndUpdate({deal_id: deal_id},{duedate: req.body.duedate}).exec((err, upd) => {
                                if(err) console.log(err)
                                    if(upd){
                                        console.log('ya update duedate')
                                    }
                            })
                        }
                        // if(req.body.payday!=''){
                        //     Deal768.findOneAndUpdate({deal_id: deal_id},{payday: req.body.payday}).exec((err, upd) => {
                        //         if(err) console.log(err)
                        //             if(upd){
                        //                 console.log('ya update payday')
                        //             }
                        //     })
                        // }
                        if(req.body.shelfdate!=''){
                            Deal768.findOneAndUpdate({deal_id: deal_id},{shelfdate: req.body.shelfdate}).exec((err, upd) => {
                                if(err) console.log(err)
                                    if(upd){
                                        console.log('ya update shelfdate')
                                    }
                            })
                        }
                        const removeEmpty = (obj) => {
                            Object.keys(obj).forEach((key) => (obj[key] == '') && delete obj[key]);
                            return obj;
                        }
                        var mainobj=removeEmpty(deal768)
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

                               Deal768.findOneAndUpdate({deal_id: deal_id},{[i]:  fieldEncryption.encrypt(mainobj[i], SK)}).exec((err, upd) => {
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

                                if(req.body.shelfdate != ''){
                                    fields_string = 'Срок хранения'+ ', ' +fields_string
                                }
                                if(fields.length==0){
                                    updateTimeline(deal_id, decoded.sub, fields_string, side2, lawid)
                                } else{
                                    fields.forEach(function(i){

                                        en++;
                                        if(i == 'payday'){
                                            fields_string = 'Сроки и порядок оплаты'+ ', ' +fields_string
                                        }
                                        if(i == 'itemname'){
                                            fields_string = 'Вещь, передаваемая на хранение' + ', ' + fields_string
                                        }
                                        if(i == 'awardamount') {
                                            fields_string = 'Вознаграждение и возмещение расходов хранителю' + ', ' + fields_string
                                        }
                                        if(i == 'responsibility'){
                                            fields_string = 'Ответственность за несохранность'+ ', ' + fields_string
                                        }
                                        if(i == 'additional') {
                                            fields_string = 'Дополнительные условия'+ ', ' +fields_string
                                        }
                                        if(en == fields.length){
                                            updateTimeline(deal_id, decoded.sub, fields_string, side2, lawid)
                                        }
                                    //tut
                                    })
                                }
                        }
                    }

                    //check if exist
                    Deal768Old.findOne({deal_id: deal_id}).remove().exec((err, del) => {
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

router.post('/updateDeal616', function(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwtDecode(token);
    var deal616 = JSON.parse(req.body.deal616);
    var lawid='616'
    var deal_id = req.body.deal_id
    var side2 = ''
    var x = initialUpdate(req.body.duedate, deal_id, decoded.sub)
    Deal616.findOne({deal_id: deal_id}).exec((err, olddeal) => {
        if(err) console.log(err)
            if(olddeal) {
                        if(olddeal.employer == decoded.sub){
                            side2=olddeal.employee
                        } else {
                            side2=olddeal.employer
                        }
                        var deal616Data = {
                            deal_name: olddeal.deal_name,
                            lawid: olddeal.lawid,
                            deal_id: olddeal.deal_id,
                            duedate: olddeal.duedate,
                            payday: olddeal.payday,
                            workdeadline: olddeal.workdeadline,
                            employer: olddeal.employer,
                            employee: olddeal.employee,

                            workdescription: olddeal.workdescription,
                            workaddress: olddeal.workaddress,
                            workprice: olddeal.workprice,
                            workcheck: olddeal.workcheck,
                            quantity: olddeal.quantity,
                            additional: olddeal.additional
                        }

                    function saveOldDeal(){
                       // console.log('old')
                        const newDeal616 = new Deal616Old(deal616Data);
                        newDeal616.save((err, saveddeal) => {
                            if(err) console.log(err)
                                if(saveddeal) {
                                    UpdateNew()
                                }
                            })
                    }
                    function UpdateNew(){
                        //console.log('new')
                        if(req.body.duedate!=''){
                            Deal616.findOneAndUpdate({deal_id: deal_id},{duedate: req.body.duedate}).exec((err, upd) => {
                                if(err) console.log(err)
                                    if(upd){
                                        console.log('ya update duedate')
                                    }
                            })
                        }
                        // if(req.body.payday!=''){
                        //     Deal616.findOneAndUpdate({deal_id: deal_id},{payday: req.body.payday}).exec((err, upd) => {
                        //         if(err) console.log(err)
                        //             if(upd){
                        //                 console.log('ya update payday')
                        //             }
                        //     })
                        // }
                        if(req.body.workdeadline!=''){
                            Deal616.findOneAndUpdate({deal_id: deal_id},{workdeadline: req.body.workdeadline}).exec((err, upd) => {
                                if(err) console.log(err)
                                    if(upd){
                                        console.log('ya update workdeadline')
                                    }
                            })
                        }
                        const removeEmpty = (obj) => {
                            Object.keys(obj).forEach((key) => (obj[key] == '') && delete obj[key]);
                            return obj;
                        }
                        var mainobj=removeEmpty(deal616)
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

                               Deal616.findOneAndUpdate({deal_id: deal_id},{[i]:  fieldEncryption.encrypt(mainobj[i], SK)}).exec((err, upd) => {
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
                                if(req.body.workdeadline != ''){
                                    fields_string = 'Срок выполнения работ'+ ', ' +fields_string
                                }
                                if(fields.length==0){
                                    updateTimeline(deal_id, decoded.sub, fields_string, side2, lawid)
                                } else{
                                    fields.forEach(function(i){

                                        en++;
                                        if(i == 'workdescription'){
                                            fields_string = 'Описание работ' + ', ' + fields_string
                                        }
                                        if(i == 'workaddress') {
                                            fields_string = 'Адрес объекта при проведении работ по ремонту' + ', ' + fields_string
                                        }
                                        if(i == 'workprice'){
                                            fields_string = 'Цена работ'+ ', ' + fields_string
                                        }
                                        if(i == 'payday'){
                                            fields_string = 'Сроки и порядок оплаты'+ ', ' + fields_string
                                        }
                                        if(i == 'workcheck'){
                                            fields_string = 'Порядок приема работ'+ ', ' + fields_string
                                        }
                                        if(i == 'quantity'){
                                            fields_string = 'Качество работ (гарантия качества работ)'+ ', ' + fields_string
                                        }
                                        if(i == 'additional') {
                                            fields_string = 'Дополнительные условия'+ ', ' +fields_string
                                        }
                                        if(en == fields.length){
                                            updateTimeline(deal_id, decoded.sub, fields_string, side2, lawid)
                                        }
                                    //tut
                                    })
                                }
                        }
                    }

                    //check if exist
                    Deal616Old.findOne({deal_id: deal_id}).remove().exec((err, del) => {
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




module.exports = router;
