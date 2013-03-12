// vim: set autoindent: 

// Copyright (C) 2013 Viljo Viitanen
// 
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

var channels
var programs=[]
var currentday

$.ajaxSetup({
   timeout: 10000,
   complete: function() {
      $("#spinner").hide()
   },
});

$(document).ready(function () {
  $.cookie.json = true;
  if (!$.cookie('login')) {
    $('#pass').val('')
    $('.notlogged').show()
  }
  else {
    $('.logged').show()
    showday()
  }
});

function addzero(a) {
  if (a<10) return "0"+a
  else return a
}

function dayofweek(day) {
  switch(day%7) {
  case 0: return "Su"
  case 1: return "Ma"
  case 2: return "Ti"
  case 3: return "Ke"
  case 4: return "To"
  case 5: return "Pe"
  case 6: return "La"
  }
}

function showday(day) {
  if (!day) {
    day="0"
  }
  currentday=day
  $('#datemenu').html(datemenu())
  if (!channels) {
    $("#spinner").show()
    $.getJSON('/channels',function(resp) {
      if(!resp.channels) {
        alert("Ei onnistuttu hakemaan kanavalistausta")
	return
      }
      channels=resp.channels
      showday()
    })
    return
  }
  var nchannels=channels.length
  var html='<table>'
  for(var i=0; i<7; i++) {
    html+='<tr class="myhead">'
    for(var j=0; j<nchannels; j++) {
      if (i == 0) hide=""
      else hide="hide "
      if (i%3 == 0) html+='<td class="'+hide+'+row'+i+' tv chtitle chtitle'+j+'">'+channels[j].name+'</td>'
    }
    html+='</tr><tr class="'+hide+'row'+i+'">'
    for(var j=0; j<nchannels; j++) {
      html+='<td class="tv" id="slot'+day+'_'+j+'_'+i+'" onclick="showslot(this)"></td>'
    }
    html+='</tr>'
  }
  html+='</table>'
  $('#table').html(html)
  
  today=new Date()
  if (day==0) {
    display="Tänään"
  }
  else {
    d=new Date(today.getTime()-day*86400000)
    display=dayofweek(d.getDay())+' '+d.getDate()+'.'+(1+d.getMonth())+'.'
  }
  $('#date').html(display)
  for(var j=0; j<nchannels; j++) {
    showprograms(j,day)
  }
}



function showprograms(channel,day) {
  if (!programs[day]) programs[day]=[]

  if (!programs[day][channel]) {
    today=new Date()
    if (day==0) {
      date="today"
    }
    else {
      d=new Date(today.getTime()-day*86400000)
      date=d.getFullYear()+'/'+addzero(1+d.getMonth())+'/'+addzero(d.getDate())
    }
    $("#slot"+day+"_"+channel+"_0").html("Haetaan...<br><br><br><br>")
    $("#slot"+day+"_"+channel+"_0").addClass("loading")
    $('#slot'+day+'_'+channel+'_0').data("state","fetching")
    $.ajax({
      dataType: "json",
      url: '/programs',
      data: {'day':date, 'channel':channels[channel].id},
      success: function(resp) {
        $("#slot"+day+"_"+channel+"_0").removeClass("loading")
        if(!resp.day) {
          $("#slot"+day+"_"+channel+"_0").html("Ohjelmatietojen haku epäonnistui. Hae uudelleen painamalla tästä.")
	  return
        }
        programs[day][channel]=resp.day
        showprograms(channel,day)
      },
      error: function(jq,text,error) {
        $("#slot"+day+"_"+channel+"_0").removeClass("loading")
        $("#slot"+day+"_"+channel+"_0").html("Ohjelmatietojen haku epäonnistui. Hae uudelleen painamalla tästä.")
        $('#slot'+day+'_'+channel+'_0').data("state","error")
        $('#slot'+day+'_'+channel+'_0').data("channel",channel)
        $('#slot'+day+'_'+channel+'_0').data("day",day)
      },

      })
    return
  }
  today=new Date;
  todaydate=today.getDate()
  var s=[]
  var d=[]
  for(i=0; i<7; i++) {
    s[i]=''
    d[i]=''
  }
  programs[day][channel].forEach(function(e) {
    stamp=new Date(e.time)
    //note: json api returns timestamp in finnish time. this is so this app never needs to deal with DST or timezones
    hour=stamp.getUTCHours()
    progdate=stamp.getUTCDate()
    if (day==0 && progdate != todaydate) return
    switch(hour) {
    case 5:
    case 6:
    case 7:
    case 8:
      slot=1
	break
    case 9:
    case 10:
    case 11:
      slot=2
	break
    case 12:
    case 13:
    case 14:
      slot=3
	break
    case 15:
    case 16:
    case 17:
      slot=4
	break
    case 18:
    case 19:
    case 20:
      slot=5
	break
    case 21:
    case 22:
    case 23:
      slot=6
	break
    default:
      slot=0
	break
    }
    s[slot]=s[slot]+addzero(hour)+'.'+addzero(stamp.getMinutes())+' '+e.title+'<br>'
    d[slot]=d[slot]+'<td class="program" onclick="play(\''+e.purl+'?username='+encodeURIComponent($.cookie('login').user)+'&password='+encodeURIComponent($.cookie('login').pass)+'\')">'+addzero(hour)+'.'+addzero(stamp.getMinutes())+' '+e.title+' '+e.desc+'</td>'
  })
  for(i=0; i<7; i++) {
    if(s[i] != '') $('.row'+i).show()
    $('#slot'+day+'_'+channel+'_'+i).html(s[i])
    $('#slot'+day+'_'+channel+'_'+i).data("x",d[i])
    $('#slot'+day+'_'+channel+'_'+i).data("state","ready")
  }
}

function play(url) {
  w=window.open()
  w.document.write('<style>body {background: #000} video { position: fixed; top: 0; left: 0; height: 100%; width: 100%; }</style>')
  w.document.write('<video autoplay controls src="'+url+'"></video>')
}

function showslot(e) {
  if ($(e).data("state")=="error") {
    showprograms($(e).data("channel"),$(e).data("day"))
  }
  else if ($(e).data("state")=="ready") {
    $('#popupcontent').html($(e).data("x"))
    $('#popup').modal()
  }
}

function login() {
  var exp=null
  if ($('#remember').is(':checked')) {
    exp=14
  }
  $('#loginbutton').attr("disabled", true);
  $("#spinner").show()
  $.post('/login',{ u: $('#user').val(), p: $('#pass').val() },function(resp) {
    $('#loginbutton').attr("disabled", false);
    if (resp.login != 'ok') {
      alert("Kirjautuminen epäonnistui, tarkista käyttäjätunnus ja salasana")
    }
    else {
  $.cookie.json = true;
      $.cookie('login',{ user: $('#user').val(), pass: $('#pass').val() } ,{ expires: exp, path: '/' })
      $('.notlogged').hide()
      $('.logged').show()
      showday()
    }
  })
  return false;
}
function logout() {
  $.removeCookie('login', { path: '/' });
  $('#pass').val('')
  $('.notlogged').show()
  $('.logged').hide()
}

//outputs the calendar, today+4 weeks behind. "interesting" code.
function datemenu() {
  today=new Date()
  //to test other days...
  //today=new Date(today.getTime()-1*86400000)
  todaydate=today.getDate()
  todayday=today.getDay()
  offset=6-todayday
  //convert to monday first
  offset++
  offset%=7
  t=[]
  for (var i=0; i<29; i++) {
    day=new Date(today.getTime()-i*86400000)
    if (today.getTime()-day.getTime() < 29*86400000)
      insert=day.getDate()
    if (i==currentday) c="btn-inverse "
    else if (i==0) c="btn-info "
    else c=""
    t[i]='<td class="'+c+'datepicker" onclick="showday('+i+')">'+insert+'</td>'
  }
  html='<table><tr>'
  for (var i=1; i<8; i++) {
    html+='<th>'+dayofweek(i)+'</th>'
  }
  html+='</tr>'
  for (var w=4; w>=0; w--) {
    html+='<tr>'
    for (var d=6; d>=0; d--) {
      insert=t[w*7+d-offset]
      if (!insert) insert='<td></td>'
      html+=insert
    }
    html+='</tr>'
  }
  html+='</table>'

  return html
}
