$().extend('draggable',function(){
	var tags = arguments;
	for (var i = 0; i < this.elems.length; i++) {
		$(this.elems[i]).bind('mousedown',function(e){
			var _this = this;
			var oBox = document.createElement('div');
			oBox.className = 'dragBox';
			oBox.style.width = _this.offsetWidth - 2 + 'px';
			oBox.style.height = _this.offsetHeight - 2 + 'px';
			oBox.style.left   = _this.offsetLeft - 1 + 'px';
			oBox.style.top    = _this.offsetTop - 1 + 'px';
			var x = e.clientX;
			var y = e.clientY;
			var dx = x-_this.offsetLeft;
			var dy = y-_this.offsetTop;

			var flag = false;
			for(var i=0;i<tags.length;i++){
				if (e.target == tags[i]) {
					flag = true;
					break;
				};
			}
			
			if(flag){
				e.preventDefault();
				document.body.appendChild(oBox);
				$(document).bind('mousemove',move);
				$(document).bind('mouseup',up);
			}else{
				// document.body.removeChild(oBox);
				$(document).unbind('mousemove',move);
				$(document).unbind('mouseup',up);
			}
			function move(e){
				e.preventDefault();
				// _this.style.left = e.clientX - dx + 'px';
				// _this.style.top = e.clientY - dy + 'px';
				oBox.style.left = e.clientX - dx + 'px';
				oBox.style.top = e.clientY - dy + 'px';
				if(typeof _this.setCapture != 'undefined'){
					_this.setCapture();
				};
			}
			function up(e){
				oBox.style.border = 'none';
				$(document).unbind('mousemove',move);
				$(document).unbind('mouseup',up);
				_this.style.left = oBox.offsetLeft + 'px';
				_this.style.top = oBox.offsetTop + 'px';
				document.body.removeChild(oBox);
				if(typeof _this.releaseCapture != 'undefined'){
					_this.releaseCapture();
				};
			}
			return false;
		});
	};
	return this;
});