const mongoose = require("mongoose");
mongoose.set("bufferCommands", false);
const config = require("../config/config");
let { username, password, host, port, database } = config.db;

const callbacks = {
	onsuccess: (connection) => {
		console.log(`Connected to database ${connection.name}`);
	},
	onerror: (err) => {
		console.log("err", err);
	},
};

module.exports = function (cbs = callbacks) {
	console.log("→ Connecting to database...");
	let mongoUri = "mongodb+srv://dbuser:Password123@atlascluster.ziipicy.mongodb.net/uniexpertsdb?retryWrites=true&w=majority";
	//let mongoUri = `mongodb://localhost:27017/projectdb`;
	mongoose.connect(mongoUri);
	mongoose.set('useNewUrlParser', true);
	// mongoose.set('useFindAndModify', false);
	mongoose.set('useCreateIndex', true);
	mongoose.set('useUnifiedTopology', true);
	const conn = mongoose.connection;
	conn.on("error", (err) => {
		cbs.onerror(err);
	});
	conn.once("open", function () {
		cbs.onsuccess(conn);
	});
};
