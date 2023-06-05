const Staff = require("../models/Staff");
const config = require("../config/config");

async function generateToken(id, email){
    const token = await jwt.sign(
		{
			id,
			email
		},
		config.keys.secret,
		{
			expiresIn: "24d",
		}
	);

    return token;
}

function generateAuthResponse(staff, agent, token) {
	return {
	  token: token,
	  isDocumentsRequired: agent.documents.length === 0,
	  isTncAccepted: agent.tncMeta?.isAccepted ?? false,
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

  async function generateStaffResponseFromId(id, agent) {
	const staff = await Staff.findById(id);
	return generateAuthResponse(staff, agent, await generateToken(id, staff.email))
  }

  module.exports = {
    generateAuthResponse,
    generateToken,
	generateStaffResponseFromId
  }