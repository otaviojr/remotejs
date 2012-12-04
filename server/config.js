exports.options = {
	listen: '#IP TO LISTEN#',
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
			filename: "/path_to/remotejs.log",
			field_separator: "\t"
		}
		}
};