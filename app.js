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

// var feed       = document.getElementById('feed-tabs')
// var ul         = feed.getElementsByTagName('ul')[0];
// var li         = ul.getElementsByTagName('li')[0];
// var large_temp = li.getElementsByClassName('large-temp')[0];
// var temp_label = li.getElementsByClassName('temp-label')[0];
// var realfeel   = li.getElementsByClassName('realfeel')[0];
// var cond       = li.getElementsByClassName('cond')[0];

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

const {eapp, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

// 윈도우 객체를 전역에 유지합니다. 만약 이렇게 하지 않으면
// 자바스크립트 GC가 일어날 때 창이 멋대로 닫혀버립니다.
let win

function createWindow () {
  // 새로운 브라우저 창을 생성합니다.
  win = new BrowserWindow({width: 800, height: 600})

  // 그리고 현재 디렉터리의 index.html을 로드합니다.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // 개발자 도구를 엽니다.
  win.webContents.openDevTools()

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
eapp.on('ready', createWindow)

// 모든 창이 닫히면 애플리케이션 종료.
eapp.on('window-all-closed', () => {
  // macOS의 대부분의 애플리케이션은 유저가 Cmd + Q 커맨드로 확실하게
  // 종료하기 전까지 메뉴바에 남아 계속 실행됩니다.
  if (process.platform !== 'darwin') {
    eapp.quit()
  }
})

eapp.on('activate', () => {
  // macOS에선 보통 독 아이콘이 클릭되고 나서도
  // 열린 윈도우가 없으면, 새로운 윈도우를 다시 만듭니다.
  if (win === null) {
    createWindow()
  }
})

// 이 파일엔 제작할 애플리케이션에 특화된 메인 프로세스 코드를
// 포함할 수 있습니다. 또한 파일을 분리하여 require하는 방법으로
// 코드를 작성할 수도 있습니다.