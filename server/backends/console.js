var options;

exports.init = function(config){
	options = config;
	if(options.enabled == true){
		console.log("Console backend started");
	}
};

exports.log = function(obj){
	var final_message = obj.error.message;	
	if(obj.type == "error"){
		console.error(obj.remoteAddress + ": " + final_message);
	} else if(obj.type == "warn"){
		console.warn(obj.remoteAddress + ": " + final_message);
	} else if(obj.type == "info"){
		console.info(obj.remoteAddress + ": " + final_message);
	} else if(obj.type == "log"){
		console.log(obj.remoteAddress + ": " + final_message);
	}
}