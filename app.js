var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var autoIncrement = require("mongoose-auto-increment");
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
});

app.get('/note', (req, res) => {
    Memo.find((err, memos) => {
        res.render('note', {memos: memos});
    });
});

app.get('/new', (req, res) => {
    res.render('new');
});

app.post('/new', (req, res) => {
    var newMemo = new Memo();
    newMemo.title = req.body.title;
    newMemo.body = req.body.body;
    newMemo.save((err) => {
      if(err) console.log(err);
      res.redirect('/note');
    });
});

app.get('/:id', (req, res) => {
    Memo.findById(req.params.id, (err, memo) => {
        res.render('memo', {memo:memo});
    });
});

app.listen('3000', () => {
    console.log("Express is Connected 3000 Port!");
});
