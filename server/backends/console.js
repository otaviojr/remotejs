var options;

exports.init = function(config){
	options = config;
	if(options.enabled == true){
		console.log("Console backend started");
	}
};

exports.log = function(obj){
	if(obj.type == "error"){
		console.error(obj.remoteAddress + ": " + obj.message)
	} else if(obj.type == "warn"){
		console.warn(obj.remoteAddress + ": " + obj.message)
	} else if(obj.type == "info"){
		console.info(obj.remoteAddress + ": " + obj.message)
	} else if(obj.type == "log"){
		console.log(obj.remoteAddress + ": " + obj.message)
	}
}