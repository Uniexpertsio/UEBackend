const Agent = require("../models/Agent");
const Staff = require("../models/Staff");
const axios = require("axios");
const path = require("path");
const jwt = require("jsonwebtoken");
// # client_id :-3MVG9z6NAroNkeMkQIYXpSeRyrHQJBbNMH21xAcoifdreqdFHYR8fLkvuY3gk_J1_Whm2yTcL5ayH1fZEKs2c
// # client_secret :- EA815585901C63B5DD57335043FA94957708F3D7B4BD7B6F53908E739ED6A921
// # username :- ashok1@uniexperts.io.uxuat
// # password :-Rathi$1949
// # grant_type :-password

const generateToken = async () => {
  const privateKey = fs.readFileSync("SFkeys/server.key", "utf-8");
  const publicKey = fs.readFileSync("SFkeys/server.crt", "utf-8");
  const unixTimestampInSeconds = Math.floor(Date.now() / 1000);
  // Add two hours (2 * 3600 seconds) to the timestamp
  const newTimestampInSeconds = unixTimestampInSeconds + 2 * 3600;
  const payload = {
    iss:process.env.SF_ISS,
    sub:process.env.SF_SUB,
    aud:process.env.SF_URL,
    exp: newTimestampInSeconds,
  };
  // // Create the token
  const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });
  try {
    const isVerified = await verifyToken(token, publicKey);
    if (isVerified) {
      const data = await getData(token);
      return data;
    } else {
      return false; // Token verification failed
    }
  } catch (error) {
    console.error("Error generating token:", error.message);
    return false;
  }
};

const verifyToken = async (token, publicKey) => {
  try {
    await jwt.verify(token, publicKey, { algorithms: ["RS256"] });
    return true; // Verification successful
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return false; // Verification failed
  }
};

const getData = async (token) => {
  const querystring = require("querystring");
  const { data } = await axios.post(
    `${process.env.SF_URL}services/oauth2/token`,
    querystring.stringify({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: token,
    })
  );
  return data;
};

const getMapperPath = (mapperPath) => {
  const paths = path.join(__dirname, "..", "Agent", "DB_SF", mapperPath);
  return paths;
};

const generateHeaders = (token) => {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token.access_token}`,
  };
};

const filterUndefined = (body) => {
  Object.keys(body).forEach((key) => {
    if (body[key] === undefined || body[key] === null || body[key] === "") {
      delete body[key];
    } else if (typeof body[key] == "object") {
      filterUndefined(body[key]);
    }
  });
};

const getTnc = async (sfId) => {
  try {
    const token = await generateToken();
    const headers = generateHeaders(token);
    const url = `https://uniexperts--uxuat.sandbox.my.salesforce.com/services/apexrest/getAgreementContent?id=${sfId}`;
    const { data } = await axios.get(url, { headers });
    return data;
  } catch (err) {
    console.error("Error: " + err);
    handleSfError(err);
  }
};

const downloadTnc = async (sfId) => {
  try {
    const token = await generateToken();
    const headers = generateHeaders(token);
    const url = `https://uniexperts--uxuat.sandbox.my.salesforce.com/services/apexrest/getAgreementLink?id=${sfId}&param1=122.161.29.89`;
    const { data } = await axios.get(url, { headers });
    return data;
  } catch (err) {
    console.error("Error: " + err);
    handleSfError(err);
  }
};

const sendDataToSF = async (body, url) => {
  const token = await generateToken();
  const headers = generateHeaders(token);
  try {
    const { data } = await axios.post(url, body, { headers });
    return data;
  } catch (err) {
    console.error("Error: " + err);
    handleSfError(err);
  }
};

const updateDataToSF = async (body, url) => {
  const token = await generateToken();
  const headers = generateHeaders(token);
  try {
    const { data } = await axios.patch(url, body, { headers });
    return data;
  } catch (err) {
    console.error("Error: " + err);
    handleSfError(err);
  }
};

const sendToSF = async (fileName, rawBody) => {
  const token = await generateToken();
  const headers = generateHeaders(token);

  let flPath = getMapperPath(fileName);

  try {
    const mapper = require(flPath);
    let body = await mapper(rawBody, rawBody.commonId);
    // filterUndefined(body);
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

// Get External IDs of documents
const getExternalIdFuncs = () => {
  return {
    getAgentId: async function (id) {
      const agent = await Agent.findOne({ _id: id });
      if (!agent) throw Error("Agent with id" + id + " not found");
      return agent.commonId;
    },
  };
};

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

const getReportHeaders = async () => {
  const token = await generateToken();
  const headers = generateHeaders(token);
  return {
    ...headers,
    Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
};

const parseBoolean = (value) => {
  return value ? "Yes" : "No";
};

module.exports = {
  parseBoolean,
  getReportHeaders,
  handleSfError,
  getExternalIdFuncs,
  filterUndefined,
  sendToSF,
  generateHeaders,
  getMapperPath,
  generateToken,
  getTnc,
  sendDataToSF,
  updateDataToSF,
  downloadTnc,
};
