var fs = require("fs");

var options;
var file;

exports.init = function(config){
	options = config;
	if(options.enabled == true){
		console.log("Logfile backend started");		
		file = fs.createWriteStream(options.filename,{ flags: 'a+', encoding: "utf-8", mode: 0666 });
	}
};

exports.log = function(obj){
	var type = "";
	if(obj.type == "error"){
		type="ERROR";
	} else if(obj.type == "warn"){
		type="WARN";
	} else if(obj.type == "info"){
		type="INFO";
	} else if(obj.type == "log"){
		type="LOG";
	} else {
		type="UNKNOWN";
	}
	
	var msg = obj.date.toJSON() + "-"+type+"-" + obj.remoteAddress + "-" + obj.referer.href + "-" + obj.message;
	file.write(msg+"\r\n");
}