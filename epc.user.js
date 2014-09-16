// ==UserScript==  
// @name         epc
// @version              1.0
// @author       zuoyuan@mail.ustc.edu.cn
// @namespace    https://github.com/zuoyuan
// @description  epc 刷课
// @include      http://epc.ustc.edu.cn/m_practice.asp*
// @require     https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js
// ==/UserScript== 


//scroll to end
/**尾部*/
window.scrollTo(0,10000);
	
/*	
var jqueryUrl = 'https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js';
var script = document.createElement('script');
script.src = jqueryUrl;
script.type = 'text/javascript';
script.onload = function(){
	main();
}

document.body.appendChild(script);
*/
var DAYTIME = {
day:['周一','周二','周三','周四','周五'],
time:['08:25-09:15','09:45-11:25','14:00-15:30','14:30-16:10','16:40-17:30','19:00-20:40']
};
var Config=function(){
	this.conf = {};
	if(typeof(localStorage['adaytime'])=='undefined') localStorage['adaytime']='';
	this.conf.adaytime = localStorage['adaytime'].split(',');
	if(typeof(localStorage['DAYTIME'])=='undefined') localStorage['DAYTIME']='';
	DAYTIME = localStorage['DAYTIME'].split(',');
	if(typeof(this.conf.adaytime)=='undefined'){
		this.conf.adaytime=[];
		for(var i=0;i<DAYTIME.day.length;i++){
			for(var j=0;j<DAYTIME.time.length;j++){
				this.conf.adaytime.push ( DAYTIME.day[i]+' '+DAYTIME.time[j]);
			}
		}
		
	}
	//console.log(this.adaytime);
	this.conf.username = localStorage['username'];
	this.conf.pw = localStorage['pw'];
	if(typeof(this.conf.username)=='undefined' || typeof(this.conf.pw)=='undefined'){
		console.log('username or password empty.');
	}
	
	this.conf.startWeek = typeof(localStorage['startWeek'])=='undefined'? 1:localStorage['startWeek'];
	this.conf.endWeek = typeof(localStorage['endWeek'])=='undefined'? 30:localStorage['endWeek'];
}
Config.prototype.get = function(){
	return this.conf;
}
Config.prototype.set = function(data){
	for(var i in data){
		localStorage[i] = data[i];
	}
}
var config = new Config();
var allPage ;
var c = config.get();
function main(){
	
	
	/**  自动登录  */
	var pageText = $('table table table:last tr:last').text();
	if(pageText=="登录后可以查看详细信息"){
		$.post('n_left.asp','submit_type=user_login&name='+c.username+'&pass='+c.pw+'&txt_check=&user_type=2&Submit=LOG+IN',function(data){
			console.log('Log in OK!');
			location.reload();
		});
		return ;
	}
	
	
	var pageInfo = pageText.match(/\d+/g);
	var cpage = pageInfo[0];
	allPage = pageInfo[2];
	
	var rootTable = $('table table table table:eq(0)');
	var course = [];
	
	
	rootTable.find('tr:gt(0)').each(function(){
		var obj = {};
		obj.name = $(this).find('td:first').text();
		obj.week = $(this).find('td:eq(1)').text();
		obj.day = $(this).find('td:eq(2)').text();
		obj.teacher = $(this).find('td:eq(3)').text();
		obj.hour = $(this).find('td:eq(4)').text();
		obj.time = $(this).find('td:eq(5)').html().toString();
		obj.time = obj.time.substring(obj.time.search('>')+1);
		if(DAYTIME.indexOf(obj.time)==-1){
			DAYTIME.push(obj.time);
			localStorage['DAYTIME'] = DAYTIME;
		}
		
		obj.size = parseInt($(this).find('td:eq(9)').text());
		obj.students = parseInt($(this).find('td:eq(10)').text());
		obj.btn = $(this).find('td:eq(12)');
		course.push(obj);
	});
	
	var count = 0;
	
	for(var i=0;i<course.length;i++){
		var courseWeek = parseInt(course[i].week.match(/\d+/)[0]);
		if(courseWeek < c.startWeek || courseWeek > c.endWeek) {
			if(0 == i){
				var url = location.href;
				if(url.indexOf('week=')==-1){
					url += '&week='+c.startWeek;
				}
				if(url.indexOf('week_day=')==-1){
					url += '&week_day=1';
				}
				if(url.indexOf('page=')==-1){
					url += '&page=1';
				}
				location.href = url.replace(/week=\d+/,'week='+c.startWeek).replace(/page=\d+/,'page=1');
			}
			count++;
			continue;
		}
		
		if(c.adaytime.indexOf(course[i].day+' '+course[i].time)==-1){
			count++;
			continue;
		}
		if(course[i].btn.find(':submit').is(':disabled') || course[i].btn.find(':submit').val()!='预 约'
			|| course[i].btn.text().trim()=="已达选课上线"){
		//if(course[i].size == course[i].students)
			count++;
			continue;
		}
		
		
		var form = course[i].btn.parent('tr').prev('form');
		(function(i){
		$.post(form.attr('action'),"submit_type=book_submit",function(data){
			//console.log(data);
			if(data.indexOf('预约成功')!=-1){
				if(localStorage['version']=='dev'){
					$.get('http://127.0.0.1/epc/?log='+course[i].week+'%20'+course[i].day+'%20'+course[i].time+'%20'+course[i].name);
				}
			}
			count++;
			if(count==course.length){
				$(document).trigger('next');
			}
			
		});
		})(i);
		
	}
	if(count==course.length){
		$(document).trigger('next');
	}
	console.log(course);
}

$(document).bind('next',function(){
	var d = new Date(localStorage['firstWeek']).getTime();
	var cd = new Date().getTime();
	var cweek = Math.floor(1 + (cd-d)/3600000/24/7);
	var cday = new Date().getDay()+1;//从第二天开始刷课
	var week = location.href.match(/week=(\d+)/);
	var day = location.href.match(/week_day=(\d+)/);
	var url = location.href;
	if(week==null){
		url = url + '&week='+cweek;
		week=['week='+cweek];
	}
	if(day==null){
		url = url + '&week_day='+cday;
		day=['week_day='+cday];
	}
	var page = location.href.match(/page=(\d+)/);
	if(page==null){
		url = url + '&page=1';
		page=['page=1',1];
	}
	var T = 5000;
	//$.get('http://127.0.0.1/epc/?log='+encodeURIComponent(location.href));
	if(parseInt(page[1])>=parseInt(allPage)){
		url = location.href.replace(/week=\d+/,'week='+cweek).replace(/week_day=\d+/,'week_day='+cday)
			.replace(/page=\d+/,'page=1');
		setTimeout(function(){
			location.href=url;
		},T);
		
	}else{
		setTimeout(function(){
			location.href=url.replace(page[0],'page='+(parseInt(page[1])+1));
		},T);
	}
});


main();