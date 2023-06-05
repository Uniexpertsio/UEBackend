const Agent = require("../models/Agent");
const Staff = require("../models/Staff");
const { lastValueFrom } = require("rxjs");
const axios = require("axios");

const generateToken = () => {
    const querystring = require("querystring");
    return lastValueFrom(
      axios
        .post(
          "https://test.salesforce.com/services/oauth2/token",
          querystring.stringify({
            grant_type: process.env.SALESFORCE_GRANT_TYPE,
            client_id: process.env.SALESFORCE_CLIENT_ID,
            client_secret: process.env.SALESFORCE_CLIENT_SECRET,
            username: process.env.SALESFORCE_USERNAME,
            password: process.env.SALESFORCE_PASSWORD,
          })
        )
        .pipe(map((res) => res.data))
    );
  }

const getMapperPath = (path)=> {
    path = '/home/ubuntu/uniexpert-mapper/User_Files/Agent/DB_SF/' + path;
    return path;
  }

const generateHeaders = (token)=> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.access_token}`,
    };
  }

  
const sendToSF = async (fileName, rawBody) => {
    const token = await generateToken();
    const headers = this.generateHeaders(token);
    
    let flPath = this.getMapperPath(fileName);
    try {
      let mapper = require(flPath);
      let body = await mapper(rawBody, this.getExternalIdFuncs());
      this.filterUndefined(body.data);
      console.log(`Mapped ${fileName}: `, body);
  
      const url = `${token.instance_url}/services/data/v55.0/sobjects/${body.url}`;
      let retDt = await lastValueFrom(axios.patch(url, body.data, { headers }).pipe(map((res) => res.data)));
    } catch (err) {
      this.handleSfError(err);
    } finally {
      delete require.cache[require.resolve(flPath)];
    }
  }

const filterUndefined = (body) => {
    Object.keys(body).forEach(key => {
      if (body[key] === undefined || body[key] === null || body[key] === '') {
        delete body[key];
      } else if (typeof body[key] == 'object'){
        this.filterUndefined(body[key]);
      }
    });
  }


// Get External IDs of documents
const getExternalIdFuncs = () => {
    return {
      getAgentId: async function (id) {
        const agent = await Agent.findOne({ _id: id });
        if (!agent) throw Error("Agent with id"+ id + " not found");
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