module.exports = (port) => {
	let https = require("https")
	let express = require("express")
	let cors = require("cors")
	let app = express();
	port = port || 5000;
	let authRoute = require("./routes/auth.routes");
	let agentRoute = require("./routes/agent.routes");
	let documentRoute = require("./routes/document.routes");
	let documentTypeRoute = require("./routes/documentType.routes");
	let educationRoute = require("./routes/education.routes");
	let taskRoute = require("./routes/task.routes");
	let schoolRoute = require("./routes/school.routes");
	let currencyRoute = require("./routes/currency.routes");
	let programRoute = require("./routes/program.routes");
	let studentRoute = require("./routes/student.routes");
	let staffRoute = require("./routes/staff.routes");
	let intakeRoute = require("./routes/intake.routes");
	let testScoreRoute = require("./routes/testScore.routes");
	let applicationRoute = require("./routes/application.routes");
	let salesforceSyncRoute = require("./routes/salesforcesync.routes");
	let paymentRoute = require("./routes/payment.routes");
	let reportRoute = require("./routes/report.routes");
	let interviewRoute = require("./routes/interview.routes");
	let commissionRoute = require("./routes/commission.routes");
	let commissionTypeRoute = require("./routes/commissionType.routes");
	let invoiceRoute = require("./routes/invoice.routes");
	let dashboardRoute = require("./routes/dashboard.routes");
	let notificationRoute = require("./routes/notification.routes");
	let caseRoute = require("./routes/case.routes");

	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));
	app.use(cors());

	app.get("/.well-known/pki-validation/", (req, res)=> {
		res.sendFile("/home/ubuntu/uniexperts/135E4208EB87E2EF47A307C964E7C1F3.txt")
	})

	app.get("/health-check", (req, res)=> {
		res.status(200).json({msg: "Chill bro! Server is up!"})
	})

	app.use("/api/auth", authRoute);
	app.use("/api/agent", agentRoute);
	app.use("/api/document", documentRoute);
	app.use("/api/document-type", documentTypeRoute);
	app.use("/api/education", educationRoute);
	app.use("/api/task", taskRoute);
	app.use("/api/school", schoolRoute);
	app.use("/api/currency", currencyRoute);
	app.use("/api/program", programRoute);
	app.use("/api/student", studentRoute);
	app.use("/api/staff", staffRoute);
	app.use("/api/intake", intakeRoute);
	app.use("/api/test-score", testScoreRoute);
	app.use("/api/application", applicationRoute);
	app.use("/api/salesforce", salesforceSyncRoute);
	app.use("/api/payment", paymentRoute);
	app.use("/api/report", reportRoute);
	app.use("/api/interview", interviewRoute);
	app.use("/api/commission", commissionRoute);
	app.use("/api/commission", commissionTypeRoute);
	app.use("/api/invoice", invoiceRoute);
	app.use("/api/dashboard", dashboardRoute);
	app.use("/api/notification", notificationRoute);
	app.use("/api/case", caseRoute);

	app.use( (req, res, next) => {
		res.status(404).send({
			message: "No such api endpoint found.",
		});
	});

	/* error handler */
	app.use((err, req, res, next) => {
		// set locals, only providing error in development
		res.locals.message = err.message;
		res.locals.error = req.app.get("env") === "development" ? err : {};
		// render the error page
		res.status(err.status || 500).json({
			message: res.locals.message,
		});
	});

	app.set("trust proxy", true);
	app.set("port", port);

	app.listen(port, () => {
		console.table({ Status: "HTTP Server running", Environment: process.env.NODE_ENV, Port: port });
	});
};
