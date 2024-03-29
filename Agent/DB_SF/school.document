// This is an Example
// db will contain current object according to database structure
// funcs will contain helper functions to retrieve External IDs, it is mandatory to use await before calling any functions.

module.exports = async function (db, funcs) {
    return {
        AccountId: await funcs.getAgentId(db.agentId),
        FirstName: db.fullName,
        LastName: db.fullName,
        MobilePhone: db.phone,
        Partner_Account__c: "Hello 123",
        Email: db.email,
        RecordType: {
            Name: "Partner"
        }
    };
};


// Available funcs
/*
    getAgentId()
*/