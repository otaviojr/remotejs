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
	var msg = obj.app_id + options.field_separator + obj.date.toJSON() + options.field_separator + type+ options.field_separator + obj.remoteAddress + options.field_separator + obj.userAgent + options.field_separator + obj.referer.href + options.field_separator + obj.error.message+ options.field_separator +(obj.error.filename?obj.error.filename:"")+options.field_separator+(obj.error.lineno?obj.error.lineno:0);
	file.write(msg+"\r\n");
}