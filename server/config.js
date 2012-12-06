exports.options = {
	listen: '<<IP ADDRESS TO LISTEN>>',
	ports: [{port:8080,ssl:false},{port:8081,ssl:true}],
	static_files: "/path_to/static",
	ssl_info: {
		ssl_enabled: false,
		private_key: "/path_to/privatekey.pem",
		certificate: "/path_to/certificate.pem"
	},
	backend: {
		"console":{
			enabled: false
		},
		"mongo":{
			enabled: true,
			host: "localhost",
			database: "remotejs"
		},
		"logfile":{
			enabled: true,
			filename: "/path_to/remotejs.log",
			field_separator: "\t"
		}
		}
};