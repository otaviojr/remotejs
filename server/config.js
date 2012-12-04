exports.options = {
	listen: '198.58.104.21',
	port: 80,
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