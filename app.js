var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var autoIncrement = require("mongoose-auto-increment");
var request = require('request');
var cheerio = require('cheerio')
var app = express();



mongoose.connect('mongodb://alchon:anjfqhk123@ds157740.mlab.com:57740/osd_note');

var connection = mongoose.connection;

autoIncrement.initialize(connection)

var Schema = mongoose.Schema;

var MemoSchema = new Schema({
    title     : String,
    body      : String,
    date      : {type: Date, default:Date.now}
});

MemoSchema.plugin(autoIncrement.plugin, 'Memo');
var Memo = mongoose.model('Memo', MemoSchema);


app.set('view engine', 'pug');
app.set('views', 'view');

app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.render('main');
})

app.get('/note', (req, res) => {
    Memo.find((err, memos) => {
        res.render('note', {memos: memos});
    });
})

app.get('/new', (req, res) => {
    res.render('new');
})

app.get('/calendar', (req, res) => {
    res.render('calendar');
})

app.get('/main', (req, res) => {
    res.render('main');
})

app.get('/schedule', (req, res) => {
    res.render('schedule');
})

app.get('/weather', (req, res) => {
    var url = 'https://www.accuweather.com/ko/kr/ansan/223641/weather-forecast/223641'
    request(url, function(err, res, html) {  
        if(!err) {
            var $ = cheerio.load(html);

            

            var data = $('.night current first cl').children().children('.info').children('.temp');
            var temp = $(data).find('.large-temp').text();
            var realfeel = $(data).find('.realfeel').text();
            var cond = $(data).find('.cond').text();
            console.log(temp)
            console.log(realfeel)
            console.log(cond)
            console.log("asdfasdfasdf")
        }
    });
    res.render('weather');
})

var feed       = document.getElementById('feed-tabs')
var ul         = feed.getElementsByTagName('ul')[0];
var li         = ul.getElementsByTagName('li')[0];
var large_temp = li.getElementsByClassName('large-temp')[0];
var temp_label = li.getElementsByClassName('temp-label')[0];
var realfeel   = li.getElementsByClassName('realfeel')[0];
var cond       = li.getElementsByClassName('cond')[0];

app.post('/new', (req, res) => {
    var newMemo = new Memo();
    newMemo.title = req.body.title;
    newMemo.body = req.body.body;
    newMemo.save((err) => {
      if(err) console.log(err);
      res.redirect('/note');
    });
});



app.get('/memo/:id', (req, res) => {

    Memo.findById(req.params.id, (err, memo) => {
        res.render('memo', {memo:memo});
    });
});

app.listen('3000', () => {
    console.log("Express is Connected 3000 Port!");
});
