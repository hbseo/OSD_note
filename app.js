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

DateTimeFormat = function() {
    var date = new Date();
    var year = date.getFullYear();
    var month = (1+date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    var options = {
        year: undefined,
        month: undefined,
        day: undefined,
        hour: "2-digit",
        minute: "2-digit"
    };
    var time = date.toLocaleDateString('ko-KR', options);
    var ttime = time.split(",");
    ttime = ttime[1]
    return year + '년 ' + month + '월 ' + day + '일 ' + ttime;
}

var MemoSchema = new Schema({
    title     : String,
    body      : String,
    date      : {type: String, default:DateTimeFormat},
    update : {type:Date, default:Date.now}
});

MemoSchema.plugin(autoIncrement.plugin, 'Memo');
var Memo = mongoose.model('Memo', MemoSchema);


app.set('view engine', 'pug');
app.set('views', 'view');

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.render('main');
})

app.get('/note', (req, res) => {
    Memo.find({}).sort({update:-1}).exec((err, memos) => {
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

app.get('/map', (req,res) => {
    res.render('map');
})

app.post('/new', (req, res) => {
    var newMemo = new Memo();
    newMemo.title = req.body.title;
    newMemo.body = req.body.body;
    newMemo.save((err) => {
      if(err) console.log(err);
      res.redirect('/note');
    });
});

app.get('/:id/delete', (req,res) => {
    Memo.remove({'_id': req.params.id}, (err, output) => {
        res.redirect('/note');
    });
})

app.get('/memo/:id', (req, res) => {
    Memo.findById(req.params.id, (err, memo) => {
        res.render('memo', {memo:memo});
    });
});

app.post('/memo/:id', (req, res) => {
    Memo.findById(req.params.id, (err, doc) => {
        doc.title = req.body.title;
        doc.body = req.body.body;
        doc.date = DateTimeFormat();
        doc.update = Date.now();
        doc.save((err,doc) => {
            if (err) console.log(err);
            res.redirect('/note');
        })
    })
})

app.get('/search', (req, res) => {
    var search_word = req.param('searchWord');
    var searchCondition = {$regex:search_word};

    Memo.find({$or:[{title:searchCondition},
     {body:searchCondition}]}).sort({date:-1}).exec((err, searchContents) => {
        if (err) throw err;
        res.render('note', {memos:searchContents});
    });
});

var client_id = 'YyZEQZQJuNwH9mdyaNm5';
var client_secret = '8AcehL8A_6';

app.post('/translate', function (req, res) {
    var api_url = 'https://openapi.naver.com/v1/language/translate';
    var query = req.body.title;
    var options = {
       url: api_url,
       form: {'source':'ko', 'target':'en', 'text':query},
       headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    };
   request.post(options, function (error, response, body) {
     if (!error && response.statusCode == 200) {
         var json     = JSON.parse(body);
         var tmp = json.message.result.translatedText;
         if (!error)
            res.render('translator', {korean: query, result:tmp});
     } else {
       res.status(response.statusCode).end();
       console.log('error = ' + response.statusCode);
     }
    });
//    res.render('translator', {result:translatedText})
});


app.get('/translator', (req, res) => {
    res.render('translator');
})

app.get('/weather', (req, res) => {
    var nx = 58;
    var ny = 121;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();
    var hours = today.getHours();
    var minutes = today.getMinutes();
    // console.log("time " + minutes)

    if(minutes < 30){
        // 30분보다 작으면 한시간 전 값
        hours = hours - 1;
        if(hours < 0){
            // 자정 이전은 전날로 계산
            today.setDate(today.getDate() - 1);
            dd = today.getDate();
            mm = today.getMonth()+1;
            yyyy = today.getFullYear();
            hours = 23;
        }
    }
    if(hours<10) {
        hours='0'+hours
    }
    if(mm<10) {
        mm='0'+mm
    }
    if(dd<10) {
        dd='0'+dd
    } 

    var _nx = nx,
    _ny = ny,
    apikey = "j12Xuf3%2FAyrU0Ym3clwoyXGQ5XxK3s5zHhU34499Gq2HiqJTRopLrh8Sh4mIj48%2BQqozklt4NENLJfk4ydYlWA%3D%3D",
    today = yyyy+""+mm+""+dd,
    basetime = hours + "00",
    fileName = "http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastGrib";
    fileName += "?ServiceKey=" + apikey;
    fileName += "&base_date=" + today;
    fileName += "&base_time=" + basetime;
    fileName += "&nx=" + _nx + "&ny=" + _ny;
    fileName += "&pageNo=1&numOfRows=6";
    fileName += "&_type=json";

    // http_get(fileName, {}, function(resData) {
    //     var Obj = JSON.parse(resData);
    //     console.log(resData);
    // })

    request(fileName, function(error, response, html){

        if(!error){
            var json     = JSON.parse(response.body);
            var weather  = json.response.body.items.item;
            var rainsnow = weather[1].obsrValue;
            var sky      = weather[4].obsrValue;
            var temp = weather[5].obsrValue + '℃';

            res.render('weather', {sky: sky, temp: temp, rainsnow: rainsnow});
        }
    })
});

app.get('/calculator', (req, res) => {
    res.render('calculator');
})

app.get('/game', (req, res) => {
    res.render('game');
})

app.get('/test', (req, res) => {
    res.render('test');
})



app.listen('3000', () => {
    console.log("Express is Connected 3000 Port!");
});

