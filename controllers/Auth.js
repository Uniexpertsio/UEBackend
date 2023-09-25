const config = require("../config/config");
const jwt = require("jsonwebtoken");
const uuid = require("uuid/v4");
const Common = require("./Common");
const nodemailer = require('nodemailer');
const { MappingFiles } = require('./../constants/Agent.constants');

const Config = require("../models/Config");
const Agent = require("../models/Agent");
const Staff = require("../models/Staff");
const { sendToSF, generateToken } = require("../service/salesforce.service");

const Auth = { get: {}, post: {}, put: {}, patch: {}, delete: {} };

Auth.get.background = async (req, res, next) => {
	try {
		const config = await Config.findOne({ type: "AUTH_BACKGROUND_IMG" })
		return res.status(200).json({ statusCode: 200, data: config })
	} catch (err) {
		next(err);
	}
}

Auth.get.config = async (req, res, next) => {
	try {
		let bankFields = await Config.findOne({ type: "AUTH_BACKGROUND_IMG" });
		if (!bankFields) {
			bankFields = { key: "bank_code", value: "Bank Code" };
		} else {
			bankFields = bankFields[req.query.country]
		}
		return res.status(200).json({ data: bankFields, statusCode: 200 })
	} catch (err) {
		next(err);
	}
}

Auth.post.login = async (req, res) => {
	try{
		const tokens = await generateToken();
	const email = req.body.email;
	const password = req.body.password;
	let staff = await Staff.findOne({ email: email });
	let agent = await Agent.findOne({ "personalDetails.email": email });
	if (!(staff && agent)) {
		throw new Error("User does not exist")
	} else {
		let matched = Common.comparePassword(staff.password, password);
		if (matched) {
			const token = jwt.sign(
				{
					id: staff._id,
					email: email
				},
				config.keys.secret,
				{
					expiresIn: "24d",
				}
			);
			let loggedInMessage = `${staff.email} logged in at ${req.x_request_ts} [${req.ip}]`.green;

			return res.status(200).json({ data: generateAuthResponse(staff, agent, token), statusCode: 200, tokens: token });
		} else {
			res.status(403).json({
				"statusCode": 401,
				"message": "You have entered an invalid email or password",
				"error": "Unauthorized"
			});
		}
	}

	} catch (err) {

		return res.status(400).json({
			"statusCode": 400,
			"message": err.message,
			"error": "Bad Request"
		})
	}
};


Auth.post.signup = async (req, res, next) => {
	try {
		const externalId = uuid();
		const agentData = req.body;
		const email = req.body.personalDetails.email;
		const agent = await Agent.create({ ...agentData, commonId: externalId });
		const externalStaffId = uuid();
		const staff = await Staff.create({
			fullName: agentData.personalDetails.firstName + " " + agentData.personalDetails.lastName,
			email: agentData.personalDetails.email,
			phone: agentData.personalDetails.countryCode + agentData.personalDetails.phone,
			password: agentData.password,
			role: "admin",
			modules: ["program_schools", "students", "applications", "financial", "generate_report", "interview",
			],
			externalId: externalStaffId,
			agentId: agent._id,
			password: await Common.hashPassword(agentData.password),
			notifications: {
				student: true,
				comments: true,
				commissions: true,
				agent: true,
				case: true,
				invoice: true,
				application: true,
				payments: true,
				schools: true,
				intake: true,
				document: true,
			},
		});
		const url = "Contact/ExternalId__c/2573t236423e";
		const sf = await sendToSF(MappingFiles.AGENT_account, { ...agentData, externalId, commonId: agent.commonId, url });
		const token = jwt.sign(
			{
				id: staff._id,
				email: email
			},
			config.keys.secret,
			{
				expiresIn: "24d",
			}
		);
			//console.log("sf::: ", sf);
		// sf:  { id: '0036D00000mEoFiQAK', success: true, errors: [], created: false }

		return res.status(200).json({ data: generateAuthResponse(staff, agent, token), statusCode: 201 });

	} catch (err) {

		return res.status(400).json({
			"statusCode": 400,
			"message": err.message,
			"error": "Bad Request"
		})
	}
};

Auth.post.emailExist = async (req, res) => {
	const staff = await Staff.findOne({ email: req.body.email });
	if (staff) {
		return res.status(200).json({ data: true, statusCode: 200 });
	} else {
		return res.status(200).json({ data: false, statusCode: 200 });
	}
}

Auth.post.forgotPassword = async (req, res) => {
	const otp = Math.floor(Math.random() * 9000) + 1000;
	const result = await Staff.findOneAndUpdate(
		{ email: req.body.email.toLowerCase().trim() },
		{ $set: { passwordResetOtp: otp } }
	);

	let mailTransporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'tset4598t@gmail.com',
			pass: 'bzvvmohfxolkhnuj'
		}
	});

	let mailDetails = {
		from: 'tset4598t@gmail.com',
		to: req.body.email,
		subject: 'Verify Otp',
		text: 'Your otp to verify is ' + otp
	};

	mailTransporter.sendMail(mailDetails, function (err, data) {
		if (err) {
			console.log('Error Occurs');
		} else {
			console.log('Email sent successfully');
		}
	});

	return res.status(200).json({ statusCode: 200 });
};

Auth.post.verifyOtp = async (req, res) => {
	const staff = await Staff.findOne({
		email: req.body.email.toLowerCase().trim(),
		passwordResetOtp: req.body.otp,
	});

	if (staff) {
		return res.status(200).json({ statusCode: 200 });
	} else {
		return res.status(200).json({
			"statusCode": 403,
			"message": "OTP is invalid",
			"error": "Forbidden"
		});
	}
}

Auth.post.resetPassword = async (req, res) => {
	const staff = await Staff.findOneAndUpdate(
		{ email: req.body.email.toLowerCase().trim() },
		{
			$set: {
				password: await Common.hashPassword(req.body.password),
				passwordResetOtp: null,
			},
		}
	);

	let agent = await Agent.findOne({ "personalDetails.email": req.body.email });

	const token = jwt.sign(
		{
			id: staff._id,
		},
		config.keys.secret,
		{
			expiresIn: "24d",
		}
	);

	if (staff) {
		return res.status(200).json({ data: generateAuthResponse(staff, agent, token), statusCode: 200 });
	} else {
		return res.status(200).json({
			"statusCode": 403,
			"message": "OTP is invalid",
			"error": "Forbidden"
		});
	}
}


Auth.get.tnc = async (req, res) => {
	const tnc = await await Config.findOne({ type: "AUTH_TNC" })
	return res.status(200).json({ data: tnc, statusCode: 200 });
}


Auth.get.profile = async (req, res) => {
	let staff = await Staff.findOne({ email: req.user.email });
	let agent = await Agent.findOne({ "personalDetails.email": req.user.email });
	const token = jwt.sign(
		{
			id: staff._id,
			email: staff.email
		},
		config.keys.secret,
		{
			expiresIn: "24d",
		}
	);
	return res.status(200).json({ data: generateAuthResponse(staff, agent, token), statusCode: 200 });

}

function generateAuthResponse(staff, agent, token) {
	return {
		token: token,
		isDocumentsRequired: agent.documents.length === 0,
		isTncAccepted: agent.tncMeta ? (agent.tncMeta.isAccepted ? agent.tncMeta.isAccepted : false) : false,
		status: agent.verificationStatus,
		details: {
			name: staff.fullName,
			email: staff.email,
			phone: staff.phone,
			country: agent.address.country,
			companyName: agent.company.companyName,
		},
		staff: {
			id: staff.id,
			agentId: staff.agentId,
			isActive: staff.isActive,
			role: staff.role,
			modules: staff.modules,
			dp: staff.dp,
		},
	};
}

module.exports = Auth;
