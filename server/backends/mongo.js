var options;
var mongoose;
var db;

var messageSchema;
var Message;

exports.init = function(config){
	options = config;
	if(options.enabled == true){
		console.log("Mongo backend started");
		mongoose = require("mongoose");
		db = mongoose.createConnection('mongodb://'+options.host+'/'+options.database);

		messageSchema = new mongoose.Schema({
			type: String,
			origin: String,
			remoteAddress: String,
			message: String,
			referer: Object,
			date: Date,
			userAgent: String,
			screenshot: String
		});
		
		Message = db.model('Message', messageSchema);
	}
};

exports.log = function(obj){
	var message = new Message(obj);
	message.save(function(err,message){
		if(err){
			console.log("MongoDB: Error when saving message");
		}
		console.log(message);
	});
}
