//DOM加载
(function(){
	window.sys = {};
	var ua = navigator.userAgent.toLowerCase();
	var s;
	(s = ua.match(/msie\s([\d.]+)/)) ? sys.ie = s[1] :
	(s = ua.match(/firefox\/([\d.]+)/)) ? sys.firefox = s[1] :
	(s = ua.match(/chrome\/([\d.]+)/)) ? sys.chrome = s[1] :
	(s = ua.match(/opera\/.*version\/([\d.]+)/)) ? sys.opera = s[1] :
	(s = ua.match(/version\/([\d.]+).*safari/)) ? sys.safari = s[1] :
	(s = ua.match(/webkit\/([\d.]+)/)) ? sys.webkit = s[1] : 0;
})();

function addDomLoaded(fn){
	var timer = null;
	var flag = false;
	function doReady(){
		if(timer) clearInterval(timer);
		if(flag){
			return;
		}
		fn();
		flag = true;
	}

	if((sys.opera && sys.opera < 9 )||(sys.firefox && sys.firefox <3)||(sys.webkit && sys.webkit < 525)){
		timer = setInterval(function(){
			if(document && document.getElementById && document.getElementsByTagName && document.body){
				doReady();
			}
		},1);
	}else if(document.addEventListener){
		document.addEventListener('DOMContentLoaded',function(){
			fn();
			document.removeEventListener('DOMContentLoaded',arguments.callee);
		});
	}else if(sys.ie && sys.ie < 9){
		var timer =null;
		timer = setInterval(function(){
			try{
				document.documentElement.doScroll('left');
				doReady();
			}catch(e){};
		},1);
	}
	
}

//生成库的对象
function $(args) {
	// body...
	return new ppy(args);
}
//构造函数
function ppy (args) {
	// body...
	this.elems = [];
	if (typeof args == 'string') {
		if(args.indexOf(' ') != -1){
			var arr = args.split(' ');
			var temp = [];
			var node = [];//存放父节点
			for(var i=0;i<arr.length;i++){
				if(node.length == 0) node.push(document);
				switch(arr[i].charAt(0)){
				case '#':
					temp = []; //清空失效的父节点
					temp.push(this.getId(arr[i].substring(1)));
					node = temp;
					break;
				case '.':
					temp = [];
					var tmpNode = [];
					for(var j=0;j<node.length;j++){
						tmpNode = this.getClass(arr[i].substring(1),node[j]);
						for(var m=0;m<tmpNode.length;m++){
							temp.push(tmpNode[m]);
						}
					}
					node = temp;
					break;
				default:
					temp = [];
					var tmpNode = [];
					for(var j=0;j<node.length;j++){
						tmpNode = this.getTagName(arr[i],node[j]);
						for(var m=0;m<tmpNode.length;m++){
							temp.push(tmpNode[m]);
						}
					}
					node = temp;
				}
			}
			this.elems = temp;
		}else{
			switch(args.charAt(0)){
				case '#':
					this.elems.push(this.getId(args.substring(1)));
					break;
				case '.':
					this.elems = this.getClass(args.substring(1));
					break;
				default:
					this.elems = this.getTagName(args);
				}
		}
	}else if(typeof args == 'object') {
		if(args != undefined){
			this.elems[0] = args;
		}	
	}else if(typeof args == 'function'){
		addDomLoaded(args);
	}
}

ppy.prototype.ready = function(fn){
	addDomLoaded(fn);
};

//根据ID获取节点元素
ppy.prototype.getId = function(id){
	return document.getElementById(id);
}

ppy.prototype.get = function(pos){
	return this.elems[pos];
}

//根据标签名获取节点元素
ppy.prototype.getTagName = function(tag,parent){
	var node = null;
	if(arguments.length == 2){
		node = parent;
	}else{
		node = document;
	}
	var temp = [];
	var tagElems = node.getElementsByTagName(tag);
	for (var i = 0; i < tagElems.length; i++) {
		temp.push(tagElems[i]);
	};
	return temp;
}

//根据class获取节点元素
ppy.prototype.getClass = function(className,parent){
	var node = null;
	if(arguments.length == 2){
		node = parent;
	}else{
		node = document;
	}
	var temp = [];
	var aElems = node.getElementsByTagName('*');
	for (var i=0; i < aElems.length; i++) {
		if((new RegExp('(\\s|^)'+className+'(\\s|$)')).test(aElems[i].className)){
			temp.push(aElems[i]);
		}
	}
	return temp;
}

//获取特定节点
ppy.prototype.eq = function(pos){
	var elem = this.elems[pos];
	this.elems = [];
	this.elems[0] = elem;
	return this;
}


//获取当前元素的下一个节点
ppy.prototype.next = function(){
	for (var i=0; i < this.elems.length; i++) {
		this.elems[i] = this.elems[i].nextSibling;	
		if(this.elems[i] == null) throw new Error("can't find next node");
		if(this.elems[i].nodeType == 3) this.next();//空白文本节点
	}
	return this;
};

//获取当前元素的上一个节点
ppy.prototype.prev = function(){
	for (var i=0; i < this.elems.length; i++) {
		this.elems[i] = this.elems[i].previousSibling;	
		if(this.elems[i] == null) throw new Error("can't find prev node");
		if(this.elems[i].nodeType == 3) this.prev();//空白文本节点
	}
	return this;
};

//获取子节点
ppy.prototype.find = function(str){
	var cElem = [];
	for (var i=0; i < this.elems.length; i++) {
		switch(str.charAt(0)){
			case '.':
				var aclass = this.getClass(str,this.elems[i]);
				for(var j=0;j<aclass.length;j++){
					cElem.push(aclass[j]);
				}
				break;
			default:
				var atags = this.getTagName(str,this.elems[i]);
				for(var j=0;j<atags.length;j++){
					cElem.push(atags[j]);
				}
		}
	}
	this.elems = cElem;
	return this;
};

//css方法，参数1个只获取属性值，2个参数设置属性值
ppy.prototype.css = function(attr,val) {
	// body...
	if(arguments.length === 1){
		for(var i = 0;i < this.elems.length;i++){
			//return this.elems[i].style[attr];
			if(this.elems[i].currentStyle){
				return this.elems[i].currentStyle[attr];
			}else{
				return getComputedStyle(this.elems[i],null)[attr];
			}
		}
	}
	for(var i = 0;i < this.elems.length;i++){
		this.elems[i].style[attr] = val;
	}
	return this;
};

//透明度
ppy.prototype.opacity = function(val){
	for(var i = 0;i < this.elems.length;i++){
		this.elems[i].style.opacity = val/100;
		this.elems[i].style.filter = 'alpha(opacity='+val+')';
	}
	return this;
};

//html方法没有参数时直接获取innerHTML值，否则替换
ppy.prototype.html = function(val){
	if (arguments.length === 0) {
		for (var i = 0; i < this.elems.length; i++) {
			return this.elems[i].innerHTML;
		};
	}else{
		for (var i = 0; i < this.elems.length; i++) {
			this.elems[i].innerHTML = val;
		};
		return this;
	}
};

//没有参数时直接获取value值，否则替换
ppy.prototype.val = function(val){
	if (arguments.length === 0) {
		for (var i = 0; i < this.elems.length; i++) {
			return this.elems[i].value;
		};
	}else{
		for (var i = 0; i < this.elems.length; i++) {
			this.elems[i].value = val;
		};
		return this;
	}
};

//没有参数时直接获取text值，否则替换
ppy.prototype.text = function(val){
	if (arguments.length === 0) {
		for (var i = 0; i < this.elems.length; i++) {
			return (typeof this.elems[i].textContent == 'string') ? 
			this.elems[i].textContent : this.elems[i].innerText;
		};
	}else{
		for (var i = 0; i < this.elems.length; i++) {
			(typeof this.elems[i].textContent == 'string') ? 
			this.elems[i].textContent = val : this.elems[i].innerText = val;
		};
		return this;
	}
};

//获取属性
ppy.prototype.attr = function(attr,val){
	for(var i =0;i< this.elems.length;i++){
		if(arguments.length == 1){
			return this.elems[0].getAttribute(attr);//变量用[],常量用.
		}else if(arguments.length == 2){
			this.elems[0].setAttribute(attr,val);
		}
	}	
	return this;
};

//获取节点的索引值
ppy.prototype.index = function(){
	var children = this.elems[0].parentNode.children;
	for(var i =0;i< children.length;i++){
		if(this.elems[0] == children[i]){
			return i;
		}
	}
};


//
function offsetTop(elem){
	var top = elem.offsetTop;
	var parent = elem.offsetParent;
	while(parent != null){
		top+=parent.offsetTop;
		parent = parent.offsetParent;
	}
	return top;
}

//去除空格
String.prototype.trim = function(){
	return this.replace(/(^\s*)|(\s*$)/g,'');
};

//获取节点长度
ppy.prototype.length = function(){
	return this.elems.length;
};

//添加class
ppy.prototype.addClass = function(className){	
	for (var i=0; i < this.elems.length; i++) {
			if(!this.elems[i].className.match(new RegExp('(\\s|^)'+className+'(\\s|$)'))){
				if(this.elems[i].className == ''){
					this.elems[i].className = className;
				}else{
					this.elems[i].className += ' '+className;
				}
			}
		}
		return this;
};

//删除class
ppy.prototype.removeClass = function(className){	
	for (var i=0; i < this.elems.length; i++) {
			if(this.elems[i].className.match(new RegExp('(\\s|^)'+className+'(\\s|$)'))){
				this.elems[i].className = this.elems[i].className.replace(new RegExp('(\\s|^)'+className+'(\\s|$)'),'');
			}
		}
	return this;
};

//鼠标移入移出链式方法
ppy.prototype.hover = function(over,out){
	for (var i = 0; i < this.elems.length; i++) {
		 $(this.elems[i]).bind('mouseover',over);
		 $(this.elems[i]).bind('mouseout',out);
	};
	return this;
};

//点击
ppy.prototype.click = function(fn){
	for (var i = 0; i < this.elems.length; i++) {
		$(this.elems[i]).bind('click',fn);
	};
	return this;
};


//切换
ppy.prototype.toggle = function(){	
	for (var i = 0; i < this.elems.length; i++) {
		// this.elems[i].count = 0;
		// var args = arguments;
		// $(this.elems[i]).bind('click',function(){
		// 	args[this.count++ % args.length].call(this);
		// });
		(function(elem,args){
			var count = 0;
			$(elem).bind('click',function(){
				args[count++ % args.length].call(this);
			});
		})(this.elems[i],arguments);
	};
	return this;
};


/**************************************************/
/*-------------------功能模块区-------------------*/

//显示
ppy.prototype.show = function(){
	for (var i = 0; i < this.elems.length; i++) {
		this.elems[i].style.display = 'block';
	};
	return this;
};

//隐藏
ppy.prototype.hide = function(){
	for (var i = 0; i < this.elems.length; i++) {
		this.elems[i].style.display = 'none';
	};
	return this;
};


//适应屏幕大小
ppy.prototype.resize = function(fn){
	window.onresize = fn;
	return this;
};

//视窗大小
function winsize(){
	if(typeof window.innerWidth != 'undefined'){
		return {width:window.innerWidth,height:window.innerHeight}
	}else{
		return {width:document.documentElement.clientWidth,height:document.documentElement.clientHeight}
	}
}

//获取滚动条位置
function scroll(){
	return{
		top:document.documentElement.scrollTop || document.body.scrollTop,
		left:document.documentElement.scrollLeft || document.body.scrollLeft
	}
}

//弹窗居中
ppy.prototype.center = function(){
	var width = parseInt(this.get(0).offsetWidth);
	var height = parseInt(this.get(0).offsetHeight);
	var winX = winsize().width;
	var winY = winsize().height;
	var left = (winX -width)/2;
	var top = (winY- height)/2+scroll().top;
	for (var i = 0; i < this.elems.length; i++) {
		this.elems[i].style.top  = top+'px';
		// this.elems[i].style.marginTop = scroll().top/2+'px';
		this.elems[i].style.left = left+'px';
	};
	return this;
};



//锁屏
ppy.prototype.lock = function(){
	var width = 0;
	var height = 0;
	var $html = $('html');
	var $body = $('body');
	//var bodyHeight = parseInt($('body').css('height'));
	$html.css('overflow','hidden');
	$body.css('overflow','hidden');
	if(typeof window.innerWidth != 'undefined'){
		width = window.innerWidth;
		height = window.innerHeight;
	}else{
		width = document.documentElement.clientWidth;
		height = document.documentElement.clientHeight;
	}
	for (var i = 0; i < this.elems.length; i++) {
		this.elems[i].style.width = width + 'px';
		this.elems[i].style.height = height + 'px';
		this.elems[i].style.display = 'block';
	};
	return this;
};

ppy.prototype.unlock = function(){
	var $html = $('html');
	var $body = $('body');
	$html.css('overflow','auto');
	$body.css('overflow','auto');
	for (var i = 0; i < this.elems.length; i++) {
		this.elems[i].style.display = 'none';
	};
	return this;
};


//事件绑定，适配器模式
ppy.prototype.bind = function bind(types,fn){
	bind.fixEvent = function(event){
		event.preventDefault = bind.fixEvent.preventDefault;
		event.stopPropagation= bind.fixEvent.stopPropagation;
		event.target = event.srcElement;
		return event;
	};
	bind.fixEvent.preventDefault = function(){
		this.returnValue = false;
	};
	bind.fixEvent.stopPropagation = function(){
		this.cancelBubble = true;
	};
	for (var i = 0; i < this.elems.length; i++) {
		var elem = this.elems[i];
		if(typeof elem.addEventListener != 'undefined'){
			elem.addEventListener(types,fn,false);
		}else{
			if(!elem.evs) elem.evs = {};
			if(!bind.id) bind.id = 0;
			if(!fn._id) fn._id = bind.id++; 
			if(!elem.evs[types]){
				elem.evs[types] = {};
				bind.id = 0;
				if(elem['on'+types]) elem.evs[types][0] = fn;
			}else{
				for(var e in elem.evs[types]){
					if(elem.evs[types][e] == fn)
					return false;
				}
			}
			elem.evs[types][bind.id++] = fn;
			elem['on'+types] = function(){
				for(var e in elem.evs[types]){
					elem.evs[types][e].call(this,bind.fixEvent(window.event));
				}
			};
		}
	};
	return this;
};




//取消事件绑定
ppy.prototype.unbind = function bind(types,fn){
	for (var i = 0; i < this.elems.length; i++) {
		var elem = this.elems[i];
		if(typeof elem.removeEventListener != 'undefined'){
			elem.removeEventListener(types,fn,false);
			return;
		}else{
			if(elem.evs){
				for(var e in elem.evs[types]){
					if(elem.evs[types][e] == fn){
						delete elem.evs[types][e];
					}
				}
			}
		}
	};
	return this;
};


//设置表单字段
ppy.prototype.form = function(name){
	for (var i = 0; i < this.elems.length; i++) {
		this.elems[i] = this.elems[i][name];
	}
	return this;
};


//插件接口
ppy.prototype.extend = function(name,fn){
	ppy.prototype[name] = fn;
};


//动画
ppy.prototype.animate = function(){
	/*
	styles,speed,easing,callback
	 */
	for(var i=0;i<this.elems.length;i++){
		var elem = this.elems[i];
		if(elem.timer) clearInterval(elem.timer);
		var styles = null;
		var easing = 'swing';
		var callback = null;
		var speed = 6;
		for(var j=0;j<arguments.length;j++){
			if(typeof arguments[j] == 'object'){ 
				styles = arguments[j];
			}else if(typeof arguments[j] == 'number'){
				speed = arguments[j];
			}else if(typeof arguments[j] == 'string'){
				easing = arguments[j];
			}else if(typeof arguments[j] == 'function'){
				callback = arguments[j];
			} 
		}
		if(easing == 'linear'){
			elem.timer = setInterval(function(){
				var flag = true;
				for(var attr in styles){
					var cur = 0;
					var val = $(elem).css(attr);
					if(attr == 'opacity'){
						cur = Math.round(parseFloat(val))*100;
					}else{
						cur = parseInt(val);
					}
					var step = (cur < parseInt(styles[attr])) ? 10 : -10;
					if(cur != parseInt(styles[attr])) flag = false;
					if(attr == 'opacity'){
						elem.style.opacity = (cur + step)/100;
						elem.style.filter = 'alpha(opacity=' + (cur + step);
					}else{
						elem.style[attr] = cur + step +'px';
					}
					if(step > 0 && Math.abs(cur - parseInt(styles[attr])) < step){
						elem.style[attr] = parseInt(styles[attr]) + 'px';
					}else if(step < 0 && (cur - parseInt(styles[attr])) < Math.abs(step)){
						elem.style[attr] = parseInt(styles[attr]) + 'px';
					}
				}
				if(flag){
					clearInterval(elem.timer);
					if(callback) callback();
				}
			},30);
		}else if(easing == 'swing'){
			elem.timer = setInterval(function(){
				var flag = true;
				for(var attr in styles){
					var cur = 0;
					var val = $(elem).css(attr);
					if(attr == 'opacity'){
						cur = Math.round(parseFloat(val)*100);
					}else{
						cur = parseInt(val);
					}
					var step = (parseInt(styles[attr]) - cur) / speed;
					step = step > 0 ? Math.ceil(step) : Math.floor(step);
					if(step == 0){
						if(attr == 'opacity'){
							elem.style.opacity = parseInt(styles[attr])/100;
							elem.style.filter = 'alpha(opacity=' + (parseInt(styles[attr]))+')';
						}else{
							elem.style[attr] = parseInt(styles[attr]) +'px';
						}
					}else{
						if(cur != parseInt(styles[attr])) flag = false;
						// console.log(cur);
						if(attr == 'opacity'){
							elem.style.opacity = (cur + step)/100;
							elem.style.filter = 'alpha(opacity=' + (cur + step)+')';
						}else{
							elem.style[attr] = cur + step +'px';
						}
					}
				}
				if(flag){
					clearInterval(elem.timer);
					if(callback) callback();
				}
			},10);
		}
		
		
	}
	return this;
};


