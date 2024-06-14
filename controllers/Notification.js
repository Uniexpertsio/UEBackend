const {
  addNotification,
  getNotifications,
  getNotification,
  dismissNotification,
} = require("../service/notification.service");
const { getDataFromSF } = require("../service/salesforce.service");

function addApplication(req, res) {
  const { id } = req.user;
  const body = req.body;
  addNotification(id, body)
    .then(() => res.status(201).send())
    .catch((error) => res.status(500).json({ error: error.message }));
}

function getApplications(req, res) {
  const { id, agentId } = req.user;
  const query = req.query;
  getNotifications(id, agentId, query)
    .then((notifications) => res.status(200).json(notifications))
    .catch((error) => res.status(500).json({ error: error.message }));
}

async function getNotificationController(req, res) {
  try {
    // const { id, agentId } = req.user;
    const url = `${process.env.SF_API_URL}services/data/v55.0/query?q=SELECT+Id,Name,CreatedDate,CreatedById,SystemModstamp,Contact__c,Student__c,Application__c,Account__c,Subject__c,Body__c,Contact_Name__c+FROM+Bell_Notification__c+WHERE+Contact__c+=+'003Hy00000vXrXqIAK'`;
    const result = await getDataFromSF(url);
    res.status(200).json(result?.records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

function getOneNotification(req, res) {
  const id = req.params.id;
  getNotification(id)
    .then((notification) => res.status(200).json(notification))
    .catch((error) => res.status(500).json({ error: error.message }));
}

function dismissOneNotification(req, res) {
  const id = req.params.id;
  dismissNotification(id)
    .then(() => res.status(200).send())
    .catch((error) => res.status(500).json({ error: error.message }));
}

module.exports = {
  addApplication,
  getApplications,
  getNotificationController,
  getOneNotification,
  dismissOneNotification,
};
