const { addNotification, getNotifications, getNotification, dismissNotification } = require('../service/notification.service');

function addApplication(req, res) {
  const { id } = req.user;
  const body = req.body;
  addNotification(id, body)
    .then(() => res.status(201).send())
    .catch(error => res.status(500).json({ error: error.message }));
}

function getApplications(req, res) {
  const { id, agentId } = req.user;
  const query = req.query;
  getNotifications(id, agentId, query)
    .then(notifications => res.status(200).json(notifications))
    .catch(error => res.status(500).json({ error: error.message }));
}

function getOneNotification(req, res) {
  const id = req.params.id;
  getNotification(id)
    .then(notification => res.status(200).json(notification))
    .catch(error => res.status(500).json({ error: error.message }));
}

function dismissOneNotification(req, res) {
  const id = req.params.id;
  dismissNotification(id)
    .then(() => res.status(200).send())
    .catch(error => res.status(500).json({ error: error.message }));
}

module.exports = {
  addApplication,
  getApplications,
  getOneNotification,
  dismissOneNotification
};
