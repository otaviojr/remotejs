var RemoteJS;

(function(){
	RemoteJS = function(cfg){
    	var ctx = this;
		cfg = cfg || {};

		this.buffer = new Array();

		this.options = {
			app_id: "app_id",
			server_url: "",
			server_port: "",
			redirect_console: false,
			use_browser_console: false,
			enable_legacy_ajax: true,
			screenshot_on_error: true,		//Depends on html2canvas to work properly (https://github.com/niklasvh/html2canvas)
			use_ssl: false,
			onconnect: function(){},
			onclose: function(){}
    	};

    	for(i in cfg){
        	if(this.options[i] != undefined){
            	this.options[i] = cfg[i];
        	}
    	}    	

    	this.disabled = false;
    	this.use_fallback = false;
    	this.fallback_errors = 0;
    	if(window.console && window.console.log && window.console.info) this.console_support = true;

    	if(ctx.options["redirect_console"]){
    		try {
    			//Keep the old console to use if necessary
    			if(ctx.console_support){
		    		ctx.consoleHolder = window.console;
		    	}

	    		window.console = {
	    			log: function(){
	    				if(!ctx.disabled){
		    				if(ctx.socket.readyState == 1 || ctx.use_fallback == true){
			    				ctx.log.apply(ctx,arguments);
		    				} else {
		    					ctx.buffer.push({type:"log", value: arguments})
		    				}
	    				}
	    				if(ctx.options["use_browser_console"]==true && ctx.console_support && ( (ctx.socket && ctx.socket.readyState == 1) || ctx.use_fallback == true)) {
	    					try{
		    					ctx.consoleHolder.log.apply(ctx.consoleHolder,arguments);
	    					} catch(e){}
	    				}
	    			},
	    			info: function(){
	    				if(!ctx.disabled){
		    				if(ctx.socket.readyState == 1 || ctx.use_fallback == true){
			    				ctx.info.apply(ctx,arguments);
		    				} else {
		    					ctx.buffer.push({type:"info", value: arguments})
		    				}
		    			}
	    				if(ctx.options["use_browser_console"]==true && ctx.console_support && ( (ctx.socket && ctx.socket.readyState == 1) || ctx.use_fallback == true)) {
	    					try{
		    					ctx.consoleHolder.info.apply(ctx.consoleHolder,arguments);
	    					} catch(e){}
	    				}
	    			},
	    			error: function(){
	    				if(!ctx.disabled){
		    				if(ctx.socket.readyState == 1 || ctx.use_fallback == true){
			    				ctx.error.apply(ctx,arguments);
		    				} else {
		    					ctx.buffer.push({type:"error", value: arguments})
		    				}
		    			}
	    				if(ctx.options["use_browser_console"]==true && ctx.console_support && ( (ctx.socket && ctx.socket.readyState == 1) || ctx.use_fallback == true)) {
	    					try{
		    					ctx.consoleHolder.error.apply(ctx.consoleHolder,arguments);
	    					} catch(e){}
	    				}
	    			},
	    			warn: function(){
	    				if(!ctx.disabled){
		    				if(ctx.socket.readyState == 1 || ctx.use_fallback == true){
		    					ctx.warn.apply(ctx,arguments);
		    				} else {
		    					ctx.buffer.push({type:"warn", value: arguments})
		    				}
		    			}
	    				if(ctx.options["use_browser_console"]==true && ctx.console_support && ( (ctx.socket && ctx.socket.readyState == 1) || ctx.use_fallback == true)) {
	    					try{
		    					ctx.consoleHolder.warn.apply(ctx.consoleHolder,arguments);
	    					} catch(e){}
	    				}
	    			}
	    		};

	    		//If console is not supported we hold our fake console anyway,
	    		//so internal messages will not hang
    			if(!ctx.console_support){
		    		ctx.consoleHolder = window.console;
		    	}
    		} catch(e){
    			alert("ERRO");
    		}
    	}

    	try{
	    	this.socket = new WebSocket((this.options["use_ssl"]?"wss://":"ws://")+this.options["server_url"]+":"+this.options["server_port"],'log-protocol');
	    	this.socket.onopen = function(){
	    		ctx.consoleHolder.info("remoteJS connection success.");
		    	if(ctx.options["onconnect"]){
		    		ctx.options["onconnect"].call(ctx);
		    	}
	    		ctx.proccess_buffer();
	    	};

	    	this.socket.onerror = function(){
	    		ctx.consoleHolder.info("Error connecting on remoteJS.");
	    		ctx.use_fallback = true;
	    		ctx.proccess_buffer();
	    	}

	    	this.socket.onmessage = function(evt){
	    		var received_msg = evt.data;
	    	};

	    	this.socket.onclose = function(){
	    		ctx.consoleHolder.info("RemoteJS connection closed.");
	    		ctx.use_fallback = true;
	    		ctx.proccess_buffer();
		    	if(ctx.options["onclose"]){
		    		ctx.options["onclose"].call(ctx);
		    	}
	    	};    		
    	} catch(e){
    		//Fake readyState, so our fake console will keep using buffer
    		//to log
    		this.socket = {readyState: 0};
    		this.use_fallback = true;
	    	this.proccess_buffer();
    	}

    	var fn = function(message,url,line){
    		var final_message = message;
    		if(typeof message === 'object'){
    			final_message = {
    				message: message.message,
    				lineno: message.lineno,
    				filename: message.filename,    				
    			};
    		}
    		window.console.error(final_message);
    		return false;
    	};

    	if(window.addEventListener){
	    	window.addEventListener("error",function(message,url,line){
	    		return fn(message,url,line);
	    	}, true);
    	} else {
	    	window.attachEvent("onerror",function(message,url,line){
	    		return fn(message,url,line);
	    	});
    	}
    };

    RemoteJS.prototype.send_ajax = function(obj,callback){
		var dados = JSON.stringify(obj);
    	if(window.XDomainRequest){
			var req = new XDomainRequest();
			req.open("POST",(this.options["use_ssl"]?"https://":"http://")+this.options["server_url"]+":"+this.options["server_port"]+"/onerror");
			req.send(dados);
			req.onload = function(ev){
				if(callback){
					callback.call(req,true);
				}
			}
			req.onerror = function(ev){
				if(callback){
					callback.call(req,false);
				}
			}
    	} else if(window.XMLHttpRequest){
			var req = new XMLHttpRequest();
			req.open("POST",(this.options["use_ssl"]?"https://":"http://")+this.options["server_url"]+":"+this.options["server_port"]+"/onerror",true);  
			req.setRequestHeader('Content-Type', 'application/json');
			req.onreadystatechange = function(ev){
				var ret = false;
				if(req.status == 200) 
					ret = true;

				if(callback){
					callback.call(req,ret,ev);
				}
			};
			req.send(dados);    		
    	} else {
			if(callback){
				callback.call(req,false);
			}    		
    	}
    };

    RemoteJS.prototype.proccess_buffer = function(){
    	for(var i=0 ; i < this.buffer.length; i++){
    		var message = this.buffer[i];
    		if(message.type == "info"){
    			console.info.apply(console,message.value);
    		} else if(message.type == "error"){
    			console.error.apply(console,message.value);
    		} else if(message.type == "warn"){
    			console.warn.apply(console,message.value);
    		} else if(message.type == "log"){
    			console.log.apply(console,message.value);
    		}
    	}
    	this.buffer = new Array();
    };

    RemoteJS.prototype.info = function(){
    	for(i=0;i<arguments.length;this.send_log.call(this,"info",arguments[i]),i++);
    };

    RemoteJS.prototype.log = function(){
    	for(i=0;i<arguments.length;this.send_log.call(this,"log",arguments[i]),i++);
    };
    RemoteJS.prototype.warn = function(){
    	for(i=0;i<arguments.length;this.send_log.call(this,"warn",arguments[i]),i++);
    };
    RemoteJS.prototype.error = function(){
    	for(i=0;i<arguments.length;this.send_log.call(this,"error",arguments[i]),i++);
    };

    RemoteJS.prototype.send_log = function(type,msg){
    	var ctx = this;
    	if(this.socket.readyState == 1 || this.use_fallback == true){
    		if(typeof msg !== 'object'){
    			msg = {message:msg};
    		}

	    	var obj = {
	    		app_id: this.options["app_id"],
	    		type: type,
	    		error: msg,
	    		referer: {
	    			host: document.location.host,
	    			hostname: document.location.hostname,
	    			href: document.location.href,
	    			pathname: document.location.pathname,
	    			port: document.location.port,
	    			protocol: document.location.protocol,
	    			search: document.location.search,
	    			hash: document.location.hash
	    		},
	    		userAgent: navigator.userAgent
	    	};

	    	var fn = function(){
	    		//Protect from circular objects
	    		try{
	    			if(!ctx.use_fallback){
		    			ctx.socket.send(JSON.stringify(obj));
	    			} else {
	    				if(ctx.options["enable_legacy_ajax"]){
		    				ctx.send_ajax(obj,function(success,ev){
		    					if(!success){
		    						ctx.fallback_errors++;
		    						if(ctx.fallback_errors > 3){
		    							ctx.disabled = true;
		    						}
			    					ctx.consoleHolder.info("Error using legacy fallback to send error.");
		    					}
		    				});
		    			} else {
							ctx.consoleHolder.info("Legacy fallback system disabled.");
		    			}
	    			}
	    		} catch(e){
	    		}
	    	};

	    	//Check wherever the current browser support canvas and base64 images.
	    	var elem = document.createElement('canvas');
	    	var canvas_support = (elem.getContext && elem.getContext('2d') && elem.toDataURL);
	    	if(type == "error" && ctx.options["screenshot_on_error"] && typeof html2canvas === 'function' && canvas_support){
				html2canvas( [ document.body ], {
				    onrendered: function( canvas ) {
				    	obj["screenshot"] = canvas.toDataURL();
				    	fn();
				    }
				});
	    	} else {
	    		fn();
	    	}
    	}
    };
}).call(this);
