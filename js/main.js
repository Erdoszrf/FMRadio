//鎾斁鎺у埗
var myAudio = $("audio")[0];
var lyricArr = [];
// 鎾斁/鏆傚仠鎺у埗
$(".btn1").click(function(){
  if (myAudio.paused) {
    play()
  } else {
    pause()
  }
});
// 棰戦亾鍒囨崲
$(".btn2").click(function(){
  getChannel();
});
// 鎾斁涓嬩竴鏇查煶涔�
$(".btn3").click(function(){
  getmusic();

});
function play(){
  myAudio.play();
    $('.btn1').removeClass('m-play').addClass('m-pause');
}
function pause(){
  myAudio.pause();
  $('.btn1').removeClass('m-pause').addClass('m-play');
}
//鑾峰彇棰戦亾淇℃伅
function getChannel(){
  $.ajax({
    url: 'http://api.jirengu.com/fm/getChannels.php',
    dataType: 'json',
    Method: 'get',
    success: function(response){
      var channels = response.channels;
      var num = Math.floor(Math.random()*channels.length);
      var channelname = channels[num].name;
      var channelId = channels[num].channel_id;
      $('.record').text(channelname);
      $('.record').attr('title',channelname);
      $('.record').attr('data-id',channelId);
      getmusic();
    }
  })
}
// 閫氳繃ajax鑾峰彇姝屾洸
function getmusic(){
  $.ajax({
    url: 'http://api.jirengu.com/fm/getSong.php',
    dataType: 'json',
    Method: 'get',
    data:{
          'channel': $('.record').attr('data-id')
        },
    success: function (ret) {
       var resource = ret.song[0],
           url = resource.url,
           bgPic = resource.picture,
           sid = resource.sid,//
           ssid = resource.ssid,//
           title = resource.title,
           author = resource.artist;
         $('audio').attr('src',url);
         $('audio').attr('sid',sid);
         $('audio').attr('ssid',ssid);
         $('.musicname').text(title);
         $('.musicname').attr('title',title)
         $('.musicer').text(author);
         $('.musicer').attr('title',author)
         $(".background").css({
            'background':'url('+bgPic+')',
            'background-repeat': 'no-repeat',
        'background-position': 'center',
        'background-size': 'cover',
      });
         play();//鎾斁
         getlyric();//鑾峰彇姝岃瘝
    }
  })
};
//鑾峰彇姝岃瘝
function getlyric(){
  var Sid = $('audio').attr('sid');
  var Ssid = $('audio').attr('ssid');
  $.post('http://api.jirengu.com/fm/getLyric.php', {ssid: Ssid, sid: Sid})
        .done(function (lyr){
          console.log(lyr);
          var lyr = JSON.parse(lyr);;
          console.log(lyr);
          if (!!lyr.lyric) {
            $('.music-lyric .lyric').empty();//娓呯┖姝岃瘝淇℃伅
            var line = lyr.lyric.split('\n');//姝岃瘝涓轰互鎺掓暟涓虹晫鐨勬暟缁�
                var timeReg = /\[\d{2}:\d{2}.\d{2}\]/g;//鏃堕棿鐨勬鍒�
                var result = [];
                if(line != ""){
                    for(var i in line){//閬嶅巻姝岃瘝鏁扮粍
                        var time = line[i].match(timeReg);//姣忕粍鍖归厤鏃堕棿 寰楀埌鏃堕棿鏁扮粍
                        if(!time)continue;//濡傛灉娌℃湁 灏辫烦杩囩户缁�
                        var value = line[i].replace(timeReg,"");// 绾瓕璇�
                        for(j in time){//閬嶅巻鏃堕棿鏁扮粍
                            var t = time[j].slice(1, -1).split(':');//鍒嗘瀽鏃堕棿  鏃堕棿鐨勬牸寮忔槸[00:00.00] 鍒嗛挓鍜屾绉掓槸t[0],t[1]
                            //鎶婄粨鏋滃仛鎴愭暟缁� result[0]鏄綋鍓嶆椂闂达紝result[1]鏄函姝岃瘝
                            var timeArr = parseInt(t[0], 10) * 60 + parseFloat(t[1]); //璁＄畻鍑轰竴涓猚urTime s涓哄崟浣�
                            result.push([timeArr, value]);
                        }
                    }
                }
              //鏃堕棿鎺掑簭
              result.sort(function (a, b) {
                  return a[0] - b[0];
              });
              lyricArr = result;//瀛樺埌lyricArr閲岄潰
              renderLyric();//娓叉煋姝岃瘝
          }
        }).fail(function(){
          $('.music-lyric .lyric').html("<li>鏈瓕鏇插睍绀烘病鏈夋瓕璇�</li>");
        })
}
function renderLyric(){
  var lyrLi = "";
    for (var i = 0; i < lyricArr.length; i++) {
        lyrLi += "<li data-time='"+lyricArr[i][0]+"'>"+lyricArr[i][1]+"</li>";
    }
    $('.music-lyric .lyric').append(lyrLi);
    setInterval(showLyric,100);//鎬庝箞灞曠ず姝岃瘝
}
function showLyric(){
    var liH = $(".lyric li").eq(5).outerHeight()-3; //姣忚楂樺害
    for(var i=0;i< lyricArr.length;i++){//閬嶅巻姝岃瘝涓嬫墍鏈夌殑li
        var curT = $(".lyric li").eq(i).attr("data-time");//鑾峰彇褰撳墠li瀛樺叆鐨勫綋鍓嶄竴鎺掓瓕璇嶆椂闂�
        var nexT = $(".lyric li").eq(i+1).attr("data-time");
        var curTime = myAudio.currentTime;
        if ((curTime > curT) && (curT < nexT)){//褰撳墠鏃堕棿鍦ㄤ笅涓€鍙ユ椂闂村拰姝屾洸褰撳墠鏃堕棿涔嬮棿鐨勬椂鍊� 灏辨覆鏌� 骞舵粴鍔�
            $(".lyric li").removeClass("active");
            $(".lyric li").eq(i).addClass("active");
            $('.music-lyric .lyric').css('top', -liH*(i-2));
        }
    }

}
//杩涘害鏉℃帶鍒�
setInterval(present,500)  //姣�0.5绉掕绠楄繘搴︽潯闀垮害
$(".basebar").mousedown(function(ev){  //鎷栨嫿杩涘害鏉℃帶鍒惰繘搴�
  var posX = ev.clientX;
  var targetLeft = $(this).offset().left;
  var percentage = (posX - targetLeft)/400*100;
  myAudio.currentTime = myAudio.duration * percentage/100;
});
function present(){
  var length = myAudio.currentTime/myAudio.duration*100;
  $('.progressbar').width(length+'%');//璁剧疆杩涘害鏉￠暱搴�
  //鑷姩涓嬩竴鏇�
  if(myAudio.currentTime == myAudio.duration){
    getmusic()
  }
}
//icon
$('.m-star').on('click',function(){
  $(this).toggleClass('stared')
})
$('.m-heart').on('click',function(){
  $(this).toggleClass('loved')
})
$('.m-xunhuan').on('click',function(){
  $(this).toggleClass('recycleed').toggleClass('colored')
  if ($(this).hasClass('recycleed')) {
    $('audio').attr('loop','loop');
  }
  if($(this).hasClass('colored')){
    $('audio').removeAttr('loop','no-loop');
  }
})
$('.m-lyric').on('click',function(){
  $(this).toggleClass('lyriced');
  if ($(this).hasClass('lyriced')) {
    $('.background .music-lyric').css({'display':'block'})
  }else{
    $('.background .music-lyric').css({'display':'none'})
  }
})
$(document).ready(getChannel())