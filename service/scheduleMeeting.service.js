const uuid = require("uuid");
const { sendToSF, sendDataToSF } = require("./salesforce.service");
const Staff = require("../models/Staff");
const Agent = require("../models/Agent");
const ScheduleMeeting = require("../models/scheduleMeeting");

class ScheduleMeetingService {

    converttoSfBody(data) {
        const convertedData = {
            "WhatId": "0016D00000vSgq0QAC", //Account ID '001'
            "Subject": data.title,
            "OwnerId": data.creatorId, //to whom task is assigned (USER)
            "ActivityDate": data.startTime, //Due Date
            "Description": data.description, //Comments
            "Reason__c": data.reason, //Onboarding Related, Support, Know the Platform
            "Preferred_Time_Period__c": data.endTime, //Date + Prefered Time 
            "Status": "Not Started",
            "Priority": "Normal"
        }
        return convertedData;
    }

    async createMeeting(agentId, data) {
        const agent = await Agent.findOne({ _id: agentId });
        if (agent) { return "agent not found"; }
        const meeting = await ScheduleMeeting.create({
            ...data,
            creatorId: agentId,
        });
        const convertedData = this.converttoSfBody(data)
        // console.log("\n\nStudent Data: " + JSON.stringify(convertedData)+"\n\n\n\n")
        const url = `${process.env.SF_OBJECT_URL}Task`;
        const sfResponse = await sendDataToSF(convertedData, url);
        console.log("sfStudentResponse::: ", sfResponse);
        if (sfResponse?.id) {
            await ScheduleMeeting.findOneAndUpdate(
                { _id: meeting._id },
                { $set: { salesforceId: sfResponse.id } },
                { new: true })
        }
        return { id: meeting._id, sf: sfResponse };
    }
}


module.exports = ScheduleMeetingService;
