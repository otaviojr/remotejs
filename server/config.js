exports.options = {
	listen: '198.58.104.21',
	ports: [{port:80,ssl:false},{port:443,ssl:true}],
	static_files: "/sites/remotejs/static",
	ssl_info: {
		ssl_enabled: false,
		private_key: "/etc/ssl/otavioeng/privatekey.pem",
		certificate: "/etc/ssl/otavioeng/certificate.pem"
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
			filename: "/sites/remotejs/logs/remotejs.log",
			field_separator: "\t"
		}
		}
};