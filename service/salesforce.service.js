const Agent = require("../models/Agent");
const Staff = require("../models/Staff");
const axios = require("axios");

// # client_id :-3MVG9z6NAroNkeMkQIYXpSeRyrHQJBbNMH21xAcoifdreqdFHYR8fLkvuY3gk_J1_Whm2yTcL5ayH1fZEKs2c
// # client_secret :- EA815585901C63B5DD57335043FA94957708F3D7B4BD7B6F53908E739ED6A921
// # username :- ashok1@uniexperts.io.uxuat
// # password :-Rathi$1949
// # grant_type :-password

const generateToken = async () => {
  const querystring = require("querystring");

  const { data } = await axios
    .post(
      "https://test.salesforce.com/services/oauth2/token",
      querystring.stringify({
        grant_type: "password",
        client_id: "3MVG9z6NAroNkeMkQIYXpSeRyrHQJBbNMH21xAcoifdreqdFHYR8fLkvuY3gk_J1_Whm2yTcL5ayH1fZEKs2c",
        client_secret: "EA815585901C63B5DD57335043FA94957708F3D7B4BD7B6F53908E739ED6A921",
        username: "ashok1@uniexperts.io.uxuat",
        password: "Xperts@2023"
      })
    )
  return data;
}

const getMapperPath = (path) => {
  path = 'D:\\pg\\visa_backend-main\\Agent\\DB_SF\\' + path;
  return path;
}

const generateHeaders = (token) => {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token.access_token}`,
  };
}

const filterUndefined = (body) => {
  Object.keys(body).forEach(key => {
    if (body[key] === undefined || body[key] === null || body[key] === '') {
      delete body[key];
    } else if (typeof body[key] == 'object') {
      filterUndefined(body[key]);
    }
  });
}


const sendToSF = async (fileName, rawBody) => {
  const token = await generateToken();
  const headers = generateHeaders(token);

  let flPath = getMapperPath(fileName);

  try {
  //console.log("rawbody: ", rawBody)
    const mapper = require(flPath)
    let body = await mapper(rawBody, rawBody.commonId);
    //   const data1 = {
    //     "RecordType":{
    //          "Name":"Partner"},
    //    "FirstName": "Testing Postman",
    //    "LastName": "Integration",
    //    "Source__c": "Sales",
    //    "Passport_Number__c": "8787678ui765aw",
    //    "MobilePhone": "+917876567876",
    //    "Whatsapp_No__c": "+917876567876",
    //    "Preferred_Country__c": "Austria;Cyprus",
    //    "Email": "ank@gmail.com",
    //    "Medical_History_Detail__c": "sjkchsduiwv",
    //    "Medical_History__c": "No",
    //    "Martial_Status__c": "Married",
    //    "Gender__c": "Male",
    //    "Birthdate": "2022-07-11",
    //    "First_Language__c": "iohdwef",
    //    "Country_of_Citizenship__c": "Albania",
    //    "Account": {
    //        "ExternalId__c" :"2573t236423ev"
    //    },
    //  "Partner_Account__r": {
    //        "ExternalId__c" :"juytf567"
    //    },
    //    "EmergencyContactName__c": "dcvderfverw",
    //    "Relationship__c": "Mother",
    //    "EmergencyContactEmail__c": "ank@gmail.com",
    //    "Phone": "8987678987",
    //    "Country__c": "Aland Islands",
    //    "Have_you_been_refused_a_visa__c": "No",
    //    "Do_you_have_a_valid_Study_Permit_Visa__c": "No",
    //    "Study_Permit_Visa_Details__c": "wefwer"
    //  }

   // filterUndefined(body);
    console.log(`Mapped ${fileName}: `, body);

    const url = `${token.instance_url}/services/data/v55.0/sobjects/${rawBody.url}`;
   const { data } = await axios.patch(url, body, { headers });
   return data;
  } catch (err) {
    console.error("Error: " + err);
    handleSfError(err);
  } finally {
    delete require.cache[require.resolve(flPath)];
  }
}


// Get External IDs of documents
const getExternalIdFuncs = () => {
  return {
    getAgentId: async function (id) {
      const agent = await Agent.findOne({ _id: id });
      if (!agent) throw Error("Agent with id" + id + " not found");
      return agent.commonId;
    }
  }
}

const handleSfError = (err) => {
  if (err.response) {
    console.log('Error Response', err.response);
    if (err.response.data) {
      console.log('Error Response Data: ', err.response.data);
    }
  } else {
    console.log(err);
  }
}

const getReportHeaders = async () => {
  const token = await generateToken();
  const headers = generateHeaders(token);
  return { ...headers, "Accept": 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
}


const parseBoolean = (value) => {
  return value ? "Yes" : "No";
}

module.exports = {
  parseBoolean,
  getReportHeaders,
  handleSfError,
  getExternalIdFuncs,
  filterUndefined,
  sendToSF,
  generateHeaders,
  getMapperPath,
  generateToken
}