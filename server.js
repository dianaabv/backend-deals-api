const express = require('express');

const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport');
const http = require('http')
const socketIO = require('socket.io')
//const schedule = require('node-schedule');
const cron = require('node-cron');
// our localhost port
const cors = require('cors');
const port = process.env.PORT || 4040;

const app = express();
app.use(cors())
require('./server/models').connect('mongodb+srv://admin:admin@cluster0-80kgg.mongodb.net/test?retryWrites=true&w=majority');


app.use(bodyParser.urlencoded({extended:false}));

app.use(passport.initialize());

const localLoginStrategy = require('./server/passport/local-login');
passport.use('local-login', localLoginStrategy);

app.use('/auth', require('./server/routes/auth'));
app.use('/api', require('./server/routes/index'));
app.use('/create', require('./server/routes/createdeals'));
app.use('/update', require('./server/routes/updatedeals'));
app.use('/pdf', require('./server/routes/pdf'));

const server = http.createServer(app)

const DealParents = require('./server/models/deal_init/DealParent')
const DealTimeline = require('./server/models/deal_init/DealTimeline')
const UserTimeline = require('./server/models/deal_init/UserTimeline')
const Device = require('./server/models/device')
var admin = require("firebase-admin");
var serviceAccount = require(process.env.FIREBASE_SDK);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_IO_COM
});


function sendPush(user_id, msg,lawid, deal_id){
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


var task = cron.schedule('0 00 20 * * *', function() {
//   console.log('immediately started');
  var today =  new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
  if(dd<10){
      dd='0'+dd;
  }
  if(mm<10){
      mm='0'+mm;
  }
  var today = dd+'/'+mm+'/'+yyyy;
  //должно быть accepted но чтобы проверит  потом поменяй
  DealParents.find({status: 'accepted'}).exec((err, found) => {
    if(err) console.log(err)
      if(found){
        //console.log(found, 'f')
        found.forEach(function(i){
        //  sendPush(i.side1, 'Срок действия договора истек.', i.lawid, i._id)
      //    sendPush(i.side2, 'Срок действия договора истек.', i.lawid, i._id)
            function dateFormat(date){
              var fDate =  new Date(date);
              var m = ((fDate.getMonth() * 1 + 1) < 10) ? ("0" + (fDate.getMonth() * 1 + 1)) : (fDate.getMonth() * 1 + 1);
              var d = ((fDate.getDate() * 1) < 10) ? ("0" + (fDate.getDate() * 1)) : (fDate.getDate() * 1);
              return d + "/" + m+ "/" + fDate.getFullYear()
            }
          if(dateFormat(i.duedate)==today){
            sendPush(i.side1, 'Срок действия договора истек.', i.lawid, i._id)
            sendPush(i.side2, 'Срок действия договора истек.', i.lawid, i._id)
            DealParents.findOneAndUpdate({_id: i._id}, {status: 'finished'}).exec((err, done) =>{
              if(err) console.log(err)
                if(done) {
                  // console.log('сделка завершена')
                  var timeLine = {
                    deal_id: i._id,
                    title: 'Срок действия договора истек.',
                    date: today
                  }
                  const newDealTimeline = new DealTimeline(timeLine)
                  newDealTimeline.save((err, timeline) => {
                    if(err) console.log(err)
                      if(timeline) {
                        // наврное тут нужна рассылка  на почту
                        console.log(timeline)
                      }
                  })
                }
            })
          }
        })
      }
  })
}, false);

task.start();


const User = require('./server/models/user')
// This creates our socket using the instance of the server
const io = socketIO(server)


// This is what the socket.io syntax is like, we will work this later
io.on('connection', socket => {
  socket.on('addtofriend', (friend_id) => {
    User.findOne({_id:friend_id}).exec((err, user) => {
      if (err) console.log(err)
        if(user) {
          io.to(socket.id).emit('addtofriend', 'for your eyes only');
        }
    })
  })
  socket.on('change color', (color, callbackFn) => {
    var dealtimelines = []
    function getUserTimeline(){
        var itemsProc = 0
        UserTimeline.find({iam: color, isOpen: 'false'}).populate('iam from').exec((err, userTimeLines) => {
            if(err) console.log(err)
                if(userTimeLines){
                    userTimeLines.forEach(function(i){
                      itemsProc++
                      dealtimelines.push(i)
                      if(itemsProc == userTimeLines.length){
                         callbackFn(dealtimelines);
                        io.sockets.emit('change color', dealtimelines)
                      }
                    })
                    // var sumNoty = dtimelines.length+userTimeLines.length
                    // io.sockets.emit('change color', userTimeLines,dtimelines, sumNoty)
                }
                if(userTimeLines.length==0){
                   callbackFn(dealtimelines);
                 io.sockets.emit('change color', dealtimelines)
               }
        })
    }
        DealParents.find({ $or: [ { side1: color }, { side2: color} ] }).exec((err, deals)=>{
        if(err) console.log(err)
            if(deals){
                var itemsProcessed = 0
                deals.forEach(function(i){
                    DealTimeline.find({deal_id: i._id, action_initiator:{$ne : color}, isOpen: 'false'}).populate('action_initiator deal_id').exec((err, tl) => {
                        if(err) console.log(err)
                            if(tl){
                                tl.forEach(function(i){
                                    itemsProcessed++
                                    dealtimelines.push(i)
                                    if(itemsProcessed == tl.length){
                                      console.log()
                                      //console.log(dealtimelines, 'dealtimelines1')
                                        getUserTimeline()
                                    }
                                })
                            }
                            if(tl.length==0){
                              getUserTimeline()
                            }
                    })
                })
            } if(deals.length == 0) {
                  getUserTimeline([])
            }
        })
  })
  //socket to create deal 506

  socket.on('createdeal506', (data) => {
    console.log('Color Changed to: ', data)
    io.sockets.emit('createdeal506', 'ddd')
  })
  // disconnect is fired when a client leaves the server
  socket.on('disconnect', () => {
    //console.log('user disconnected')
  })
})

// require('./server/seed_db/deal-types-seeder');

server.listen(port, () => console.log(`Listening on port ${port}`))
