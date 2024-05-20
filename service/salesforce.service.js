const fs = require("fs"); // Importing fs module for file system operations
const axios = require("axios"); // Importing axios for making HTTP requests
const path = require("path"); // Importing path for handling file paths
const jwt = require("jsonwebtoken"); // Importing jwt for token generation and verification

// Importing custom error handler
const { SFerrorHandler } = require("../utils/sfErrorHandeling");

// Function to generate JWT token
const generateToken = async () => {
  const privateKey = fs.readFileSync("SFkeys/server.key", "utf-8"); // Read private key
  const publicKey = fs.readFileSync("SFkeys/server.crt", "utf-8"); // Read public key
  const unixTimestampInSeconds = Math.floor(Date.now() / 1000); // Current timestamp in seconds
  const newTimestampInSeconds = unixTimestampInSeconds + 2 * 3600; // Add two hours to current timestamp
  const payload = {
    iss: process.env.SF_ISS, // Salesforce issuer
    sub: process.env.SF_SUB, // Salesforce subject
    aud: process.env.SF_URL, // Salesforce audience
    exp: newTimestampInSeconds, // Expiry time
  };
  // Create the token
  const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });
  try {
    const isVerified = await verifyToken(token, publicKey); // Verify generated token
    if (isVerified) {
      const data = await getData(token); // Get data using token
      return data;
    } else {
      return false; // Token verification failed
    }
  } catch (error) {
    console.error("Error generating token:", error);
    return false;
  }
};

// Function to verify JWT token
const verifyToken = async (token, publicKey) => {
  try {
    await jwt.verify(token, publicKey, { algorithms: ["RS256"] });
    return true; // Verification successful
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return false; // Verification failed
  }
};

// Function to get data using token
const getData = async (token) => {
  const querystring = require("querystring"); // Importing querystring module
  const { data } = await axios.post(
    `${process.env.SF_URL}services/oauth2/token`,
    querystring.stringify({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: token,
    })
  );
  return data;
};

// Function to generate headers with access token
const generateHeaders = (token) => {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token.access_token}`,
  };
};

// Function to remove undefined values from object
const filterUndefined = (body) => {
  Object.keys(body).forEach((key) => {
    if (body[key] === undefined || body[key] === null || body[key] === "") {
      delete body[key];
    } else if (typeof body[key] == "object") {
      filterUndefined(body[key]);
    }
  });
};

// Function to get file path for mapper
const getMapperPath = (mapperPath) => {
  const paths = path.join(__dirname, "..", "Agent", "DB_SF", mapperPath);
  return paths;
};

// Function to get Terms and Conditions
const getTnc = async (sfId) => {
  try {
    const token = await generateToken();
    const headers = generateHeaders(token);
    const url = `${process.env.SF_API_URL}services/apexrest/getAgreementContent?id=${sfId}`;
    const { data } = await axios.get(url, { headers });
    return data;
  } catch (err) {
    console.error("Error: " + err);
    handleSfError(err);
  }
};

// Function to download Terms and Conditions
const downloadTnc = async (sfId, ip) => {
  try {
    const token = await generateToken();
    const headers = generateHeaders(token);
    const url = `${process.env.SF_API_URL}services/apexrest/getAgreementLink?id=${sfId}&param1=${ip}`;
    const { data } = await axios.get(url, { headers });
    return data;
  } catch (err) {
    console.error("Error: " + err);
    handleSfError(err);
  }
};

// Function to send data to Salesforce
const sendDataToSF = async (body, url) => {
  try {
    const token = await generateToken();
    const headers = generateHeaders(token);
    const data = await axios.post(url, body, { headers });
    return data?.data;
  } catch (err) {
    console.error("Error: " + err);
    handleSfError(err);
  }
};

// Function to update data in Salesforce
const updateDataToSF = async (body, url) => {
  try {
    const token = await generateToken();
    const headers = generateHeaders(token);
    const data = await axios.patch(url, body, { headers });
    return data?.data;
  } catch (err) {
    console.error("Error: " + err);
    handleSfError(err);
  }
};

// Function to send data to Salesforce using mapper
const sendToSF = async (fileName, rawBody) => {
  const flPath = getMapperPath(fileName);
  try {
    const mapper = require(flPath);
    const body = await mapper(rawBody, rawBody.commonId);
    const token = await generateToken();
    const headers = generateHeaders(token);
    const url = `${token.instance_url}/services/data/v55.0/sobjects/${rawBody.url}`;
    const { data } = await axios.patch(url, body, { headers });
    return data;
  } catch (err) {
    console.error("Error: " + err);
    handleSfError(err);
  } finally {
    delete require.cache[require.resolve(flPath)];
  }
};

// Function to get Partner ID from Salesforce
const getPartnerId = async (sfId) => {
  try {
    const token = await generateToken();
    const headers = generateHeaders(token);
    const url = `${process.env.SF_API_URL}services/data/v55.0/sobjects/Account/${sfId}`;
    const { data } = await axios.get(url, { headers });
    return data;
  } catch (err) {
    console.error("Error: " + err);
    handleSfError(err);
  }
};

// Function to get Contact ID from Salesforce
const getContactId = async (sfId) => {
  try {
    const token = await generateToken();
    const headers = generateHeaders(token);
    const url = `${process.env.SF_API_URL}services/data/v55.0/sobjects/Contact/${sfId}`;
    const { data } = await axios.get(url, { headers });
    return data;
  } catch (err) {
    console.error("Error: " + err);
    handleSfError(err);
  }
};

// Function to get data from Salesforce
const getDataFromSF = async (url) => {
  try {
    const token = await generateToken();
    console.log(token);
    const headers = generateHeaders(token);
    const { data } = await axios.get(url, { headers });
    return data;
  } catch (err) {
    console.error("Error: " + err);
    handleSfError(err);
  }
};

// Function to handle Salesforce errors
const handleSfError = (err) => {
  if (err.response) {
    console.log("Error Response", err.response);
    if (err.response.data) {
      console.log("Error Response Data: ", err.response.data);
    }
  } else {
    console.log(err);
  }
};

// Function to get report headers
const getReportHeaders = async () => {
  try {
    const token = await generateToken();
    const headers = generateHeaders(token);
    return {
      ...headers,
      Accept:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  } catch (err) {
    console.error("Error: " + err);
    handleSfError(err);
  }
};

// Function to parse boolean value to "Yes" or "No"
const parseBoolean = (value) => {
  return value ? "Yes" : "No";
};

// Function to get External IDs of documents
const getExternalIdFuncs = () => {
  return {
    getAgentId: async function (id) {
      const agent = await Agent.findOne({ _id: id });
      if (!agent) throw Error("Agent with id" + id + " not found");
      return agent.commonId;
    },
    getStaffId: async function (id) {
      const staff = await Staff.findOne({ _id: id });
      if (!staff) throw Error("Staff with id" + id + " not found");
      return staff.commonId;
    },
  };
};

// Exporting functions and constants
module.exports = {
  parseBoolean,
  getReportHeaders,
  handleSfError,
  filterUndefined,
  sendToSF,
  generateHeaders,
  getMapperPath,
  generateToken,
  getTnc,
  sendDataToSF,
  updateDataToSF,
  downloadTnc,
  getDataFromSF,
  getPartnerId,
  getContactId,
  getExternalIdFuncs,
};
