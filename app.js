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



app.listen('3000', () => {
    console.log("Express is Connected 3000 Port!");
});