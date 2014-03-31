// vim: set autoindent: 

// Copyright (C) 2013-2014 Viljo Viitanen
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

var realchannels
var hidechannels
var channels
var programs=[]
var currentday
var quality
var scrolling=0
var token

$.ajaxSetup({
   timeout: 10000,
   complete: function() {
      $("#spinner").hide()
   },
});

function scrollon() {
  scrolling++
}
function scrolloff() {
  setTimeout(function() { scrolling-- },500)
}
$(document).ready(function () {
  //otherwise IE10 on a windows 8 tablet registers taphold even when scrolling
  $("#popupcontent").scrollstart(scrollon)
  $("#popupcontent").scrollstop(scrolloff)
  $(window).scrollstart(scrollon)
  $(window).scrollstop(scrolloff)

  if ($.cookie('quality')!="mp4" && $.cookie('quality')!="mpeg4") {
    quality="h264"
  }
  else if ($.cookie('quality')!="mpeg4") {
    quality="mp4"
  }
  else {
    quality="mpeg4"
  }
  $.cookie.json = true;
  random=Math.random()
  //CSRF preventation token
  $.cookie('token', random)
  hidechannels=$.cookie('hide')
  if(!hidechannels) hidechannels={}
  if (!$.cookie('login')) {
    $('#pass').val('')
    $('.notlogged').show()
  }
  else {
    $('.logged').show()
    init()
    // detect hash changes via back/forward
    window.onhashchange=init;
  }
});

//handle url fragment. First ! is the separator between command and parameter.
function init() {
  showquality()
  $('#datemenu').html(datemenu())
  if (location.hash=="" || location.hash=="#") { //chrome: hash # -> "", IE: hash # -> "#"
    showday()
    return
  }
  sep=location.hash.indexOf('!')
  if (sep==-1) {
    command=location.hash.substr(1)
    param=''
  }
  else {
    command=location.hash.substr(1,sep-1)
    param=location.hash.substr(sep+1)
  }
  if (command=="day") {
    showday(param)
  }
  else {
    getresult(command, (param==''?null:{'search':decodeURIComponent(param)}))
  }
}

function escapehtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

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
  $('#table').html('')
  if (!day || day==0) {
    day="0"
    location.hash=''
  }
  else {
    location.hash='day!'+day
  }
  currentday=day
  $('#datemenu').html(datemenu())
  if (!realchannels) {
    $("#spinner").show()
    $.getJSON('/channels',function(resp) {
      if(!resp.channels) {
        alert("Ei onnistuttu hakemaan kanavalistausta")
	return
      }
      realchannels=resp.channels
      showday(day)
    })
    return
  }
  channels=channelmap()
  channelsettings()
  
  var nchannels=channels.length
  var html='<table>'
  for(var i=0; i<8; i++) {
    html+='<tr class="myhead">'
    for(var j=0; j<nchannels; j++) {
      if (i == 0) hide=""
      else hide="hide "
      if (i == 0 || i == 4) html+='<td class="'+hide+'row'+i+' tv chtitle chtitle'+j+'">'+channels[j].name+'</td>'
     }
    html+='</tr><tr class="'+hide+'row'+i+'">'
    for(var j=0; j<nchannels; j++) {
      html+='<td class="tv" id="slot'+day+'_'+channels[j].id+'_'+i+'" onclick="showslot(this)"></td>'
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
    showprograms(channels[j].id,day)
  }
}


// also uses the global variable quality
function showprograms(channel,day) {
  if (!programs[day]) programs[day]=[]

  if (!programs[day][channel+quality]) {
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
      data: {'day':date, 'channel':channel},
      success: function(resp) {
        $("#slot"+day+"_"+channel+"_0").removeClass("loading")
        if(!resp.result) {
          $("#slot"+day+"_"+channel+"_0").html('<span class="text-info">Ohjelmatietojen haku epäonnistui. Hae uudelleen painamalla tästä.</span>')
	  return
        }
        programs[day][channel+quality]=resp.result
        showprograms(channel,day)
      },
      error: function(jq,text,error) {
        $("#slot"+day+"_"+channel+"_0").removeClass("loading")
        $("#slot"+day+"_"+channel+"_0").html('<span class="text-info">Ohjelmatietojen haku epäonnistui. Hae uudelleen painamalla tästä.</span>')
        $('#slot'+day+'_'+channel+'_0').data("state","error")
        $('#slot'+day+'_'+channel+'_0').data("channel",channel)
        $('#slot'+day+'_'+channel+'_0').data("day",day)
      },

      })
    return
  }
  t=new Date;
  today=new Date(t.getTime()+2*3600000) //approx.finnish time. don't care if it's an hour wrong.
  todaydate=today.getUTCDate()
  todayhour=today.getUTCHours()
  if (todayhour<4) earlymorning=1
  else earlymorning=0
  todayminute=today.getMinutes()
  
  var s=[]
  var d=[]
  for(i=0; i<8; i++) {
    s[i]=''
    d[i]=''
  }
  programs[day][channel+quality].forEach(function(e) {
    stamp=new Date(e.time)
    //note: json api returns timestamp in finnish time. this is so this app never needs to deal with DST or timezones
    hour=stamp.getUTCHours()
    progdate=stamp.getUTCDate()
    // hide yesterday's programs if showing "today" unless it's before 3am
    if (day==0) {
      if (!earlymorning && progdate != todaydate ) return
      if (earlymorning && progdate == todaydate ) hour+=24
    }
    switch(hour) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
      slot=0
	break
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
      slot=7
	break
    }
    if (day==0 && earlymorning && progdate == todaydate ) hour-=24
    
    s[slot]=s[slot]+addzero(hour)+'.'+addzero(stamp.getMinutes())+' '+e.title+'<br>'
    title=addzero(hour)+'.'+addzero(stamp.getMinutes())+' '+escapehtml(e.title)
    d[slot]=d[slot]+'<td class="program" data-title="'+title+'" data-id="'+e.id+'" data-url="'+e.purl+'"><b>'+title+'</b><br>'+escapehtml(e.desc)+'</td>'
  })
  for(i=0; i<8; i++) {
    if(s[i] != '') $('.row'+i).show()
    $('#slot'+day+'_'+channel+'_'+i).html(s[i])
    $('#slot'+day+'_'+channel+'_'+i).data("x",d[i])
    $('#slot'+day+'_'+channel+'_'+i).data("state","ready")
  }
}

function menuclick(e,operation,t)
{
  $(e).button('loading')
  $.ajax({
      dataType: "json",
      url: '/menu',
      type: 'POST',
      context: e,
      data: { op: operation, id: $(e).data("id"), token: random }, // CSRF preventation token. This is the only call that has any side effects on the server.
      success: function(resp) {
        html=$(this).html()
        if(resp.result != 'ok') {
          $(this).html(html+' Epäonnistui!')
          $(this).addClass('btn-danger')
	  return
        }
        $(this).html(html+' ok')
        $(this).addClass('btn-success')
      },
      error: function() {
        $(this).button('reset')
        html=$(this).html()
        $(this).html(html+' - yritä uudelleen')
        $(this).addClass('btn-info')
      },
  })
}

function holdmenu() {
  if (scrolling) {
    return
  }
  $(this).off('click')
  $(this).off('taphold')
  html=''
  if (location.hash=='#playlist') {
    html+='<button type="button" data-loading-text="Poistetaan listalta..." data-id="'+$(this).data("id")+'" onclick="menuclick(this,1)" class="btn">Poista katselulistalta</button> '
  }
  else {
    html+='<button type="button" data-loading-text="Lisätään listalle..." data-id="'+$(this).data("id")+'" onclick="menuclick(this,2)" class="btn">Lisää katselulistaan</button> '
  }
  if (location.hash=='#seasonpasses') {
    html+='<button type="button" data-loading-text="Poistetaan sarjoista..." data-id="'+$(this).data("seasonpass")+'" onclick="menuclick(this,3)" class="btn">Poista sarjoista</button> '
  }
  else {
    html+='<button type="button" data-loading-text="Lisätään sarjoihin..." data-id="'+$(this).data("id")+'" onclick="menuclick(this,4,'+"'"+$(this).data("title")+"'"+')" class="btn">Lisää sarjoihin</button> '
  }
  html+='<button type="button" data-url="'+$(this).data("url")+'" class="btn play">Toista</button><br>'
  cred='?username='+encodeURIComponent($.cookie('login').user)+'&password='+encodeURIComponent($.cookie('login').pass)
  html+='<a href="'+$(this).data("url")+cred+'" download><button type="button" class="btn play">Lataa</button></a><br>'
  html+=$(this).html()
  $(this).html(html)
  $('.play').click(playvideo)
}

function playvideo() {
  url=$(this).data("url")
  if (url.indexOf("PUUTTUU") != -1) {
    alert("Ohjelman videomuunnos puuttuu")
    return
  }
  url+='?username='+encodeURIComponent($.cookie('login').user)+'&password='+encodeURIComponent($.cookie('login').pass)
  w=window.open()
  w.document.write('<style>body {background: #000} video { position: fixed; top: 0; left: 0; height: 100%; width: 100%; }</style>')
  w.document.write('<video autoplay controls onclick="this.webkitEnterFullscreen()" src="'+url+'"></video>')
}

function showslot(e) {
  if ($(e).data("state")=="error") {
    showprograms($(e).data("channel"),$(e).data("day"))
  }
  else if ($(e).data("state")=="ready") {
    $('#popupcontent').html('<table><tr>'+$(e).data("x")+'</tr></table>')
    $('#popup').modal()
    $('.program').click(playvideo)
    $('.program').taphold(holdmenu)
  }
}

function login() {
  var exp=null
  if ($('#remember').is(':checked')) {
    exp=14
  }
  $('#loginbutton').attr("disabled", true);
  $("#spinner").show()
  $.ajax({
    dataType: 'json',
    url: '/login',
    type: 'POST',
    data: { u: $('#user').val(), p: $('#pass').val() },
    error: function(resp) {
      $('#loginbutton').attr("disabled", false);
      alert("Kirjautuminen epäonnistui.")
    },
    success: function(resp) {
      $('#loginbutton').attr("disabled", false);
      if (resp.login != 'ok') {
        if (resp.login != '') {
          alert("Kirjautuminen epäonnistui: "+resp.login)
        }
        else {
          alert("Kirjautuminen epäonnistui tuntemattomasta syystä")
        }
      }
      else {
      $.cookie.json = true;
        $.cookie('login',{ user: $('#user').val(), pass: $('#pass').val() } ,{ expires: exp, path: '/' })
        $('.notlogged').hide()
        $('.logged').show()
        // detect hash changes via back/forward
        window.onhashchange=init;
        init()
      }
    },
  })
  return false;
}
function logout() {
  window.onhashchange=false;
  location.hash=''
  $.removeCookie('login', { path: '/' });
  $('#pass').val('')
  $('.notlogged').show()
  $('.logged').hide()
  programs=[]
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

function search(form) {
  if (form.searchfield.value=='') return false
  getresult('search',{'search':form.searchfield.value})
  return false
}

function getresult(url,param) {
  $("#table").html('')
  location.hash=url+(param?(param.search?'!'+encodeURIComponent(param.search):''):'')
  if (url=='seasonpasses') {
    $("#spinner").show()
    $.ajax({
      dataType: "json",
      url: '/listseasonpasses',
      success: function(resp) {
        if(!resp.seasonpasses) {
          $("#table").html('<span class="text-error">Suosikkisarjojen haku epäonnistui.</span>')
	  return
        }
        resp.seasonpasses.forEach(function(e) {
          doresult('seasonpasses',{'id': e.id}, e.id)
        })
      },
      error: function(jq,text,error) {
        $("#table").html('<span class="text-error">Suosikkisarjojen haku epäonnistui.</span>')
      },
    })
  }
  else {
    doresult(url,param,1)
  }
}

function doresult(url,param,id) {
  $("#table").append('<div id="'+id+'"></div>')
  $("#"+id).html("Haetaan...<br><br><br><br>")
  $("#"+id).addClass("loading")
  $.ajax({
      dataType: "json",
      url: '/'+url,
      data: param,
      success: function(resp) {
        $("#"+id).removeClass("loading")
        if(!resp.result) {
          $("#"+id).html('<span class="text-error">Ohjelmatietojen haku epäonnistui.</span>')
	  return
        }
        showresults(resp.result,id)
      },
      error: function(jq,text,error) {
        $("#"+id).removeClass("loading")
        $("#"+id).html('<span class="text-error">Ohjelmatietojen haku epäonnistui.</span>')
      },
  })
}

//näyttää haun ja sarjojen tulokset
function showresults(r,id) {
  html='<table>'
  r.reverse().forEach(function(e) {
    stamp=new Date(e.time)
    //note: json api returns timestamp in finnish time. this is so this app never needs to deal with DST or timezones
    weekday=dayofweek(stamp.getUTCDay())
    day=stamp.getUTCDate()
    month=1+stamp.getUTCMonth()
    hour=addzero(stamp.getUTCHours())
    min=addzero(stamp.getMinutes())
    title=weekday+' '+day+'.'+month+'. klo '+hour+'.'+min+' '+escapehtml(e.title)
    html+='<tr><td class="programrow '+id+'" data-title="'+title+'" data-seasonpass="'+id+'" data-id="'+e.id+'" data-url="'+e.purl+'"><b>'+title+'</b><br>'+escapehtml(e.desc)+' ('+e.ch+')</td></tr>'
  })
  html+='</table>'
  $('#'+id).html(html)
  $('.'+id).click(playvideo)
  $('.'+id).taphold(holdmenu)
}

function togglequality() {
  if (quality!="mp4" && quality!="mpeg4") {
    quality="mp4"
    $.cookie('quality', 'mp4' ,{ expires: 365, path: '/' })
  }
  else if (quality!="mpeg4") {
    quality="mpeg4"
    $.cookie('quality', 'mpeg4' ,{ expires: 365, path: '/' })
  }
  else {
    quality="h264"
    $.cookie('quality', 'h264' ,{ expires: 365, path: '/' })
  }
  init()
}

function showquality() {
  if (quality!="mp4" && quality!="mpeg4") {
    $('#qualitysettings').html('<button type="button" class="btn" onclick="togglequality()">Vaihda laatu (nyt: 2M)</button>')
  }
  else if (quality!="mp4") {
    $('#qualitysettings').html('<button type="button" class="btn btn-info" onclick="togglequality()">Vaihda laatu (nyt: 1M)</button>')
  }
  else {
    $('#qualitysettings').html('<button type="button" class="btn btn-inverse" onclick="togglequality()">Vaihda laatu (nyt: 300k)</button>')
  }
}

function channelmap() {
  var nchannels=realchannels.length
  var ret=[]
  for(var j=0; j<nchannels; j++) {
    if(!hidechannels[realchannels[j].id]) ret.push(realchannels[j])
  }
  return ret
}

function togglechannel(chid) {
  if(hidechannels[chid]) {
    delete hidechannels[chid]
  }
  else {
    hidechannels[chid]=true
  }
  $.cookie('hide', hidechannels ,{ expires: 365, path: '/' })
  init()
}

function channelsettings() {
  html="Näytettävät kanavat:<br>"
  var nchannels=realchannels.length
  for(var j=0; j<nchannels; j++) {
    if(!hidechannels[realchannels[j].id]) c=""
    else c=" btn-inverse"
    html+='<button class="btn'+c+'" onclick="togglechannel('+realchannels[j].id+')">'+realchannels[j].name+'</button>'
  }
  
  $('#channelsettings').html(html)
}

function changelog() {
  html='\
<h3>Viimeisimmät muutokset</h3>\
<table class="table">\
<tr><td>16.9.2013</td> <td>Parannuksia pitkään painamalla esiin tulevaan valikkoon </td></tr>\
<tr><td>8.4.2013</td> <td>Lisätty tuki uudelle 1M MPEG4-streamille </td></tr>\
<tr><td>27.3.2013</td> <td>Lisätty pitkään painamalla esiin tuleva valikko, josta ohjelman saa lisättyä katselulistalle tai sarjoihin </td></tr>\
<tr><td>21.3.2013</td> <td>Käytettävyysparannuksia </td></tr>\
<tr><td>9.3.2013</td> <td>Ensimmäinen julkinen versio  </td></tr>\
</table>\
Tarkka muutoshistoria on <a href="https://github.com/viljoviitanen/tvkaista-touch-public/commits/master">githubissa</a>.\
'
  $('#popupcontent').html(html)
  $('#popup').modal()
}
