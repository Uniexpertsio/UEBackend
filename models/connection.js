const mongoose = require("mongoose");
const dotenv = require("dotenv");
mongoose.set("bufferCommands", false);
const config = require("../config/config");
let { username, password, host, port, database } = config.db;
dotenv.config();

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
	// let mongoUri = "mongodb+srv://dbuser:Password123@atlascluster.ziipicy.mongodb.net/uniexpertsdb?retryWrites=true&w=majority";
	mongoose.connect(process.env.MONGO_URI);
	const conn = mongoose.connection;
	conn.on("error", (err) => {
		cbs.onerror(err);
	});
	conn.once("open", function () {
		cbs.onsuccess(conn);
	});
};
