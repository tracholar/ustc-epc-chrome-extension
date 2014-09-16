document.getElementById('save').onclick=function(){
	localStorage['adaytime']=document.getElementById('time').value;
}

	document.getElementById('time').innerText = localStorage['adaytime'];
