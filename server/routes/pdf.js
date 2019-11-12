const express = require('express')
const router = express.Router()
const User = require('../models/user')

// const Relation = require('../models/user_init/relation')
// const Deal = require('../models/deal_init/alldealtypes')
const DealParent = require('../models/deal_init/DealParent')
// const DealState = require('../models/deal_init/DealState')
// const DealTimeline = require('../models/deal_init/DealTimeline')
// const Deal506 = require('../models/deal_fields/Deal506')





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
const SK = 'mFJH=YR%xZ?8cC'
//const Deal865 = require('../models/deal_fields/Deal865')
const DealTimeline = require('../models/deal_init/DealTimeline')
const fieldEncryption = require('mongoose-field-encryption')
function dateFormat(date){
  var fDate = new Date(date);
  var m = ((fDate.getMonth() * 1 + 1) < 10) ? ("0" + (fDate.getMonth() * 1 + 1)) : (fDate.getMonth() * 1 + 1);
  var d = ((fDate.getDate() * 1) < 10) ? ("0" + (fDate.getDate() * 1)) : (fDate.getDate() * 1);
  return d + "/" + m+ "/" + fDate.getFullYear()
}
function createTimeLine(deal_id, deal_string, user_id){

  DealTimeline.find({deal_id: deal_id}).populate('action_initiator').exec((err, timeline) => {
    if(err) console.log(err)
            if(timeline){
              var items = 0
              var timeline_string= ''
              timeline.forEach(function(i) {
                items++
                  timeline_string = timeline_string + '<div class="timeline-item" date-is='+i.date + '>'
                  timeline_string=timeline_string+'<h4>'+ i.title+'</h4>'
                  if(i.action_initiator){
                    timeline_string=timeline_string+'<p>'+'Инициатор события: '+i.action_initiator.firstname+' '+i.action_initiator.lastname+'</p>'
                  }
                  if(i.fields){
                    timeline_string=timeline_string+'<p>'+'Внесены изменения в следующие поля:'+i.fields.replace(/.$/,".")+'</p>'
                  }
                  if(i.role_status){
                    timeline_string=timeline_string+'<p>'+'Роль контрагента:'+i.role_status+'</p>'
                  }


                  timeline_string=timeline_string+'</div>'
                  if(timeline.length== items){

                      DealParent.findOne({_id: deal_id}).exec((err, deal) => {
                        if(err) console.log(err)
                        if(deal){
                            createHtmlPdf(deal_id, deal_string, timeline_string, user_id, deal.lawname)
                        }
                      })
                  //createHtmlPdf(deal_id, deal_string, timeline_string, user_id)
                  }
              })

            }
        })


}
function createHtmlPdf(deal_id, info, timeline, user_id, lawname){
//  var today =  new Date().toLocaleString("en")
//  today = today.substring(0, today.indexOf(','))
var today = new Date();

   var options = {

       year: "numeric",
       month: "2-digit",
       day: "numeric"
   };
  today =    today.toLocaleDateString("en", options)
  //console.log(today, 'todaytodaytodaytodaytodaytodaytodaytoday')
    var createhtml = createHTML({
    css: 'bootstrap.css',
    body: '<div class="row my_bg" ><div class="logo_pos"><img src="file:///opt/mudealslegco/server/routes/clientpdf/logo.png" alt="Logo" class="mylogo"></div><div class="title_pos"><h4 class="white" >ЦИФРОВЫЕ ЮРИДИЧЕСКИЕ</h4><h4 class="white">ТЕХНОЛОГИИ</h4><h5 class="white">www.legco.kz</h5></div></div><div class="row"><div class="col-md-12 my_box text-center"><h3>Справка </h3><h5>Настоящая справка является доказательством совершения сделки на основании ст.153 Гражданского кодекса Республики Казахстан.</h5></div><div class="col-md-12 my_box"><h3 class="cust_weight">Информация о справке </h3>'+'<h5>Дата и время выдачи: </h5>'+today+'<h5>Код справки: </h5>'+deal_id+'</div><div class="col-md-12 my_box"><h3 class="cust_weight">Информация о сделке </h3>'+info+'</div><div class="col-md-12 my_box"><h3 class="cust_weight">История сделки </h3>' + timeline+ '<h7>время указано в соответствии с часовым поясом г. Астана</h7></div><div class="col-md-12 my_box"><h3>Обязательные условия любой сделки</h3><h5>1. Расторжение договора осуществляется путем направления запроса одной стороной и принятия такого запроса другой стороной. Если запрос не подтверждается стороной, которой он был направлен, то стороны обращаются в суд по причине отсутствия согласия на досрочное расторжение.</h5><h5>2. Действие договора завершается в 20 часов 00 минут (часовой пояс г. Астана) в день, указанный в поле "Срок действия договора"</h5><h5>3. При наличии претензии после истечения срока действия договора стороны соглашаются урегулировать спор в досудебном порядке. При невозможности урегулировать спор в досудебном порядке стороны обращаются за разрешением спора в суд. </h5><h5>4. Отношения Сторон соответствующего договора, не урегулированные его условиями, установленными с использованием цифрового юридического продукта Сделки LegCo, регулируются законодательством Республики Казахстан.</h5></div><div class="col-md-12 my_box bg_grey"><h5>Сделка совершена с использованием цифрового юридического продукта «Сделки LegCo». Настоящая справка является доказательством совершения сделки на основании ст.153 Гражданского кодекса Республики Казахстан.</h5></div><div class="col-md-12 my_box bg_grey text-center"><h5> Товарный знак “LegCo” (Legal Communications) принадлежит товариществу с ограниченной ответственностью “K&T Partners (Кей энд Ти Партнерс)” на основании регистрации от 2 октября 2017 года.<br></br> ТОО “K&T Partners (Кей энд Ти Партнерс)”<br></br> г. Алматы, бульвар Бухар Жырау 33, оф.42</h5></div></div>'
  })
  fs.writeFile('server/pdf/index.html', createhtml, function (err, ok) {
    if (err) console.log(err)
      else{
        var html = fs.readFileSync('server/pdf/index.html', 'utf8');
        //console.log(__dirname, 'dddddd')
        // var options = { format: 'Letter'};
        var options = {   format: 'Letter', base: "file://"+__dirname+"/clientpdf/bootstrap.css" };
  pdf.create(html, options).toFile('server/pdf/businesscard.pdf', function(err, res) {
    if (err) return console.log(err,'errrrrrrrr');
      else{
        console.log(res);
        User.findOne({_id: user_id}).exec((err, user) =>{
          if(err) console.log(err)
            if(user){
              //console.log(user.email)
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
                  to: user.email, // list of receivers
                  subject: 'Справка по сделке  - '+lawname, // Subject line
                  text: 'Cделки LegCo ', // plain text body
                  //html: '<b>'+'справка доказывающая, что сделка состоялась '+'</b>' ,// html body
                  html: '<table width="100%" border="0" cellspacing="0" cellpadding="0" style="min-width:320px"><tbody><tr><td align="center" bgcolor="#eff3f8"><table border="0" cellspacing="0" cellpadding="0" class="m_6607120692376060800table_width_100" width="100%" style="max-width:680px;min-width:300px"><tbody><tr><td><div style="height:10px;line-height:80px;font-size:10px">&nbsp;</div></td></tr><tr><td align="center" style="background-color:#84a4e8"><div style="height:15px;line-height:30px;font-size:10px">&nbsp;</div><table width="90%" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td align="left"> <a href="http://legco.kz" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=ru&amp;q=http://legco.kz&amp;source=gmail&amp;ust=1518493396904000&amp;usg=AFQjCNGX3t2RhMvY9tFax9ERhwoOJqEwjQ"><img src="https://ci4.googleusercontent.com/proxy/yoOjNgg5RnirdDy1-SI5ZV3LLB0kaf2BBj-bhptbRmmI4r8x2mN4OG2ZdNtvOeOnwwnu31rZ69qo=s0-d-e1-ft#http://legco.kz/mailer/logomail.png" style="height:100px;width:auto" class="CToWUd"></a></td></tr></tbody></table><div style="height:10px;line-height:50px;font-size:10px">&nbsp;</div></td></tr><tr><td align="center" bgcolor="#fbfcfd"><table width="90%" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td align="left"><div style="height:60px;line-height:60px;font-size:10px">&nbsp;</div><div style="line-height:44px"> <font face="Arial, Helvetica, sans-serif" size="5" color="#57697e" style="font-size:24px"> <span style="font-family:Arial,Helvetica,sans-serif;font-size:17px;color:#57697e"> Уважаемый(-ая) '+user.firstname+', </span></font></div></td></tr><tr><td align="left"><div style="line-height:24px"> <font face="Arial, Helvetica, sans-serif" size="4" color="#57697e" style="font-size:15px"> <span style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#57697e"> Настоящим направляем Вам справку по сделке № '+deal_id+' по запросу от '+today+'. </span> </font> <font face="Arial, Helvetica, sans-serif" size="4" color="#57697e" style="font-size:15px"> <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#57697e"><table><thead><tr style="height:20px"></tr><tr><td align="left"><div style="line-height:24px"> <font face="Arial, Helvetica, sans-serif" size="4" color="#57697e" style="font-size:15px"> <span style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#57697e"> Мы хотим, чтобы Ваш опыт использования веб-сервиса был максимально комфортным и полезным. </span> </font> <font face="Arial, Helvetica, sans-serif" size="4" color="#57697e" style="font-size:15px"> <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#57697e"><table><thead><tr style="height:20px"></tr><tr><td align="left"><div style="height:40px;line-height:40px;font-size:10px">&nbsp;</div></td></tr><tr><td align="left"><div style="line-height:24px"> <font face="Arial, Helvetica, sans-serif" size="4" color="#57697e" style="font-size:15px"> <span style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#57697e"><table><tbody><tr><td> Искренне Ваша</td></tr><tr><td>Команда LegCo</td></tr><tr><td>тел.: <a href="tel:+7%20727%20292%201937" value="+77272921937" target="_blank">+7 (727) 292 19 37</a></td></tr><tr><td><a href="mailto:email%3Alegco@legco.kz" target="_blank">email: legco@legco.kz</a></td></tr><tr><td><a href="http://www.legco.kz" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=ru&amp;q=http://www.legco.kz&amp;source=gmail&amp;ust=1518493396905000&amp;usg=AFQjCNFoNEGDDQyJ1wSYPOwnIsL5FtXD1w">www.legco.kz</a></td></tr></tbody></table></span></font></div><div style="height:40px;line-height:40px;font-size:10px">&nbsp;</div></td></tr><tr><td align="center"><div class="m_6607120692376060800mob_100" style="float:left;display:inline-block;width:33%"><table class="m_6607120692376060800mob_100" width="100%" border="0" cellspacing="0" cellpadding="0" align="left" style="border-collapse:collapse"><tbody><tr><td align="left" style="line-height:14px;padding:0 24px"><div style="height:30px;line-height:30px;font-size:10px">&nbsp;</div><div style="line-height:14px"> <a href="http://legco.kz/lists.html" style="color:#596167;font-family:Arial,Helvetica,sans-serif;font-size:12px" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=ru&amp;q=http://legco.kz/lists.html&amp;source=gmail&amp;ust=1518493396905000&amp;usg=AFQjCNHhTn_Rq1dReElUkWA29XVEB7AKkA"> <font face="Arial, Helvetica, sans-serif" size="2" color="#596167"> <img src="https://ci6.googleusercontent.com/proxy/RXxqT43mGtlcXARntXk-o9n7ij_dJOloGv-Iy5eIfUmV1TDupq3R_y-q5e5WjL6RucsQVHxPs78=s0-d-e1-ft#http://legco.kz/mailer/spravki.png" width="107" alt="Списки_LegCo" border="0" class="m_6607120692376060800mob_width_50 CToWUd" style="display:block;width:100%;height:auto"></font></a></div></td></tr></tbody></table></div><div class="m_6607120692376060800mob_100" style="float:left;display:inline-block;width:33%"><table class="m_6607120692376060800mob_100" width="100%" border="0" cellspacing="0" cellpadding="0" align="left" style="border-collapse:collapse"><tbody><tr><td align="center" style="line-height:14px;padding:0 24px"><div style="height:30px;line-height:30px;font-size:10px">&nbsp;</div><div style="line-height:14px"> <a href="http://legco.kz/deals.html" style="color:#596167;font-family:Arial,Helvetica,sans-serif;font-size:12px" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=ru&amp;q=http://legco.kz/deals.html&amp;source=gmail&amp;ust=1518493396905000&amp;usg=AFQjCNEJ53WDBBHR_Wb8KVBqgymgR1ZT5Q"> <font face="Arial, Helvetica, sans-serif" size="2" color="#596167"> <img src="https://ci6.googleusercontent.com/proxy/GCxTJ6OZhjli9LvJNouiOI0qvcKdvTCroJ-UxCKUW7OtJxez8ZJ3XS4iBtzafb3U9Aol=s0-d-e1-ft#http://legco.kz/mailer/se.png" width="103" alt="ie" border="0" class="m_6607120692376060800mob_width_50 CToWUd" style="display:block;width:100%;height:auto"></font></a></div></td></tr></tbody></table></div><div class="m_6607120692376060800mob_100" style="float:left;display:inline-block;width:33%"><table class="m_6607120692376060800mob_100" width="100%" border="0" cellspacing="0" cellpadding="0" align="left" style="border-collapse:collapse"><tbody><tr><td align="right" style="line-height:14px;padding:0 24px"><div style="height:30px;line-height:30px;font-size:10px">&nbsp;</div><div style="line-height:14px"> <a href="http://legco.kz/citizen.html" style="color:#596167;font-family:Arial,Helvetica,sans-serif;font-size:12px" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=ru&amp;q=http://legco.kz/citizen.html&amp;source=gmail&amp;ust=1518493396905000&amp;usg=AFQjCNHVqPJ88BqQGnjBUr0OpYmK7zYWFw"> <font face="Arial, Helvetica, sans-serif" size="2" color="#596167"> <img src="https://ci3.googleusercontent.com/proxy/vbxrWuz4SqIWPtSU4WNPDWz9YtDrxNcJhvqwLPFqmOKm1YG7_L_LV7caN1AoTxMaXIfUndDmqkQ=s0-d-e1-ft#http://legco.kz/mailer/citizen.png" width="116" alt="citizen" border="0" class="m_6607120692376060800mob_width_50 CToWUd" style="display:block;width:100%;height:auto"></font></a></div></td></tr></tbody></table></div></td></tr><tr><td><div style="height:28px;line-height:28px;font-size:10px">&nbsp;</div></td></tr></tbody></table></td></tr><tr><td align="center" bgcolor="#ffffff" style="border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:#eff2f4"><table width="94%" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td><div style="height:28px;line-height:28px;font-size:10px">&nbsp;</div></td></tr></tbody></table></td></tr><tr><td class="m_6607120692376060800iage_footer" align="center" bgcolor="#ffffff"><div style="height:40px;line-height:80px;font-size:10px">&nbsp;</div><table width="100%" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td align="left"> <font face="Arial, Helvetica, sans-serif" size="3" color="#96a5b5" style="font-size:13px"> <span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#96a5b5"> Товарный знак “LegCo” (Legal Communications) принадлежит товариществу с ограниченной ответственностью <a href="http://katpartners.kz" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=ru&amp;q=http://katpartners.kz&amp;source=gmail&amp;ust=1518493396905000&amp;usg=AFQjCNGEpkYGL7raUBfvMwGw6MnWPmHC0g">“K&amp;T Partners (Кей энд Ти Партнерс)”</a> на основании регистрации от 2 октября 2017 года.<br><br><a href="http://deals.legco.kz/files/agreement1.pdf" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=ru&amp;q=http://legco.kz/docs/agreement.pdf&amp;source=gmail&amp;ust=1518493396905000&amp;usg=AFQjCNEEAFmPQaxLD2p0rMsdz6BKiDcKTQ"> Пользовательское соглашение</a> <br><a href="http://deals.legco.kz/files/policy1.pdf" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=ru&amp;q=http://legco.kz/docs/privacy.pdf&amp;source=gmail&amp;ust=1518493396905000&amp;usg=AFQjCNHKVzIJ-SKkRGoyAm7Cx00MjIx--A"> Политика конфиденциальности</a><br><a href="http://deals.legco.kz/files/paid1.pdf" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=ru&amp;q=http://legco.kz/docs/privacy.pdf&amp;source=gmail&amp;ust=1518493396905000&amp;usg=AFQjCNHKVzIJ-SKkRGoyAm7Cx00MjIx--A"> Соглашение об оказании платных услуг через веб-сервис сделки LegCo</a></span></font></td></tr></tbody></table><div style="height:30px;line-height:30px;font-size:10px">&nbsp;</div></td></tr><tr><td><div style="height:80px;line-height:80px;font-size:10px">&nbsp;</div></td></tr></tbody></table></td></tr></tbody></table>',
                  attachments: [
                  {   // file on disk as an attachment
                    filename: 'spravka.pdf',
                    path: res.filename // stream this file
                  }
                  ]
              };

              // send mail with defined transport object
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    res.send({message:'Такой почты не зарегестрированно'})

                    return console.log(error, 'error');
                    //res.send('Такой почты не зарегестрированно')
                } if(info) {
                  console.log(info)

                }
              })
            }
        })
      }
  });
}
})
}

var accept_as_ip = function(user_id, deal_id, callback){
    DealTimeline.findOne({action_initiator: user_id, deal_id:deal_id, title: 'Контрагент принял текущие условия сделки. Сделка вступила в силу.'}).exec((err,ip)=>{
    if(err) console.log(err)
        if(ip){
            if(ip.role_status=='Индивидуальный предприниматель' ){
              callback('ip')
            } else{
              callback('fiz')
            }
        }
        if(!ip) {
          callback('none')
        }
    })
}
var create_as_ip = function(user_id,deal_id, callback){
    DealTimeline.findOne(
      {$or: [
          {action_initiator: user_id, deal_id:deal_id, title: 'Cоздан проект сделки.'},
          {action_initiator: user_id, deal_id:deal_id, title: 'Контрагент принял текущие условия сделки. Сделка вступила в силу.'}
      ]}).exec((err,ip)=>{
    if(err) console.log(err)
        if(ip){
            if(ip.role_status=='Индивидуальный предприниматель' ){
              callback('ip')
            } else{
              callback('fiz')
            }
        }
        if(!ip) {
          callback('none')
        }
    })
}
function getDeal865(deal_id, user_id){
  var a =''
  Deal865.findOne({deal_id: deal_id}).populate('agent principal').exec((err, deal) =>{
    if(err) console.log(err)
      if(deal){
        create_as_ip(deal.principal._id, deal_id, function(num){
          console.log(num,'num')
          a=num
        })
        create_as_ip(deal.agent._id, deal_id, function(num){
          console.log(num,'num')
        })
        // var accept_principal;
        // var create_principal;
        // var a1 = create_as_ip(deal.principal._id, deal_id, function (num) {
        //   console.log("create_as_ip " + num);
        //   create_principal=num
        // });
        // var b1 = accept_as_ip(deal.principal._id, deal_id, function (num) {
        //   accept_principal = num
        //   console.log("accept_as_ip " + num);
        // });
        // var a2 = create_as_ip(deal.agent._id, deal_id, function (num) {
        //   console.log("create_as_ip " + num);
        // });
        // var b2 = accept_as_ip(deal.agent._id, deal_id, function (num) {
        //   console.log("accept_as_ip " + num);
        // });
      //  console.log(accept_principal,create_principal, 'b222')

        var deal_string = '<h5 style="font-weight: 800 !important" >' + 'Наименование договора: '+'</h5><h5>' + deal.deal_name +'</h5>'
        deal_string = deal_string + '<h5 style="font-weight: 800 !important">' + 'Предмет договора:'+'</h5><h5>' + ' Комиссионер обязуется по поручению Комитента за вознаграждение совершить одну или несколько сделок от своего имени за счет Комитента на условиях, указанных в настоящем договоре. '+'</h5>'

        deal_string = deal_string + '<h3 class="cust_weight">Информация о сторонах</h3>'
        deal_string = deal_string + '<h5 style="font-weight: 800 !important">' + 'Комитент: ' + deal.principal.firstname +' '+deal.principal.lastname +'</h5>'
        deal_string = deal_string + '<h5>' + 'Номер телефона: ' + deal.principal.username +'</h5>'
        deal_string = deal_string + '<h5>' + 'Email: ' + deal.principal.email +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата рождения: ' + deal.principal.birthday  +'</h5>'
        deal_string = deal_string + '<h5>' + '№ Удостоверения личности: ' + deal.principal.udv  +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата выдачи уд-ния личности: ' + deal.principal.issueddate  +'</h5>'
        deal_string = deal_string + '<h5>' + 'ИИН: ' + deal.principal.iin +'</h5>'
        deal_string = deal_string + '<h5>' + 'Адрес регистрации: ' + deal.principal.address +'</h5>'
        // console.log(z,'sfsfsf')
        if(deal.principal.status=="Индивидуальный предприниматель") {
          deal_string = deal_string + '<h5>' + 'Наименование ИП: ' + deal.principal.nameip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Номер свидетельства о гос. регистрации ИП: ' + deal.principal.noregip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Дата гос. регистрации ИП: ' + dateFormat(deal.principal.dateregip) +'</h5>'
          deal_string = deal_string + '<h5>' + 'Адрес регистрации в качестве ИП: ' + deal.principal.addressregip +'</h5>'

        }
        deal_string = deal_string + '<h5 style="font-weight: 800 !important">' +'Комиссионер: ' + deal.agent.firstname +' '+deal.agent.lastname +'</h5>'
        deal_string = deal_string + '<h5>' + 'Номер телефона: ' + deal.agent.username +'</h5>'
        deal_string = deal_string + '<h5>' + 'Email: ' + deal.agent.email +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата рождения: ' + deal.agent.birthday  +'</h5>'
        deal_string = deal_string + '<h5>' + '№ Удостоверения личности: ' + deal.agent.udv  +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата выдачи уд-ния личности: ' + deal.agent.issueddate  +'</h5>'
        deal_string = deal_string + '<h5>' + 'ИИН: ' + deal.agent.iin +'</h5>'
        deal_string = deal_string + '<h5>' + 'Адрес регистрации: ' + deal.agent.address +'</h5>'
        if(deal.agent.status=="Индивидуальный предприниматель"){
          deal_string = deal_string + '<h5>' + 'Наименование ИП: ' + deal.agent.nameip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Номер свидетельства о гос. регистрации ИП: ' + deal.agent.noregip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Дата гос. регистрации ИП: ' + dateFormat(deal.agent.dateregip) +'</h5>'
          deal_string = deal_string + '<h5>' + 'Адрес регистрации в качестве ИП: ' + deal.agent.addressregip +'</h5>'
        }

        deal_string = deal_string + '<h3 class="cust_weight">Условия сделки</h3>'
        deal_string = deal_string +  '<h5>' + 'Указания комитента: ' + fieldEncryption.decrypt(deal.instructionprincipal, SK) +'</h5>'+ '<h5>' + 'Размер комиссионного вознаграждения: ' + fieldEncryption.decrypt(deal.sizeaward, SK) +'</h5>'
        deal_string = deal_string +  '<h5>' + 'Сроки и порядок оплаты комиссионного вознаграждения: ' +  fieldEncryption.decrypt(deal.payday, SK) +'</h5>' +  '<h5>' + 'Порядок возмещения расходов по исполнению комиссионного поручения: ' + fieldEncryption.decrypt(deal.order, SK) +'</h5>'
        deal_string = deal_string +  '<h5>' + 'Срок действия договора: ' + dateFormat(deal.duedate)
        // console.log(deal_string)
        if(deal.additional){
          deal_string = deal_string +  '<h5>' + 'Дополнительные условия: ' + fieldEncryption.decrypt(deal.additional, SK)+'</h5>'
        }
        createTimeLine(deal_id, deal_string, user_id)
      }
  })
}
function getDeal768(deal_id, user_id){
  Deal768.findOne({deal_id: deal_id}).populate('keeper bailor').exec((err, deal) =>{
    if(err) console.log(err)
      if(deal){

        var deal_string =  '<h5 style="font-weight: 800 !important">' + 'Наименование договора: ' +'</h5><h5>' + deal.deal_name +'</h5>'
        deal_string = deal_string + '<h5 class="cust_weight">' + 'Предмет договора: '+'</h5><h5>' + 'Хранитель обязуется хранить вещь, переданную на хранение Поклажедателем и возвратить эту вещь в сохранности на условиях, указанных в настоящем договоре. ' + '<h5>'

        deal_string = deal_string + '<h3 style="font-weight: 800 !important">Информация о сторонах</h3>'
        deal_string = deal_string + '<h5 style="font-weight: 800 !important">' + 'Хранитель: ' + deal.keeper.firstname +' '+deal.keeper.lastname +'</h5>'

        deal_string = deal_string + '<h5>' + 'Номер телефона: ' + deal.keeper.username +'</h5>'
        deal_string = deal_string + '<h5>' + 'Email: ' + deal.keeper.email +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата рождения: ' + deal.keeper.birthday  +'</h5>'
        deal_string = deal_string + '<h5>' + '№ Удостоверения личности: ' + deal.keeper.udv  +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата выдачи уд-ния личности: ' + deal.keeper.issueddate  +'</h5>'
        deal_string = deal_string + '<h5>' + 'ИИН: ' + deal.keeper.iin +'</h5>'
        deal_string = deal_string + '<h5>' + 'Адрес регистрации: ' + deal.keeper.address +'</h5>'
        if(deal.keeper.status=="Индивидуальный предприниматель"){
          deal_string = deal_string + '<h5>' + 'Наименование ИП: ' + deal.keeper.nameip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Номер свидетельства о гос. регистрации ИП: ' + deal.keeper.noregip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Дата гос. регистрации ИП: ' + dateFormat(deal.keeper.dateregip) +'</h5>'
          deal_string = deal_string + '<h5>' + 'Адрес регистрации в качестве ИП: ' + deal.keeper.addressregip +'</h5>'
        }

        deal_string = deal_string +'<h5 style="font-weight: 800 !important">' +'Поклажедатель: ' + deal.bailor.firstname +' '+deal.bailor.lastname +'</h5>'
        deal_string = deal_string + '<h5>' + 'Номер телефона: ' + deal.bailor.username +'</h5>'
        deal_string = deal_string + '<h5>' + 'Email: ' + deal.bailor.email +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата рождения: ' + deal.bailor.birthday  +'</h5>'
        deal_string = deal_string + '<h5>' + '№ Удостоверения личности: ' + deal.bailor.udv  +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата выдачи уд-ния личности: ' + deal.bailor.issueddate  +'</h5>'
        deal_string = deal_string + '<h5>' + 'ИИН: ' + deal.bailor.iin +'</h5>'
        deal_string = deal_string + '<h5>' + 'Адрес регистрации: ' + deal.bailor.address +'</h5>'
        if(deal.bailor.status=="Индивидуальный предприниматель"){
          deal_string = deal_string + '<h5>' + 'Наименование ИП: ' + deal.bailor.nameip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Номер свидетельства о гос. регистрации ИП: ' + deal.bailor.noregip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Дата гос. регистрации ИП: ' + dateFormat(deal.bailor.dateregip) +'</h5>'
          deal_string = deal_string + '<h5>' + 'Адрес регистрации в качестве ИП: ' + deal.bailor.addressregip +'</h5>'
        }

        deal_string = deal_string + '<h3 class="cust_weight">Условия сделки</h3>'
        deal_string = deal_string +  '<h5>' + 'Вещь, передаваемая на хранение: ' + fieldEncryption.decrypt(deal.itemname, SK) +'</h5>'+ '<h5>' + 'Вознаграждение и возмещение расходов хранителю: ' + fieldEncryption.decrypt(deal.awardamount, SK) +'</h5>'
        deal_string = deal_string +  '<h5>' + 'Сроки и порядок оплаты: ' + fieldEncryption.decrypt(deal.payday, SK) +'</h5>' +  '<h5>' + 'Ответственность за несохранность: ' + fieldEncryption.decrypt(deal.responsibility, SK) +'</h5>'
        deal_string = deal_string +  '<h5>' + 'Срок действия договора: ' + dateFormat(deal.duedate)
        // console.log(deal_string)
        if(deal.additional){
          deal_string = deal_string +  '<h5>' + 'Дополнительные условия: ' + fieldEncryption.decrypt(deal.additional, SK)+'</h5>'
        }
        createTimeLine(deal_id, deal_string, user_id)
      }
  })
}
function getDeal688(deal_id, user_id){
  Deal688.findOne({deal_id: deal_id}).populate('сarrier sender').exec((err, deal) =>{
    if(err) console.log(err)
      if(deal){
        var deal_string = '<h5 style="font-weight: 800 !important">' + 'Наименование договора: ' +'</h5><h5>' +  deal.deal_name +'</h5>'
        deal_string =  deal_string + '<h5 style="font-weight: 800 !important">' + 'Предмет договора:'+'</h5><h5>' + ' Перевозчик обязуется доставить вверенный ему Отправителем груз в пункт назначения и выдать уполномоченному на получение груза лицу (получателю), а отправитель обязуется уплатить за перевозку груза плату на условиях, указанных в настоящем договоре. ' + '</h5>'
        deal_string = deal_string + '<h3 class="cust_weight">Информация о сторонах</h3>'
        deal_string = deal_string + '<h5 style="font-weight: 800 !important">' + 'Отправитель: ' + deal.sender.firstname +' '+deal.sender.lastname +'</h5>'

        deal_string = deal_string + '<h5>' + 'Номер телефона: ' + deal.sender.username +'</h5>'
        deal_string = deal_string + '<h5>' + 'Email: ' + deal.sender.email +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата рождения: ' + deal.sender.birthday  +'</h5>'
        deal_string = deal_string + '<h5>' + '№ Удостоверения личности: ' + deal.sender.udv  +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата выдачи уд-ния личности: ' + deal.sender.issueddate  +'</h5>'
        deal_string = deal_string + '<h5>' + 'ИИН: ' + deal.sender.iin +'</h5>'
        deal_string = deal_string + '<h5>' + 'Адрес регистрации: ' + deal.sender.address +'</h5>'
        if(deal.sender.status=="Индивидуальный предприниматель"){
          deal_string = deal_string + '<h5>' + 'Наименование ИП: ' + deal.sender.nameip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Номер свидетельства о гос. регистрации ИП: ' + deal.sender.noregip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Дата гос. регистрации ИП: ' + dateFormat(deal.sender.dateregip) +'</h5>'
          deal_string = deal_string + '<h5>' + 'Адрес регистрации в качестве ИП: ' + deal.sender.addressregip +'</h5>'
        }


        deal_string = deal_string + '<h5 style="font-weight: 800 !important">' +'Перевозчик: ' + deal.сarrier.firstname +' '+deal.сarrier.lastname +'</h5>'

        deal_string = deal_string + '<h5>' + 'Номер телефона: ' + deal.сarrier.username +'</h5>'
        deal_string = deal_string + '<h5>' + 'Email: ' + deal.сarrier.email +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата рождения: ' + deal.сarrier.birthday  +'</h5>'
        deal_string = deal_string + '<h5>' + '№ Удостоверения личности: ' + deal.сarrier.udv  +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата выдачи уд-ния личности: ' + deal.сarrier.issueddate  +'</h5>'
        deal_string = deal_string + '<h5>' + 'ИИН: ' + deal.сarrier.iin +'</h5>'
        deal_string = deal_string + '<h5>' + 'Адрес регистрации: ' + deal.сarrier.address +'</h5>'
        if(deal.сarrier.status=="Индивидуальный предприниматель"){
          deal_string = deal_string + '<h5>' + 'Наименование ИП: ' + deal.сarrier.nameip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Номер свидетельства о гос. регистрации ИП: ' + deal.сarrier.noregip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Дата гос. регистрации ИП: ' + dateFormat(deal.сarrier.dateregip) +'</h5>'
          deal_string = deal_string + '<h5>' + 'Адрес регистрации в качестве ИП: ' + deal.сarrier.addressregip +'</h5>'
        }

        deal_string = deal_string + '<h3 class="cust_weight">Условия сделки</h3>'
        deal_string = deal_string +  '<h5>' + 'Перевозимое имущество: ' + fieldEncryption.decrypt(deal.transportableproperty, SK) +'</h5>'+ '<h5>' + 'Адрес отправки: ' + fieldEncryption.decrypt(deal.shippingaddress, SK) +'</h5>'
        deal_string = deal_string +  '<h5>' + 'Адрес доставки: ' + fieldEncryption.decrypt(deal.deliveryaddress, SK) +'</h5>' +  '<h5>' + 'Получатель имущества: ' + fieldEncryption.decrypt(deal.recipientofproperty, SK) +'</h5>'
        deal_string = deal_string +  '<h5>' + 'Срок доставки: ' + dateFormat(deal.shippingday)
        deal_string = deal_string +  '<h5>' + 'Цена доставки: ' + fieldEncryption.decrypt(deal.shippingprice, SK)
        deal_string = deal_string +  '<h5>' + 'Порядок оплаты: ' + fieldEncryption.decrypt(deal.payday, SK)
        deal_string = deal_string +  '<h5>' + 'Срок действия договора: ' + dateFormat(deal.duedate)
        // console.log(deal_string)
        if(deal.additional){
          deal_string = deal_string +  '<h5>' + 'Дополнительные условия: ' + fieldEncryption.decrypt(deal.additional, SK)+'</h5>'
        }
        createTimeLine(deal_id, deal_string, user_id)
      }
  })
}
function getDeal616(deal_id, user_id){
  Deal616.findOne({deal_id: deal_id}).populate('employer employee').exec((err, deal) =>{
    if(err) console.log(err)
      if(deal){
        var deal_string =  '<h5 style="font-weight: 800 !important">' + 'Наименование договора: ' +'</h5><h5>' +  deal.deal_name +'</h5>'
        deal_string  = deal_string +  '<h5 class="cust_weight">' + 'Предмет договора: '+'</h5><h5>' + 'Подрядчик обязуется выполнить по заданию Заказчика определенную работу, а Заказчик обязуется оплатить такую работу на условиях, указанных в настоящем договоре.' + '</h5>'
        deal_string = deal_string + '<h3 style="font-weight: 800 !important">Информация о сторонах</h3>'

        deal_string = deal_string + '<h5 style="font-weight: 800 !important">' + 'Заказчик: ' + deal.employee.firstname +' '+deal.employee.lastname +'</h5>'
        deal_string = deal_string + '<h5>' + 'Номер телефона: ' + deal.employee.username +'</h5>'
        deal_string = deal_string + '<h5>' + 'Email: ' + deal.employee.email +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата рождения: ' + deal.employee.birthday  +'</h5>'
        deal_string = deal_string + '<h5>' + '№ Удостоверения личности: ' + deal.employee.udv  +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата выдачи уд-ния личности: ' + deal.employee.issueddate  +'</h5>'
        deal_string = deal_string + '<h5>' + 'ИИН: ' + deal.employee.iin +'</h5>'
        deal_string = deal_string + '<h5>' + 'Адрес регистрации: ' + deal.employee.address +'</h5>'
        if(deal.employee.status=="Индивидуальный предприниматель"){
          deal_string = deal_string + '<h5>' + 'Наименование ИП: ' + deal.employee.nameip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Номер свидетельства о гос. регистрации ИП: ' + deal.employee.noregip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Дата гос. регистрации ИП: ' + dateFormat(deal.employee.dateregip) +'</h5>'
          deal_string = deal_string + '<h5>' + 'Адрес регистрации в качестве ИП: ' + deal.employee.addressregip +'</h5>'
        }


        deal_string = deal_string + '<h5 style="font-weight: 800 !important">'+'Подрядчик: ' + deal.employer.firstname +' '+deal.employer.lastname +'</h5>'
        deal_string = deal_string + '<h5>' + 'Номер телефона: ' + deal.employer.username +'</h5>'
        deal_string = deal_string + '<h5>' + 'Email: ' + deal.employer.email +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата рождения: ' + deal.employer.birthday  +'</h5>'
        deal_string = deal_string + '<h5>' + '№ Удостоверения личности: ' + deal.employer.udv  +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата выдачи уд-ния личности: ' + deal.employer.issueddate  +'</h5>'
        deal_string = deal_string + '<h5>' + 'ИИН: ' + deal.employer.iin +'</h5>'
        deal_string = deal_string + '<h5>' + 'Адрес регистрации: ' + deal.employer.address +'</h5>'
        if(deal.employer.status=="Индивидуальный предприниматель"){
          deal_string = deal_string + '<h5>' + 'Наименование ИП: ' + deal.employer.nameip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Номер свидетельства о гос. регистрации ИП: ' + deal.employer.noregip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Дата гос. регистрации ИП: ' + dateFormat(deal.employer.dateregip) +'</h5>'
          deal_string = deal_string + '<h5>' + 'Адрес регистрации в качестве ИП: ' + deal.employer.addressregip +'</h5>'
        }

        deal_string = deal_string + '<h3 class="cust_weight">Условия сделки</h3>'
        deal_string = deal_string +  '<h5>' + 'Описание работ: ' +
        fieldEncryption.decrypt(deal.workdescription, SK)+'</h5>'
        deal_string = deal_string +  '<h5>' + 'Адрес объекта при проведении работ по ремонту: '
        + fieldEncryption.decrypt(deal.workaddress, SK) +'</h5>'
        +'<h5>' + 'Цена работ: ' + fieldEncryption.decrypt(deal.workprice, SK) +'</h5>'
        deal_string = deal_string +  '<h5>' + 'Срок выполнения работ: ' +  dateFormat(deal.workdeadline) +'</h5>'
        deal_string = deal_string +  '<h5>' + 'Цена работ, тенге: ' +  fieldEncryption.decrypt(deal.workprice, SK) +'</h5>'
        deal_string = deal_string +  '<h5>' + 'Сроки и порядок оплаты: ' +  fieldEncryption.decrypt(deal.payday, SK) +'</h5>'
        deal_string = deal_string +  '<h5>' + 'Порядок приема работ: ' + fieldEncryption.decrypt(deal.workcheck, SK)
        deal_string = deal_string +  '<h5>' + 'Качество работ (гарантия качества работ): ' + fieldEncryption.decrypt(deal.quantity, SK)
        deal_string = deal_string +  '<h5>' + 'Срок действия договора: ' + dateFormat(deal.duedate)
        // console.log(deal_string)
        if(deal.additional){
          deal_string = deal_string +  '<h5>' + 'Дополнительные условия: ' + fieldEncryption.decrypt(deal.additional, SK)+'</h5>'
        }
        createTimeLine(deal_id, deal_string, user_id)
      }
  })
}
function getDeal506(deal_id, user_id){
    Deal506.findOne({deal_id: deal_id}).populate('presenter receiver').exec((err, deal) =>{
    if(err) console.log(err)
      if(deal){
        var deal_string = '<h5 style="font-weight: 800 !important">' + 'Наименование договора: ' +'</h5><h5>' +  deal.deal_name +'</h5>'
        deal_string  = deal_string + '<h5 style="font-weight: 800 !important">' + 'Предмет договора: '+'</h5><h5>' + 'Даритель обязуется передать Одаряемому вещь в собственность либо имущественное право (требование) к себе или третьему лицу, либо освобождает или обязуется освободить ее от имущественной обязанности перед третьим лицом на условиях, указанных в настоящем договоре.' + '</h5>'
        deal_string = deal_string + '<h3 class="cust_weight">Информация о сторонах</h3>'

        deal_string = deal_string + '<h5 style="font-weight: 800 !important">' + 'Одаряемый: ' + deal.receiver.firstname +' '+deal.receiver.lastname +'</h5>'
        deal_string = deal_string + '<h5>' + 'Номер телефона: ' + deal.receiver.username +'</h5>'
        deal_string = deal_string + '<h5>' + 'Email: ' + deal.receiver.email +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата рождения: ' + deal.receiver.birthday  +'</h5>'
        deal_string = deal_string + '<h5>' + '№ Удостоверения личности: ' + deal.receiver.udv  +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата выдачи уд-ния личности: ' + deal.receiver.issueddate  +'</h5>'
        deal_string = deal_string + '<h5>' + 'ИИН: ' + deal.receiver.iin +'</h5>'
        deal_string = deal_string + '<h5>' + 'Адрес регистрации: ' + deal.receiver.address +'</h5>'
        if(deal.receiver.status=="Индивидуальный предприниматель"){
          deal_string = deal_string + '<h5>' + 'Наименование ИП: ' + deal.receiver.nameip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Номер свидетельства о гос. регистрации ИП: ' + deal.receiver.noregip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Дата гос. регистрации ИП: ' + dateFormat(deal.receiver.dateregip) +'</h5>'
          deal_string = deal_string + '<h5>' + 'Адрес регистрации в качестве ИП: ' + deal.receiver.addressregip +'</h5>'
        }


        deal_string = deal_string + '<h5 style="font-weight: 800 !important">'+'Даритель: ' + deal.presenter.firstname +' '+deal.presenter.lastname +'</h5>'
        deal_string = deal_string + '<h5>' + 'Номер телефона: ' + deal.presenter.username +'</h5>'
        deal_string = deal_string + '<h5>' + 'Email: ' + deal.presenter.email +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата рождения: ' + deal.presenter.birthday  +'</h5>'
        deal_string = deal_string + '<h5>' + '№ Удостоверения личности: ' + deal.presenter.udv  +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата выдачи уд-ния личности: ' + deal.presenter.issueddate  +'</h5>'
        deal_string = deal_string + '<h5>' + 'ИИН: ' + deal.presenter.iin +'</h5>'
        deal_string = deal_string + '<h5>' + 'Адрес регистрации: ' + deal.presenter.address +'</h5>'
        if(deal.presenter.status=="Индивидуальный предприниматель"){
          deal_string = deal_string + '<h5>' + 'Наименование ИП: ' + deal.presenter.nameip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Номер свидетельства о гос. регистрации ИП: ' + deal.presenter.noregip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Дата гос. регистрации ИП: ' + dateFormat(deal.presenter.dateregip) +'</h5>'
          deal_string = deal_string + '<h5>' + 'Адрес регистрации в качестве ИП: ' + deal.presenter.addressregip +'</h5>'
        }

        deal_string = deal_string + '<h3 class="cust_weight">Условия сделки</h3>'
        deal_string = deal_string +  '<h5>' + 'Наименование дара (вещи или имущественного права (требование) либо освобождения от имущественной обязанности): ' +
        fieldEncryption.decrypt(deal.itemname, SK)+'</h5>'
        deal_string = deal_string +  '<h5>' + 'Количество дара: '
        + fieldEncryption.decrypt(deal.quantity, SK) +'</h5>'
        +'<h5>' + 'Сроки и порядок передачи дара(момент перехода права собственности): ' + fieldEncryption.decrypt(deal.deadline, SK) +'</h5>'
        deal_string = deal_string +  '<h5>' + 'Срок действия договора: ' + dateFormat(deal.duedate)
        // console.log(deal_string)
        if(deal.additional){
          deal_string = deal_string +  '<h5>' + 'Дополнительные условия: ' + fieldEncryption.decrypt(deal.additional, SK)+'</h5>'
        }
        createTimeLine(deal_id, deal_string, user_id)
      }
  })

}
function getDeal715(deal_id, user_id){
  Deal715.findOne({deal_id: deal_id}).populate('borrower giver').exec((err, deal) =>{
    if(err) console.log(err)
      if(deal){
        var deal_string = '<h5 style="font-weight: 800 !important">' + 'Наименование договора: ' +'</h5><h5>' + deal.deal_name +'</h5>'
        deal_string  = deal_string + '<h5 style="font-weight: 800 !important">' + 'Предмет договора:'+'</h5><h5>' + ' Займодатель передает, а в случаях, предусмотренных настоящим договором, обязуется передать в собственность деньги или вещи, а заемщик обязуется своевременно возвратитьм займодателю такую же сумму денег или равное количество вещей того же рода и качества, на условиях указанных в настоящем договоре.' + '</h5>'

        deal_string = deal_string + '<h3 class="cust_weight">Информация о сторонах</h3>'

        deal_string = deal_string + '<h5 style="font-weight: 800 !important">' + 'Заимодатель: ' + deal.giver.firstname +' '+deal.giver.lastname +'</h5>'
        deal_string = deal_string + '<h5>' + 'Номер телефона: ' + deal.giver.username +'</h5>'
        deal_string = deal_string + '<h5>' + 'Email: ' + deal.giver.email +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата рождения: ' + deal.giver.birthday  +'</h5>'
        deal_string = deal_string + '<h5>' + '№ Удостоверения личности: ' + deal.giver.udv  +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата выдачи уд-ния личности: ' + deal.giver.issueddate  +'</h5>'
        deal_string = deal_string + '<h5>' + 'ИИН: ' + deal.giver.iin +'</h5>'
        deal_string = deal_string + '<h5>' + 'Адрес регистрации: ' + deal.giver.address +'</h5>'
        if(deal.giver.status=="Индивидуальный предприниматель"){
          deal_string = deal_string + '<h5>' + 'Наименование ИП: ' + deal.giver.nameip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Номер свидетельства о гос. регистрации ИП: ' + deal.giver.noregip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Дата гос. регистрации ИП: ' + dateFormat(deal.giver.dateregip) +'</h5>'
          deal_string = deal_string + '<h5>' + 'Адрес регистрации в качестве ИП: ' + deal.giver.addressregip +'</h5>'
        }


        deal_string = deal_string + '<h5 style="font-weight: 800 !important">'+'Заемщик: ' + deal.borrower.firstname +' '+deal.borrower.lastname +'</h5>'
        deal_string = deal_string + '<h5>' + 'Номер телефона: ' + deal.borrower.username +'</h5>'
        deal_string = deal_string + '<h5>' + 'Email: ' + deal.borrower.email +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата рождения: ' + deal.borrower.birthday  +'</h5>'
        deal_string = deal_string + '<h5>' + '№ Удостоверения личности: ' + deal.borrower.udv  +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата выдачи уд-ния личности: ' + deal.borrower.issueddate  +'</h5>'
        deal_string = deal_string + '<h5>' + 'ИИН: ' + deal.borrower.iin +'</h5>'
        deal_string = deal_string + '<h5>' + 'Адрес регистрации: ' + deal.borrower.address +'</h5>'
        if(deal.borrower.status=="Индивидуальный предприниматель"){
          deal_string = deal_string + '<h5>' + 'Наименование ИП: ' + deal.borrower.nameip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Номер свидетельства о гос. регистрации ИП: ' + deal.borrower.noregip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Дата гос. регистрации ИП: ' + dateFormat(deal.borrower.dateregip) +'</h5>'
          deal_string = deal_string + '<h5>' + 'Адрес регистрации в качестве ИП: ' + deal.borrower.addressregip +'</h5>'
        }

        deal_string = deal_string + '<h3 class="cust_weight">Условия сделки</h3>'
        deal_string = deal_string +  '<h5>' + 'Cумма займа* (тенге): ' +
        fieldEncryption.decrypt(deal.loanamount, SK)+'</h5>'
        deal_string = deal_string +  '<h5>' + 'Срок займа: ' + dateFormat(deal.loanterm)+'</h5>'
        deal_string = deal_string +  '<h5>' + 'Размер вознаграждения: '
        + fieldEncryption.decrypt(deal.awardamount, SK) +'</h5>'
        +'<h5>' + 'Сроки и порядок выплаты вознаграждения: ' + fieldEncryption.decrypt(deal.deadline, SK) +'</h5>'
        deal_string = deal_string +  '<h5>' + 'Срок действия договора: ' + dateFormat(deal.duedate)
        // console.log(deal_string)
        if(deal.additional){
          deal_string = deal_string +  '<h5>' + 'Дополнительные условия: ' + fieldEncryption.decrypt(deal.additional, SK)+'</h5>'
        }
        createTimeLine(deal_id, deal_string, user_id)
      }
  })


}
function getDeal683(deal_id, user_id){
  Deal683.findOne({deal_id: deal_id}).populate('employer employee').exec((err, deal) =>{
    if(err) console.log(err)
      if(deal){
        var deal_string =  '<h5 style="font-weight: 800 !important">' + 'Наименование договора: ' +'</h5><h5>' + deal.deal_name +'</h5>'
        deal_string  = deal_string + '<h5 class="cust_weight">' + 'Предмет договора: '+'</h5><h5>' + 'Исполнитель обязуется оказать услуги (совершить определенные действия или осуществить определенную деятельность), а Заказчик обязуется оплатить эти услуги на условиях, указанных в настоящем договоре.' + '</h5>'

        deal_string = deal_string + '<h3 class="cust_weight">Информация о сторонах</h3>'

        deal_string = deal_string + '<h5 style="font-weight: 800 !important">' + 'Подрядчик: ' + deal.employer.firstname +' '+deal.employer.lastname +'</h5>'
        deal_string = deal_string + '<h5>' + 'Номер телефона: ' + deal.employer.username +'</h5>'
        deal_string = deal_string + '<h5>' + 'Email: ' + deal.employer.email +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата рождения: ' + deal.employer.birthday  +'</h5>'
        deal_string = deal_string + '<h5>' + '№ Удостоверения личности: ' + deal.employer.udv  +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата выдачи уд-ния личности: ' + deal.employer.issueddate  +'</h5>'
        deal_string = deal_string + '<h5>' + 'ИИН: ' + deal.employer.iin +'</h5>'
        deal_string = deal_string + '<h5>' + 'Адрес регистрации: ' + deal.employer.address +'</h5>'
        if(deal.employer.status=="Индивидуальный предприниматель"){
          deal_string = deal_string + '<h5>' + 'Наименование ИП: ' + deal.employer.nameip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Номер свидетельства о гос. регистрации ИП: ' + deal.employer.noregip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Дата гос. регистрации ИП: ' + dateFormat(deal.employer.dateregip) +'</h5>'
          deal_string = deal_string + '<h5>' + 'Адрес регистрации в качестве ИП: ' + deal.employer.addressregip +'</h5>'
        }


        deal_string = deal_string + '<h5 style="font-weight: 800 !important">'+'Исполнитель: ' + deal.employee.firstname +' '+deal.employee.lastname +'</h5>'
        deal_string = deal_string + '<h5>' + 'Номер телефона: ' + deal.employee.username +'</h5>'
        deal_string = deal_string + '<h5>' + 'Email: ' + deal.employee.email +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата рождения: ' + deal.employee.birthday  +'</h5>'
        deal_string = deal_string + '<h5>' + '№ Удостоверения личности: ' + deal.employee.udv  +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата выдачи уд-ния личности: ' + deal.employee.issueddate  +'</h5>'
        deal_string = deal_string + '<h5>' + 'ИИН: ' + deal.employee.iin +'</h5>'
        deal_string = deal_string + '<h5>' + 'Адрес регистрации: ' + deal.employee.address +'</h5>'
        if(deal.employee.status=="Индивидуальный предприниматель"){
          deal_string = deal_string + '<h5>' + 'Наименование ИП: ' + deal.employee.nameip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Номер свидетельства о гос. регистрации ИП: ' + deal.employee.noregip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Дата гос. регистрации ИП: ' + dateFormat(deal.employee.dateregip) +'</h5>'
          deal_string = deal_string + '<h5>' + 'Адрес регистрации в качестве ИП: ' + deal.employee.addressregip +'</h5>'
        }

        deal_string = deal_string + '<h3 class="cust_weight">Условия сделки</h3>'
        deal_string = deal_string +  '<h5>' + 'Описание услуг: ' +
        fieldEncryption.decrypt(deal.description, SK)+'</h5>'
        deal_string = deal_string +  '<h5>' + 'Срок оказания услуг: '
        + dateFormat(deal.deadline, SK) +'</h5>'
        +'<h5>' + 'Цена услуг, тенге: ' + fieldEncryption.decrypt(deal.price, SK) +'</h5>'
        deal_string = deal_string +  '<h5>' + 'Сроки и порядок оплаты: ' + fieldEncryption.decrypt(deal.paydeadline, SK)
        deal_string = deal_string +  '<h5>' + 'Качество услуг: ' + fieldEncryption.decrypt(deal.quality, SK)
        deal_string = deal_string +  '<h5>' + 'Срок действия договора: ' + dateFormat(deal.duedate)
        // console.log(deal_string)
        if(deal.additional){
          deal_string = deal_string +  '<h5>' + 'Дополнительные условия: ' + fieldEncryption.decrypt(deal.additional, SK)+'</h5>'
        }
        createTimeLine(deal_id, deal_string, user_id)
      }
  })


}
function getDeal604(deal_id, user_id){
  Deal604.findOne({deal_id: deal_id}).populate('lender borrower').exec((err, deal) =>{
    if(err) console.log(err)
      if(deal){
        var deal_string =  '<h5 style="font-weight: 800 !important">' + 'Наименование договора: ' +'</h5><h5>' +  deal.deal_name +'</h5>'
        deal_string  = deal_string +  '<h5 style="font-weight: 800 !important">' + 'Предмет договора:'+'</h5><h5>' + ' Ссудодатель передает имущество в безвозмездное временное пользование Cсудополучателю на условиях, указанных в настоящем договоре.' + '</h5>'

        deal_string = deal_string + '<h3 class="cust_weight">Информация о сторонах</h3>'

        deal_string = deal_string + '<h5 style="font-weight: 800 !important">' + 'Ссудополучатель: ' + deal.borrower.firstname +' '+deal.borrower.lastname +'</h5>'
        deal_string = deal_string + '<h5>' + 'Номер телефона: ' + deal.borrower.username +'</h5>'
        deal_string = deal_string + '<h5>' + 'Email: ' + deal.borrower.email +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата рождения: ' + deal.borrower.birthday  +'</h5>'
        deal_string = deal_string + '<h5>' + '№ Удостоверения личности: ' + deal.borrower.udv  +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата выдачи уд-ния личности: ' + deal.borrower.issueddate  +'</h5>'
        deal_string = deal_string + '<h5>' + 'ИИН: ' + deal.borrower.iin +'</h5>'
        deal_string = deal_string + '<h5>' + 'Адрес регистрации: ' + deal.borrower.address +'</h5>'
        if(deal.borrower.status=="Индивидуальный предприниматель"){
          deal_string = deal_string + '<h5>' + 'Наименование ИП: ' + deal.borrower.nameip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Номер свидетельства о гос. регистрации ИП: ' + deal.borrower.noregip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Дата гос. регистрации ИП: ' + dateFormat(deal.borrower.dateregip) +'</h5>'
          deal_string = deal_string + '<h5>' + 'Адрес регистрации в качестве ИП: ' + deal.borrower.addressregip +'</h5>'
        }


        deal_string = deal_string + '<h5 style="font-weight: 800 !important">'+'Ссудодатель: ' + deal.lender.firstname +' '+deal.lender.lastname +'</h5>'
        deal_string = deal_string + '<h5>' + 'Номер телефона: ' + deal.lender.username +'</h5>'
        deal_string = deal_string + '<h5>' + 'Email: ' + deal.lender.email +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата рождения: ' + deal.lender.birthday  +'</h5>'
        deal_string = deal_string + '<h5>' + '№ Удостоверения личности: ' + deal.lender.udv  +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата выдачи уд-ния личности: ' + deal.lender.issueddate  +'</h5>'
        deal_string = deal_string + '<h5>' + 'ИИН: ' + deal.lender.iin +'</h5>'
        deal_string = deal_string + '<h5>' + 'Адрес регистрации: ' + deal.lender.address +'</h5>'
        if(deal.lender.status=="Индивидуальный предприниматель"){
          deal_string = deal_string + '<h5>' + 'Наименование ИП: ' + deal.lender.nameip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Номер свидетельства о гос. регистрации ИП: ' + deal.lender.noregip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Дата гос. регистрации ИП: ' + dateFormat(deal.lender.dateregip) +'</h5>'
          deal_string = deal_string + '<h5>' + 'Адрес регистрации в качестве ИП: ' + deal.lender.addressregip +'</h5>'
        }

        deal_string = deal_string + '<h3 class="cust_weight">Условия сделки</h3>'
        deal_string = deal_string +  '<h5>' + 'Данные, позволяющие установить имущество, подлежащее передаче: ' +
        fieldEncryption.decrypt(deal.itemdata, SK)+'</h5>'
        deal_string = deal_string +  '<h5>' + 'Сроки и порядок передачи имущества: '
        + dateFormat(deal.giveawaydeadline, SK) +'</h5>'
        +'<h5>' + 'Срок пользования имуществом: ' + dateFormat(deal.usedeadline) +'</h5>'
        deal_string = deal_string +  '<h5>' + 'Условия о содержании имущества: ' + fieldEncryption.decrypt(deal.keepcondition, SK)
        deal_string = deal_string +  '<h5>' + 'Условия об использовании имущества: ' + fieldEncryption.decrypt(deal.usecondition, SK)
        deal_string = deal_string +  '<h5>' + 'Срок действия договора: ' + dateFormat(deal.duedate)
        // console.log(deal_string)
        if(deal.additional){
          deal_string = deal_string +  '<h5>' + 'Дополнительные условия: ' + fieldEncryption.decrypt(deal.additional, SK)+'</h5>'
        }
        createTimeLine(deal_id, deal_string, user_id)
      }
  })
}
function getDeal540(deal_id, user_id){
  Deal540.findOne({deal_id: deal_id}).populate('employer employee').exec((err, deal) =>{
    if(err) console.log(err)
      if(deal){
        var deal_string =  '<h5 style="font-weight: 800 !important">' + 'Наименование договора: ' +'</h5><h5>' +  deal.deal_name +'</h5>'
        deal_string  = deal_string + '<h5 style="font-weight: 800 !important">' + 'Предмет договора: '+'</h5><h5>' + ' Наймодатель предоставляет нанимателю имущество за плату во временное владение и пользование на условиях, указанных в настоящем договоре. Внимание: при выборе недвижимого имущества срок договора должен составлять менее года, иначе сделка должна быть выполнена в письменном виде и зарегистрирована в установленном законодательством порядке.' + '</h5>'

        deal_string = deal_string + '<h3 class="cust_weight">Информация о сторонах</h3>'

        deal_string = deal_string + '<h5 style="font-weight: 800 !important">' + 'Наймодатель: ' + deal.employer.firstname +' '+deal.employer.lastname +'</h5>'
        deal_string = deal_string + '<h5>' + 'Номер телефона: ' + deal.employer.username +'</h5>'
        deal_string = deal_string + '<h5>' + 'Email: ' + deal.employer.email +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата рождения: ' + deal.employer.birthday  +'</h5>'
        deal_string = deal_string + '<h5>' + '№ Удостоверения личности: ' + deal.employer.udv  +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата выдачи уд-ния личности: ' + deal.employer.issueddate  +'</h5>'
        deal_string = deal_string + '<h5>' + 'ИИН: ' + deal.employer.iin +'</h5>'
        deal_string = deal_string + '<h5>' + 'Адрес регистрации: ' + deal.employer.address +'</h5>'
        if(deal.employer.status=="Индивидуальный предприниматель"){
          deal_string = deal_string + '<h5>' + 'Наименование ИП: ' + deal.employer.nameip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Номер свидетельства о гос. регистрации ИП: ' + deal.employer.noregip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Дата гос. регистрации ИП: ' + dateFormat(deal.employer.dateregip) +'</h5>'
          deal_string = deal_string + '<h5>' + 'Адрес регистрации в качестве ИП: ' + deal.employer.addressregip +'</h5>'
        }


        deal_string = deal_string + '<h5 style="font-weight: 800 !important">'+'Наниматель: ' + deal.employee.firstname +' '+deal.employee.lastname +'</h5>'
        deal_string = deal_string + '<h5>' + 'Номер телефона: ' + deal.employee.username +'</h5>'
        deal_string = deal_string + '<h5>' + 'Email: ' + deal.employee.email +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата рождения: ' + deal.employee.birthday  +'</h5>'
        deal_string = deal_string + '<h5>' + '№ Удостоверения личности: ' + deal.employee.udv  +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата выдачи уд-ния личности: ' + deal.employee.issueddate  +'</h5>'
        deal_string = deal_string + '<h5>' + 'ИИН: ' + deal.employee.iin +'</h5>'
        deal_string = deal_string + '<h5>' + 'Адрес регистрации: ' + deal.employee.address +'</h5>'
        if(deal.employee.status=="Индивидуальный предприниматель"){
          deal_string = deal_string + '<h5>' + 'Наименование ИП: ' + deal.employee.nameip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Номер свидетельства о гос. регистрации ИП: ' + deal.employee.noregip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Дата гос. регистрации ИП: ' + dateFormat(deal.employee.dateregip) +'</h5>'
          deal_string = deal_string + '<h5>' + 'Адрес регистрации в качестве ИП: ' + deal.employee.addressregip +'</h5>'
        }

        deal_string = deal_string + '<h3 class="cust_weight">Условия сделки</h3>'
        deal_string = deal_string +  '<h5>' + 'Данные, позволяющие установить имущество, подлежащее передаче в аренду: ' +
        fieldEncryption.decrypt(deal.itemdata, SK)+'</h5>'
        deal_string = deal_string +  '<h5>' + 'Cроки и порядок передачи/возврата имущества: '
        + dateFormat(deal.deadline, SK) +'</h5>'
        +'<h5>' + 'Сроки и порядок оплаты: ' + fieldEncryption.decrypt(deal.payday, SK) +'</h5>'
        deal_string = deal_string +  '<h5>' + 'Условия о содержании/улучшении имущества: ' + fieldEncryption.decrypt(deal.keepcondition, SK)
        deal_string = deal_string +  '<h5>' + 'Условия об использовании имущества (в т.ч. пределах распоряжения): ' + fieldEncryption.decrypt(deal.usecondition, SK)
        deal_string = deal_string +  '<h5>' + 'Срок действия договора: ' + dateFormat(deal.duedate)
        // console.log(deal_string)
        if(deal.additional){
          deal_string = deal_string +  '<h5>' + 'Дополнительные условия: ' + fieldEncryption.decrypt(deal.additional, SK)+'</h5>'
        }
        createTimeLine(deal_id, deal_string, user_id)
      }
  })

}

function getDeal846(deal_id, user_id){
  Deal846.findOne({deal_id: deal_id}).populate('principal attorney').exec((err, deal) =>{
    if(err) console.log(err)
      if(deal){
        var deal_string =  '<h5 style="font-weight: 800 !important">' + 'Наименование договора: ' +'</h5><h5>' + deal.deal_name +'</h5>'
        deal_string  = deal_string + '<h5 style="font-weight: 800 !important">' + 'Предмет договора: '+'</h5><h5>' + 'Поверенный обязуется совершить от имени и за счет другой стороны Доверителя, определенные юридические действия на условиях, указанных в настоящем договоре. По сделке, совершенной поверенным, права и обязанности возникают непосредственно у Доверителя.' + '</h5>'

        deal_string = deal_string + '<h3 class="cust_weight">Информация о сторонах</h3>'

        deal_string = deal_string + '<h5  style="font-weight: 800 !important">' + 'Доверитель: ' + deal.principal.firstname +' '+deal.principal.lastname +'</h5>'
        deal_string = deal_string + '<h5>' + 'Номер телефона: ' + deal.principal.username +'</h5>'
        deal_string = deal_string + '<h5>' + 'Email: ' + deal.principal.email +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата рождения: ' + deal.principal.birthday  +'</h5>'
        deal_string = deal_string + '<h5>' + '№ Удостоверения личности: ' + deal.principal.udv  +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата выдачи уд-ния личности: ' + deal.principal.issueddate  +'</h5>'
        deal_string = deal_string + '<h5>' + 'ИИН: ' + deal.principal.iin +'</h5>'
        deal_string = deal_string + '<h5>' + 'Адрес регистрации: ' + deal.principal.address +'</h5>'
        if(deal.principal.status=="Индивидуальный предприниматель"){
          deal_string = deal_string + '<h5>' + 'Наименование ИП: ' + deal.principal.nameip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Номер свидетельства о гос. регистрации ИП: ' + deal.principal.noregip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Дата гос. регистрации ИП: ' + dateFormat(deal.principal.dateregip) +'</h5>'
          deal_string = deal_string + '<h5>' + 'Адрес регистрации в качестве ИП: ' + deal.principal.addressregip +'</h5>'
        }


        deal_string = deal_string + '<h5 style="font-weight: 800 !important">'+'Поверенный: ' + deal.attorney.firstname +' '+deal.attorney.lastname +'</h5>'
        deal_string = deal_string + '<h5>' + 'Номер телефона: ' + deal.attorney.username +'</h5>'
        deal_string = deal_string + '<h5>' + 'Email: ' + deal.attorney.email +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата рождения: ' + deal.attorney.birthday  +'</h5>'
        deal_string = deal_string + '<h5>' + '№ Удостоверения личности: ' + deal.attorney.udv  +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата выдачи уд-ния личности: ' + deal.attorney.issueddate  +'</h5>'
        deal_string = deal_string + '<h5>' + 'ИИН: ' + deal.attorney.iin +'</h5>'
        deal_string = deal_string + '<h5>' + 'Адрес регистрации: ' + deal.attorney.address +'</h5>'
        if(deal.attorney.status=="Индивидуальный предприниматель"){
          deal_string = deal_string + '<h5>' + 'Наименование ИП: ' + deal.attorney.nameip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Номер свидетельства о гос. регистрации ИП: ' + deal.attorney.noregip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Дата гос. регистрации ИП: ' + dateFormat(deal.attorney.dateregip) +'</h5>'
          deal_string = deal_string + '<h5>' + 'Адрес регистрации в качестве ИП: ' + deal.attorney.addressregip +'</h5>'
        }

        deal_string = deal_string + '<h3 class="cust_weight">Условия сделки</h3>'
        deal_string = deal_string +  '<h5>' + 'Описание поручаемых действий: ' +
        fieldEncryption.decrypt(deal.description, SK)+'</h5>'
        deal_string = deal_string +  '<h5>' + 'Срок поручения: '
        + dateFormat(deal.termofassignment, SK) +'</h5>'
        +'<h5>' + 'Размер вознаграждения поверенного, тенге: ' + fieldEncryption.decrypt(deal.priceaward, SK) +'</h5>'
        deal_string = deal_string +  '<h5>' + 'Условия о содержании/улучшении имущества: ' + fieldEncryption.decrypt(deal.keepcondition, SK)
        deal_string = deal_string +  '<h5>' + 'Сроки и порядок оплаты вознаграждения: ' + fieldEncryption.decrypt(deal.payday, SK)
          deal_string = deal_string +  '<h5>' + 'Указания доверителя: ' + fieldEncryption.decrypt(deal.rules, SK)
        deal_string = deal_string +  '<h5>' + 'Срок действия договора: ' + dateFormat(deal.duedate)
        // console.log(deal_string)
        if(deal.additional){
          deal_string = deal_string +  '<h5>' + 'Дополнительные условия: ' + fieldEncryption.decrypt(deal.additional, SK)+'</h5>'
        }
        createTimeLine(deal_id, deal_string, user_id)
      }
  })
}
function getDeal501(deal_id, user_id){
  Deal501.findOne({deal_id: deal_id}).populate('side1 side2').exec((err, deal) =>{
    if(err) console.log(err)
      if(deal){
        var deal_string = '<h5 style="font-weight: 800 !important">' + 'Наименование договора: ' +'</h5><h5>' +  deal.deal_name +'</h5>'
        deal_string  = deal_string + '<h5 style="font-weight: 800 !important">' + 'Предмет договора:'+'</h5><h5>' + '  Одна сторона передает другой и получает взамен имущество на условиях, указанных в настоящем договоре.' + '</h5>'

        deal_string = deal_string + '<h3 class="cust_weight">Информация о сторонах</h3>'

        deal_string = deal_string + '<h5 style="font-weight: 800 !important">' + 'Сторона 1: ' + deal.side1.firstname +' '+deal.side1.lastname +'</h5>'
        deal_string = deal_string + '<h5>' + 'Номер телефона: ' + deal.side1.username +'</h5>'
        deal_string = deal_string + '<h5>' + 'Email: ' + deal.side1.email +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата рождения: ' + deal.side1.birthday  +'</h5>'
        deal_string = deal_string + '<h5>' + '№ Удостоверения личности: ' + deal.side1.udv  +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата выдачи уд-ния личности: ' + deal.side1.issueddate  +'</h5>'
        deal_string = deal_string + '<h5>' + 'ИИН: ' + deal.side1.iin +'</h5>'
        deal_string = deal_string + '<h5>' + 'Адрес регистрации: ' + deal.side1.address +'</h5>'
        if(deal.side1.status=="Индивидуальный предприниматель"){
          deal_string = deal_string + '<h5>' + 'Наименование ИП: ' + deal.side1.nameip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Номер свидетельства о гос. регистрации ИП: ' + deal.side1.noregip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Дата гос. регистрации ИП: ' + dateFormat(deal.side1.dateregip) +'</h5>'
          deal_string = deal_string + '<h5>' + 'Адрес регистрации в качестве ИП: ' + deal.side1.addressregip +'</h5>'
        }


        deal_string = deal_string + '<h5 style="font-weight: 800 !important">'+'Сторона 2: ' + deal.side2.firstname +' '+deal.side2.lastname +'</h5>'
        deal_string = deal_string + '<h5>' + 'Номер телефона: ' + deal.side2.username +'</h5>'
        deal_string = deal_string + '<h5>' + 'Email: ' + deal.side2.email +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата рождения: ' + deal.side2.birthday  +'</h5>'
        deal_string = deal_string + '<h5>' + '№ Удостоверения личности: ' + deal.side2.udv  +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата выдачи уд-ния личности: ' + deal.side2.issueddate  +'</h5>'
        deal_string = deal_string + '<h5>' + 'ИИН: ' + deal.side2.iin +'</h5>'
        deal_string = deal_string + '<h5>' + 'Адрес регистрации: ' + deal.side2.address +'</h5>'
        if(deal.side2.status=="Индивидуальный предприниматель"){
          deal_string = deal_string + '<h5>' + 'Наименование ИП: ' + deal.side2.nameip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Номер свидетельства о гос. регистрации ИП: ' + deal.side2.noregip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Дата гос. регистрации ИП: ' + dateFormat(deal.side2.dateregip) +'</h5>'
          deal_string = deal_string + '<h5>' + 'Адрес регистрации в качестве ИП: ' + deal.side2.addressregip +'</h5>'
        }

        deal_string = deal_string + '<h3 class="cust_weight">Условия сделки</h3>'

        deal_string = deal_string +  '<h5>' + 'Наименование имущества подлежащего передаче Стороной 1: ' +
        fieldEncryption.decrypt(deal.itemname1, SK)+'</h5>'
        deal_string = deal_string +  '<h5>' + 'Количество имущества, подлежащего передаче Стороной 1: '
        + fieldEncryption.decrypt(deal.quantity1, SK) +'</h5>'
        +'<h5>' + 'Стоимость имущества,  подлежащего передаче Стороной 1: ' + fieldEncryption.decrypt(deal.price1, SK) +'</h5>'
        deal_string = deal_string +  '<h5>' + 'Качество имущества подлежащего передаче Стороной 1: ' + fieldEncryption.decrypt(deal.quality1, SK)
        deal_string = deal_string +  '<h5>' + 'Характеристика имущества подлежащего передаче Стороной 1: ' + fieldEncryption.decrypt(deal.description1, SK)
        deal_string = deal_string +  '<h5>' + 'Cостояние имущества подлежащего передаче Стороной 1: ' + fieldEncryption.decrypt(deal.state1, SK)


        deal_string = deal_string +  '<h5>' + 'Наименование имущества подлежащего передаче Стороной 2: ' +
        fieldEncryption.decrypt(deal.itemname2, SK)+'</h5>'
        deal_string = deal_string +  '<h5>' + 'Количество имущества, подлежащего передаче Стороной 2: '
        + fieldEncryption.decrypt(deal.quantity2, SK) +'</h5>'
        +'<h5>' + 'Стоимость имущества,  подлежащего передаче Стороной 2: ' + fieldEncryption.decrypt(deal.price2, SK) +'</h5>'
        deal_string = deal_string +  '<h5>' + 'Качество имущества подлежащего передаче Стороной 2: ' + fieldEncryption.decrypt(deal.quality2, SK)
        deal_string = deal_string +  '<h5>' + 'Характеристика имущества подлежащего передаче Стороной 2: ' + fieldEncryption.decrypt(deal.description2, SK)
        deal_string = deal_string +  '<h5>' + 'Cостояние имущества подлежащего передаче Стороной 2: ' + fieldEncryption.decrypt(deal.state2, SK)

        deal_string = deal_string +  '<h5>' + 'Сроки и порядок обмена имуществом: ' + fieldEncryption.decrypt(deal.deadline, SK)


        deal_string = deal_string +  '<h5>' + 'Срок действия договора: ' + dateFormat(deal.duedate)
        // console.log(deal_string)
        if(deal.additional){
          deal_string = deal_string +  '<h5>' + 'Дополнительные условия: ' + fieldEncryption.decrypt(deal.additional, SK)+'</h5>'
        }
        createTimeLine(deal_id, deal_string, user_id)
      }
  })

}
function getDeal406(deal_id, user_id){
  Deal406.findOne({deal_id: deal_id}).populate('buyer seller').exec((err, deal) =>{
    if(err) console.log(err)
      if(deal){
        var deal_string =  '<h5 style="font-weight: 800 !important">' + 'Наименование договора: ' +'</h5><h5>' +  deal.deal_name +'</h5>'
        deal_string  = deal_string + '<h5 style="font-weight: 800 !important">' + 'Предмет договора:'+'</h5><h5>' + '  Продавец передает, а Покупатель обязуется принять товар (имущество), указанный в настоящем договоре, на условиях, предусмотренных настоящим договором.' + '</h5>'

        deal_string = deal_string + '<h3 class="cust_weight">Информация о сторонах</h3>'

        deal_string = deal_string + '<h5 style="font-weight: 800 !important">' + 'Покупатель: ' + deal.buyer.firstname +' '+deal.buyer.lastname +'</h5>'
        deal_string = deal_string + '<h5>' + 'Номер телефона: ' + deal.buyer.username +'</h5>'
        deal_string = deal_string + '<h5>' + 'Email: ' + deal.buyer.email +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата рождения: ' + deal.buyer.birthday  +'</h5>'
        deal_string = deal_string + '<h5>' + '№ Удостоверения личности: ' + deal.buyer.udv  +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата выдачи уд-ния личности: ' + deal.buyer.issueddate  +'</h5>'
        deal_string = deal_string + '<h5>' + 'ИИН: ' + deal.buyer.iin +'</h5>'
        deal_string = deal_string + '<h5>' + 'Адрес регистрации: ' + deal.buyer.address +'</h5>'
        if(deal.buyer.status=="Индивидуальный предприниматель"){
          deal_string = deal_string + '<h5>' + 'Наименование ИП: ' + deal.buyer.nameip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Номер свидетельства о гос. регистрации ИП: ' + deal.buyer.noregip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Дата гос. регистрации ИП: ' + dateFormat(deal.buyer.dateregip) +'</h5>'
          deal_string = deal_string + '<h5>' + 'Адрес регистрации в качестве ИП: ' + deal.buyer.addressregip +'</h5>'
        }


        deal_string = deal_string + '<h5 style="font-weight: 800 !important">'+'Продавец: ' + deal.seller.firstname +' '+deal.seller.lastname +'</h5>'
        deal_string = deal_string + '<h5>' + 'Номер телефона: ' + deal.seller.username +'</h5>'
        deal_string = deal_string + '<h5>' + 'Email: ' + deal.seller.email +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата рождения: ' + deal.seller.birthday  +'</h5>'
        deal_string = deal_string + '<h5>' + '№ Удостоверения личности: ' + deal.seller.udv  +'</h5>'
        deal_string = deal_string + '<h5>' + 'Дата выдачи уд-ния личности: ' + deal.seller.issueddate  +'</h5>'
        deal_string = deal_string + '<h5>' + 'ИИН: ' + deal.seller.iin +'</h5>'
        deal_string = deal_string + '<h5>' + 'Адрес регистрации: ' + deal.seller.address +'</h5>'
        if(deal.seller.status=="Индивидуальный предприниматель"){
          deal_string = deal_string + '<h5>' + 'Наименование ИП: ' + deal.seller.nameip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Номер свидетельства о гос. регистрации ИП: ' + deal.seller.noregip +'</h5>'
          deal_string = deal_string + '<h5>' + 'Дата гос. регистрации ИП: ' + dateFormat(deal.seller.dateregip) +'</h5>'
          deal_string = deal_string + '<h5>' + 'Адрес регистрации в качестве ИП: ' + deal.seller.addressregip +'</h5>'
        }

        deal_string = deal_string + '<h3 class="cust_weight">Условия сделки</h3>'

        deal_string = deal_string +  '<h5>' + 'Наименование (ассортимент) товара: ' +
        fieldEncryption.decrypt(deal.itemname, SK)+'</h5>'
        deal_string = deal_string +  '<h5>' + 'Количество товара: '
        + fieldEncryption.decrypt(deal.quantity, SK) +'</h5>'
        +'<h5>' + 'Цена товара, тенге: ' + fieldEncryption.decrypt(deal.price, SK) +'</h5>'
        deal_string = deal_string +  '<h5>' + 'Сроки и порядок оплаты товара: ' + fieldEncryption.decrypt(deal.payday, SK)
        deal_string = deal_string +  '<h5>' + 'Сроки и порядок передачи товара: ' + fieldEncryption.decrypt(deal.getbackday, SK)
        deal_string = deal_string +  '<h5>' + 'Качество товара: ' + fieldEncryption.decrypt(deal.quality, SK)
        deal_string = deal_string +  '<h5>' + 'Характеристика товара: ' +fieldEncryption.decrypt(deal.description, SK)+'</h5>'
        deal_string = deal_string +  '<h5>' + 'Cостояние товара (б/у или новое): ' + fieldEncryption.decrypt(deal.state, SK)+'</h5>'



        deal_string = deal_string +  '<h5>' + 'Срок действия договора: ' + dateFormat(deal.duedate)
        // console.log(deal_string)
        if(deal.expire){
          deal_string = deal_string +  '<h5>' + 'Срок годности товара/гарантии (если применимо): ' + fieldEncryption.decrypt(deal.expire, SK)+'</h5>'
        }
        if(deal.complexity){
          deal_string = deal_string +  '<h5>' + 'Комплектность товара (если применимо): ' + fieldEncryption.decrypt(deal.complexity, SK)+'</h5>'
        }
        if(deal.additional){
          deal_string = deal_string +  '<h5>' + 'Дополнительные условия: ' + fieldEncryption.decrypt(deal.additional, SK)+'</h5>'
        }
        createTimeLine(deal_id, deal_string, user_id)
      }
  })

}
router.post('/createpdf', function(req, res) {
  var token = req.headers.authorization.split(' ')[1];
  var decoded = jwtDecode(token);
  res.send({message: 'Справка отправлена вам на почту. Если вам ничего не пришло проверьте указали ли вы правильный email  в личном кабинете. Cпасибо что воспользовались сервисом LegCo.'})
  if(req.body.lawid == '865'){
    getDeal865(req.body.dealid, decoded.sub)
  }
  if(req.body.lawid=='768'){
    //хранение
    getDeal768(req.body.dealid, decoded.sub)

  }
  if(req.body.lawid=='688'){
    //перевокза
    getDeal688(req.body.dealid, decoded.sub)
  }
  if(req.body.lawid=='616'){
    //подряда
    getDeal616(req.body.dealid, decoded.sub)
  }
  if(req.body.lawid=='506'){
    //подряда
    getDeal506(req.body.dealid, decoded.sub)
  }
  if(req.body.lawid=='715'){
    //подряда
    getDeal715(req.body.dealid, decoded.sub)
  }
  if(req.body.lawid=='683'){
    //подряда
    getDeal683(req.body.dealid, decoded.sub)
  }
  if(req.body.lawid=='604'){
    //подряда
    getDeal604(req.body.dealid, decoded.sub)
  }
  if(req.body.lawid=='540'){
    //подряда
    getDeal540(req.body.dealid, decoded.sub)
  }
  if(req.body.lawid=='846'){
    //подряда
    getDeal846(req.body.dealid, decoded.sub)
  }
  if(req.body.lawid=='501'){
    //подряда
    getDeal501(req.body.dealid, decoded.sub)
  }
  if(req.body.lawid=='406'){
    //подряда
    getDeal406(req.body.dealid, decoded.sub)
  }
})




module.exports = router;
