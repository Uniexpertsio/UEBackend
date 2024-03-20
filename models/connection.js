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
	//let mongoUri = "mongodb+srv://dbprod:DNvQck1UZMhMxO0z@alphaue.khpxu.mongodb.net/uniexperts?retryWrites=true&w=majority&appName=AlphaUE";
	// let mongoUri = "mongodb+srv://dbprod:DNvQck1UZMhMxO0z@cluster0.khpxu.mongodb.net/uniexperts?retryWrites=true&w=majority&appName=Cluster0";
	mongoose.connect(mongoUri);
	const conn = mongoose.connection;
	conn.on("error", (err) => {
		cbs.onerror(err);
	});
	conn.once("open", function () {
		cbs.onsuccess(conn);
	});
};
