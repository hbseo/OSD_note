$.getScript('http://arshaw.com/js/fullcalendar-1.6.4/fullcalendar/fullcalendar.min.js',function(){
  
  var date = new Date();
  var d = date.getDate();
  var m = date.getMonth();
  var y = date.getFullYear();
  
  $('#calendar').fullCalendar({
    header: {
      left: '',
      center: 'title',
      right: 'today prev,next'
    },
    editable: true,
    titleFormat: {
    month: "yyyy년 MMMM",
    week: "[yyyy] MMM dd일{ [yyyy] MMM dd일}",
    day: "yyyy년 MMM d일 dddd"
    },
    allDayDefault: false,
    defaultView: "month",
    editable: false,
    monthNames: ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],
    monthNamesShort: ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],
    dayNames: ["일요일","월요일","화요일","수요일","목요일","금요일","토요일"],
    dayNamesShort: ["일","월","화","수","목","금","토"],
    buttonText: {
    today : "오늘",
    month : "월별",
    week : "주별",
    day : "일별",
    },
    // events : eventData,
    timeFormat : "HH:mm",
  });
})