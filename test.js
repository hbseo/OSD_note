var request = require('request')
var cheerio = require('cheerio')

var url = "https://www.accuweather.com/ko/kr/ansan/223641/weather-forecast/223641"

request(url, (err,res,body) => {
    if (!err) {
        var $ = cheerio.load(body)
        var data = $("li.current")
    }
})