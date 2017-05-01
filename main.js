var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var autoIncrement = require("mongoose-auto-increment");
var request = require('request');
var cheerio = require('cheerio')
var noteapp = express();


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


noteapp.set('view engine', 'pug');
noteapp.set('views', 'view');

noteapp.use(bodyParser.urlencoded({ extended: true }))
noteapp.use(express.static('public'));
noteapp.get('/', (req, res) => {
    res.render('main');
})

noteapp.get('/note', (req, res) => {
    Memo.find({}).sort({update:-1}).exec((err, memos) => {
        res.render('note', {memos: memos});
    });
})


noteapp.get('/new', (req, res) => {
    res.render('new');
})

noteapp.get('/calendar', (req, res) => {
    res.render('calendar');
})

noteapp.get('/main', (req, res) => {
    res.render('main');
})

noteapp.get('/schedule', (req, res) => {
    res.render('schedule');
})

noteapp.get('/map', (req,res) => {
    res.render('map');
})

noteapp.post('/new', (req, res) => {
    var newMemo = new Memo();
    newMemo.title = req.body.title;
    newMemo.body = req.body.body;
    newMemo.save((err) => {
      if(err) console.log(err);
      res.redirect('/note');
    });
});

noteapp.get('/:id/delete', (req,res) => {
    Memo.remove({'_id': req.params.id}, (err, output) => {
        res.redirect('/note');
    });
})

noteapp.get('/memo/:id', (req, res) => {
    Memo.findById(req.params.id, (err, memo) => {
        res.render('memo', {memo:memo});
    });
});

noteapp.post('/memo/:id', (req, res) => {
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

noteapp.get('/search', (req, res) => {
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

noteapp.post('/translate', function (req, res) {
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


noteapp.get('/translator', (req, res) => {
    res.render('translator');
})

noteapp.get('/weather', (req, res) => {
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

noteapp.get('/calculator', (req, res) => {
    res.render('calculator');
})

noteapp.get('/game', (req, res) => {
    res.render('game');
})

noteapp.get('/test', (req, res) => {
    res.render('test');
})



noteapp.listen('3000', () => {
    console.log("Express is Connected 3000 Port!");
});



const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

// 윈도우 객체를 전역에 유지합니다. 만약 이렇게 하지 않으면
// 자바스크립트 GC가 일어날 때 창이 멋대로 닫혀버립니다.
let win

function createWindow () {
  // 새로운 브라우저 창을 생성합니다.
  win = new BrowserWindow({width: 1200, height: 800})

  // 그리고 현재 디렉터리의 index.html을 로드합니다.
  win.loadURL(url.format({
    pathname: 'localhost:3000',
    protocol: 'http:',
    slashes: true
  }))

  // 개발자 도구를 엽니다.
//   win.webContents.openDevTools()

  // 창이 닫히면 호출됩니다.
  win.on('closed', () => {
    // 윈도우 객체의 참조를 삭제합니다. 보통 멀티 윈도우 지원을 위해
    // 윈도우 객체를 배열에 저장하는 경우가 있는데 이 경우
    // 해당하는 모든 윈도우 객체의 참조를 삭제해 주어야 합니다.
    win = null
  })
}

// 이 메서드는 Electron의 초기화가 끝나면 실행되며 브라우저
// 윈도우를 생성할 수 있습니다. 몇몇 API는 이 이벤트 이후에만
// 사용할 수 있습니다.
app.on('ready', createWindow)

// 모든 창이 닫히면 애플리케이션 종료.
app.on('window-all-closed', () => {
  // macOS의 대부분의 애플리케이션은 유저가 Cmd + Q 커맨드로 확실하게
  // 종료하기 전까지 메뉴바에 남아 계속 실행됩니다.
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // macOS에선 보통 독 아이콘이 클릭되고 나서도
  // 열린 윈도우가 없으면, 새로운 윈도우를 다시 만듭니다.
  if (win === null) {
    createWindow()
  }
})

// 이 파일엔 제작할 애플리케이션에 특화된 메인 프로세스 코드를
// 포함할 수 있습니다. 또한 파일을 분리하여 require하는 방법으로
// 코드를 작성할 수도 있습니다.