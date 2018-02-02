
var audio = new Audio()
audio.autoplay = true
var isAnimate =false

$('.btn1').on('click',function(e){
  e.stopPropagation()
  $(this).toggleClass('icon-pause')
  if($(this).hasClass('icon-pause')){
    audio.play()
  }else{
    audio.pause()
  }
})
$('.icon-next').on('click',function(e){
  e.stopPropagation()
  $('.btn1').addClass('icon-pause')
  getmusic($('.type').attr('data-id'))
})
$('.icon-nexttype').on('click',function(e){
  e.stopPropagation()
  $('.btn1').addClass('icon-pause')
  getChannel()
})
$('.icon-cycle').on('click',function(e){
  e.stopPropagation()
  $(this).toggleClass('active')
  if(audio.loop){
    audio.loop = false
  }else{
    audio.loop = true
  }
})
$('.icon-heart').on('click',function(e){
  e.stopPropagation()
  $(this).toggleClass('active')
})
$('#download span').on('click',function(e){
  e.stopPropagation()
  $(this).toggleClass('active')
})
$('.bar').on('click',function(e){
  e.stopPropagation()
  var percent = e.offsetX/parseInt(getComputedStyle(this).width)
  audio.currentTime = audio.duration * percent
})
$('.icon-lyric').on('click',function(e){
  e.stopPropagation()
  $(this).toggleClass('active')
  if($(this).hasClass('active')){
    $('.musicbox .background .lyric').css({
      'display':'block'
    })
  }else{
    $('.musicbox .background .lyric').css({
      'display':'none'
    })
  }
})
$('.icon-type').on('click',function(e){
  e.stopPropagation()
  $(this).toggleClass('active')
  if($(this).hasClass('active')){
    $('.musicbox .musictype').css({
      'right':'0'
    })
  }else{
    $('.musicbox .musictype').css({
      'right':'-100px'
    })
  }
})
$('.musicbox').on('click',function(){
  $('.musicbox .musictype').css({
      'right':'-100px'
    })
  $('.icon-type').removeClass('active')
})

$('.icon-down').on('click',function(e){
  e.stopPropagation()
  if($('.musicbox .musictype .layout ul').position().top <= -1900){return}
  if(isAnimate){
    return
  }else{
    $('.musicbox .musictype .layout ul').css( "top", "-=380" );
    isAnimate = true
  }
  isAnimate = false
})
$('.icon-up').on('click',function(e){
  e.stopPropagation()
  if($('.musicbox .musictype .layout ul').position().top >= 0){return}
  if(isAnimate){
    return
  }else{
    $('.musicbox .musictype .layout ul').css( "top", "+=380" );
    isAnimate = true
  }
  isAnimate = false

})
$('.musictype ul').on('click','li',function(e){
  e.stopPropagation()
  $('.btn1').addClass('icon-pause')
  $('.type').text($(this).text())
  $('.type').attr('data-id',$(this).attr('data-channel'))
  getmusic($(this).attr('data-channel'))
})
















function renderChannel(channels){
  var html = ''
  channels.forEach(function(index){
    html += '<li data-channel = "'+index.channel_id+'" data-channelname = "'+index.name+'"><span>'+index.name+'</span></li>'
  })
  $('.musicbox .musictype ul').html(html)

}



getChannel()
function getChannel(){
  $.ajax({
    url: 'https://jirenguapi.applinzi.com/fm/getChannels.php',
    dataType: 'jsonp',
    Method: 'get',
    success: function(response){
      var channels = response.channels
      renderChannel(channels)
      var num = Math.floor(Math.random()*channels.length);
      var channelname = channels[num].name;
      var channelId = channels[num].channel_id;
      $('.type').text(channelname);
      $('.type').attr('data-id',channelId);
      getmusic(channelId);
    }
  })
}
function getmusic(channelId){

  $.ajax({
    url: 'https://jirenguapi.applinzi.com/fm/getSong.php',
    dataType: 'json',
    Method: 'get',
    data:{
          'channel': channelId
        },
    success: function (ret) {

       var resource = ret.song[0],
           url = resource.url,
           bgPic = resource.picture,
           sid = resource.sid,
           title = resource.title,
           author = resource.artist;
           audio.src = url
           getlyric(sid)
         $('.musicinfo h1').text(title);
         $('.musicinfo h1').attr('title',title)
         $('.musicinfo h3').text(author);
         $('.musicinfo h3').attr('title',author)
         $('#download').attr('href',url)
         $('#download span').removeClass('active')
         $('.icon-heart').removeClass('active')
         $(".background").css({
            'background':'url('+bgPic+')',
            'background-repeat': 'no-repeat',
        'background-position': 'center',
        'background-size': 'cover',
      });
    }
  })
}


audio.onplay = function(){
  clock = setInterval(function(){
    let min = Math.floor(audio.currentTime/60)
    let sec = Math.floor(audio.currentTime%60)+''
    sec = sec.length === 2?sec:'0'+sec
    $('.time .nowtime').text(min+':'+sec)
  },1000)
  let min = Math.floor(audio.duration/60)
  let sec = Math.floor(audio.duration%60)+''
  sec = sec.length === 2?sec:'0'+sec
  $('.time .alltime').text(min+':'+sec)
}
audio.onpause = function(){
  clearInterval(clock)
}
audio.onended= function(){
  getmusic()
}
audio.ontimeupdate = function(){

  $('.bar .progressnow').css({
    'width':(audio.currentTime/audio.duration)*100+'%'})
}



function getlyric(sid){
  $.post('https://jirenguapi.applinzi.com/fm/getLyric.php', {sid: sid})
        .done(function (lyr){

          var lyr = JSON.parse(lyr);;

          if (!!lyr.lyric) {
            $('.lyric ul').empty();
            var line = lyr.lyric.split('\n');
                var timeReg = /\[\d{2}:\d{2}.\d{2}\]/g;
                var result = [];
                if(line != ""){
                    for(var i in line){
                        var time = line[i].match(timeReg);
                        if(!time)continue;
                        var value = line[i].replace(timeReg,"");
                        for(j in time){
                            var t = time[j].slice(1, -1).split(':');

                            var timeArr = parseInt(t[0], 10) * 60 + parseFloat(t[1]);
                            result.push([timeArr, value]);
                        }
                    }
                }

              result.sort(function (a, b) {
                  return a[0] - b[0];
              });
              lyricArr = result;
              renderLyric();
          }
        }).fail(function(){
          $('.lyric ul').html("<li>暂无</li>");
        })
}
function renderLyric(){
  var lyrLi = "";
    for (var i = 0; i < lyricArr.length; i++) {
        lyrLi += "<li data-time='"+lyricArr[i][0]+"'>"+lyricArr[i][1]+"</li>";
    }
    $('.lyric ul').append(lyrLi);
    setInterval(showLyric,100);
}
function showLyric(){
    var liH = $(".lyric ul li").eq(5).outerHeight()-3;
    for(var i=0;i< lyricArr.length;i++){
        var curT = $(".lyric ul li").eq(i).attr("data-time");
        var nexT = $(".lyric ul li").eq(i+1).attr("data-time");
        var curTime = audio.currentTime;
        if ((curTime > curT) && (curT < nexT)){
            $(".lyric ul li").removeClass("active");
            $(".lyric ul li").eq(i).addClass("active");
            $('.lyric ul').css('top', -liH*(i-2));
        }
    }

}
