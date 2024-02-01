const config = require("../config/config");
const jwt = require("jsonwebtoken");
const uuid = require("uuid/v4");
const Common = require("./Common");
const nodemailer = require('nodemailer');
const { MappingFiles } = require('./../constants/Agent.constants');
const Document = require("../models/Document");

const Config = require("../models/Config");
const Agent = require("../models/Agent");
const Staff = require("../models/Staff");
const { sendToSF, sendDataToSF } = require("../service/salesforce.service");

const Auth = { get: {}, post: {}, put: {}, patch: {}, delete: {} };


function convertToCompanyData(inputData) {
    const outputData = {
        "RecordTypeId": "0125g0000003I7FAAU",
        "Company_Logo__c": "",
        "Country_Code__c": "+91",
        "Timezone_UTC__c": inputData.personalDetails.timezone.utc_offset,
        "Same_As_Billing_Address__c": false,
        "Timezone_Region__c": inputData.personalDetails.timezone.name,
        "Name": inputData.company.companyName,
        "Lock_Record__c": true,
        "BDM_User__c": "",
        //"Parent": "",
        //"PrimaryContact__r": "",
        "Students_Per_Year__c": inputData.company.studentPerYear.replace("+", ""),
        "CurrencyIsoCode": "GBP",
        "Year_Founded__c": inputData.company.yearFounded,
        "Website": inputData.company.website,
        "MaxActiveUsersAllowed__c": 1,
        "Country__c": inputData.company.country,
        "Phone": inputData.personalDetails.phone,
        "EntityType__c": inputData.company.entityType,
        "Tax_Number__c": inputData.company.taxNumber,
        "Onboarding_Status__c": "New",
        "PartnerNotified__c": false,
        "Bypass_Documentation__c": false,
        "FinalDocumentStatus__c": "Approved",
        "Agreement_signed_time_stamp__c": new Date(),
        "Terms_Conditions_Agreed__c": "",
        "Latitude__c": "",
        "Longitude__c": "",
        "IP_Address__c": "",
        "Acknowledgement_Acceptance__c": false,
        "BillingCity": inputData.address.city,
        "BillingCountry": inputData.address.country,
        "BillingState": inputData.address.state,
        "BillingStreet": inputData.address.address,
        "BillingPostalCode": inputData.address.zipCode,
        "ShippingCity": inputData.address.city,
        "ShippingCountry": inputData.address.country,
        "ShippingState": inputData.address.state,
        "ShippingStreet": inputData.address.address,
        "ShippingPostalCode": inputData.address.zipCode,
        "Type": "Customer",
        "NumberOfEmployees": parseInt(inputData.company.employeeCount),
        "Description": "Description"
    };

    return outputData;
}

function convertToAgentData(inputData, id) {
    const outputData = {
        "RecordTypeId": "0125g00000020HQAAY",
        "FirstName": inputData.personalDetails.firstName,
        "LastName": inputData.personalDetails.lastName,
        "Passport_Number__c": "8787678765",
        "MobilePhone": inputData.personalDetails.phone,
        "Whatsapp_No__c": inputData.company.whatsappId,
        "Email": inputData.personalDetails.email,
        "Gender__c": "Male", // Assuming a default value
        "Birthdate": "2022-07-11", // Assuming a default value
        "Country_of_Citizenship__c": inputData.company.country, // Assuming a default value
        "AccountId": id? id: "001Hy000016qOBKIA2", // Assuming a default value
        //"Partner_Account__c": "001Hy000016qOBKIA2", // Assuming a default value
        "EmergencyContactName__c": inputData.personalDetails.firstName, // Assuming a default value
        "Relationship__c": "Mother", // Assuming a default value
        "EmergencyContactEmail__c": inputData.personalDetails.email, // Assuming a default value
        "Phone": inputData.personalDetails.phone, // Assuming a default value
        "Country__c": inputData.address.country // Assuming a default value
    };

    return outputData;
}


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
		if (!bankFields?.value[req.query.country]) {
			bankFields = { key: "bank_code", value: "Bank Code" };
		} else {
			bankFields = bankFields.value[req.query.country]
		}
		return res.status(200).json({ data: bankFields, statusCode: 200 })
	} catch (err) {
		next(err);
	}
}

Auth.post.login = async (req, res) => {
	try{
	console.log("Request: ", req.body)
	//const tokens = await generateToken();
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
			const docs = await Document.find({userId: agent._id});
						let docUploaded = false;
			if(docs.length > 0) {
				docUploaded = true;
			}
			return res.status(200).json({ data: {docUploaded, ...generateAuthResponse(staff, agent, token)}, statusCode: 200, tokens: token });
		} else {
			res.status(403).json({
				"statusCode": 401,
				"message": "You have entered an invalid email or password",
				"error": "Unauthorized"
			});
		}
	}
	} catch (err) {
		console.log("Request: ", err)
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
		let agent = await Agent.findOne({"personalDetails.email": email});
		if(agent){
			return res.status(400).json({message: "Email already exists"});
		}
		agent = await Agent.findOne({"personalDetails.phone": req.body.personalDetails.phone});
		if(agent){
			return res.status(400).json({message: "Phone number already exists"});
		}
		agent = await Agent.create({ ...agentData, commonId: externalId });
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
		//const sf = await sendToSF(MappingFiles.AGENT_account, { ...agentData, externalId, commonId: agent.commonId, url });
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
		const companyData = convertToCompanyData(req.body);
		const companyUrl = "https://uniexperts--uxuat.sandbox.my.salesforce.com/services/data/v50.0/sobjects/Account";
		const sfCompanyData = await sendDataToSF(companyData, companyUrl);
		console.log("sf company data:  ", sfCompanyData);
		if(sfCompanyData && sfCompanyData.success){
			const agentsData = convertToAgentData(req.body, sfCompanyData.id);
			const agentUrl = "https://uniexperts--uxuat.sandbox.my.salesforce.com/services/data/v50.0/sobjects/Contact";
			const sfAgentData = await sendDataToSF(agentsData, agentUrl);
			console.log("sf agent data:  ", sfAgentData);
		}
		
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
