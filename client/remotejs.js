var RemoteJS;

(function(){
	RemoteJS = function(cfg){
    	var ctx = this;
		cfg = cfg || {};

		this.buffer = new Array();

		this.options = {
			server_url: "",
			server_port: "",
			redirect_console: false,
			onconnect: function(){}
    	};

    	for(i in cfg){
        	if(this.options[i] != undefined){
            	this.options[i] = cfg[i];
        	}
    	}

    	if(ctx.options["redirect_console"]){
    		try {
	    		ctx.consoleHolder = window.console;
	    		window.console = {
	    			log: function(){
	    				if(ctx.socket.readyState == 1){
		    				ctx.log.apply(ctx,arguments);
	    				} else {
	    					ctx.buffer.push({type:"log", value: arguments})
	    				}
	    			},
	    			info: function(){
	    				if(ctx.socket.readyState == 1){
		    				ctx.info.apply(ctx,arguments);
	    				} else {
	    					ctx.buffer.push({type:"info", value: arguments})
	    				}
	    			},
	    			error: function(){
	    				if(ctx.socket.readyState == 1){
		    				ctx.error.apply(ctx,arguments);
	    				} else {
	    					ctx.buffer.push({type:"error", value: arguments})
	    				}
	    			},
	    			warn: function(){
	    				if(ctx.socket.readyState == 1){	    				
	    					ctx.warn.apply(ctx,arguments);
	    				} else {
	    					ctx.buffer.push({type:"warn", value: arguments})
	    				}
	    			}
	    		};
    		} catch(e){}
    	}

    	try{
	    	this.socket = new WebSocket("ws://"+this.options["server_url"]+":"+this.options["server_port"],'log-protocol');
	    	this.socket.onopen = function(){
	    		ctx.consoleHolder.info("Conexão com remoteJS estabelecida.");
		    	if(ctx.options["onconnect"]){
		    		ctx.options["onconnect"].call(ctx);
		    	}
	    		ctx.proccess_buffer();
	    	};

	    	this.socket.onerror = function(){
	    		ctx.consoleHolder.info("Erro ao conectar com remoteJS.");
	    		window.console = ctx.consoleHolder;
	    		ctx.proccess_buffer();
	    	}

	    	this.socket.onmessage = function(evt){
	    		var received_msg = evt.data;
	    	};

	    	this.socket.onclose = function(){
	    		ctx.consoleHolder.info("Conexão com remoteJS fechada.");
	    		window.console = ctx.consoleHolder;
	    		ctx.proccess_buffer();
	    	};    		
    	} catch(e){
    		window.console = ctx.consoleHolder;
    		ctx.proccess_buffer();
    		this.socket = {readyState: 0};
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
    	if(this.socket.readyState == 1){
	    	var obj = {
	    		type: type,
	    		message: msg,
	    		referer: document.location
	    	};
	    	this.socket.send(JSON.stringify(obj));
    	}
    };
}).call(this);