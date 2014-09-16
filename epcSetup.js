var s=document.createElement('script');
s.innerHTML = 'document.onmousedown="";document.onmouseup=""';
document.body.appendChild(s);
var rootNode = $('<div>');
rootNode.appendTo('body');
var week=['周一','周二','周三','周四','周五','周六','周日'];
var timeSeg = 
{
	'Situational Dialogue':['08:25-09:15','16:40-17:30'],
	'Topical Discussion':['09:45-11:25','14:30-16:10','19:00-20:40']
};
var html = '<style>#time li li{display:inline-block;}</style><ul id="time" style="list-style:none;">';
html += '<li>'
			+'<h3>User Info</h3>'
				+'<ul>'
					+'<li>ID<input type="text" id="username" value="'+localStorage['username']+'"/> Password<input type="password" id="pw"  value="'+localStorage['pw']+'"/></li>'
				+'</ul>'
			+'</li>';
if(typeof(localStorage['adaytime'])=='undefined'){
	var adaytime=[];
}else{
	var adaytime = localStorage['adaytime'].split(',');
}
for(var i in timeSeg){
	html += '<li class="adaytime"><h3>'+i+'</h3><ul style="list-style:none;">';
	for(var j in week){
		for(var k in timeSeg[i]){
			var checked='';
			var dt = week[j]+' '+timeSeg[i][k];
			if(adaytime.indexOf(dt)!=-1){
				checked = 'checked';
			}
			html += '<li><label><input '+checked+' type="checkbox" rel="'+i+'" value="'+ dt +'">'+week[j]+' '+timeSeg[i][k]+'</label></li>';
		}
	}
	html += '</ul></li>';
}
html += '<li><h3>Start and End week</h3>'
	 + 'one day of first week<input id="first-week" type="date" value="' +localStorage['firstWeek'] + '">'
	 + 'from week<input id="start-week" type="number" value="'+localStorage['startWeek']+'"> to week<input id="end-week" type="number" value="'+localStorage['endWeek']+'"></li>';
html += '<li><input id="save" type="button" value="Save"></li>';
html += '</ul>';
rootNode.html(html);
$('#save').click(function(e){
	var dateTime=[];
	localStorage['username']=$('#username').val();
	localStorage['pw']=$('#pw').val();
	localStorage['firstWeek']=$('#first-week').val();
	localStorage['startWeek']=$('#start-week').val();
	localStorage['endWeek']=$('#end-week').val();
	$('#time').children('li.adaytime').each(function(){
		$(this).find('input:checked').each(function(){
			dateTime.push(this.value);
		});
	});
	
	localStorage['adaytime']=dateTime;
	alert('你选的时间是:'+dateTime);
});