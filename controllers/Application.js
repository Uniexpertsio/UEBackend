// applicationController.js

const ApplicationService = require('../service/application.service');

class ApplicationController {
  constructor() {
    this.applicationService = new ApplicationService();
  }

  async addApplication(req, res) {
    try {
      const { id, agentId } = req.user;
      const body = req.body;
      const result = await this.applicationService.addApplication(id, agentId, body);
    logger.info(`Endpoint: ${req.originalUrl} - Status: 200 - Message: Success`);
      res.status(201).json(result);
    }catch(err) {
      logger.error(`Endpoint: ${req.originalUrl} - Status: 400 - Message: ${err?.response?.data[0]?.message}`);
        return res.status(500).json({ statusCode: 500, message: err.message });
    }
  }

  async getApplications(req, res) {
    try {
      const { agentId,role,_id} = req.user;
      const query = req.query;
      const result = await this.applicationService.getApplications(agentId, query,role,_id);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTasks(req, res) {
    try {
      const { applicationId } = req.params;
      const { status } = req.query;
      const result = await this.applicationService.getTasks(applicationId, status);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateTask(req, res) {
    try {
      const { applicationId, taskId } = req.params;
      const { data } = req.query;
      const { id } = req.user;
      const result = await this.applicationService.updateTask(applicationId, id, taskId, data);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTaskComments(req, res) {
    try {
      const { applicationId, taskId } = req.params;
      const result = await this.applicationService.getTaskComments(applicationId, taskId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async addTaskComment(req, res) {
    try {
      const { applicationId, taskId } = req.params;
      const { id } = req.user;
      const body = req.body;
      const result = await this.applicationService.addTaskComment(applicationId, taskId, id, body);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getComments(req, res) {
    try {
      const { applicationId } = req.params;
      const result = await this.applicationService.getComments(applicationId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async addComment(req, res) {
    try {
      const { applicationId } = req.params;
      const { id } = req.user;
      const body = req.body;
      const result = await this.applicationService.addComment(applicationId, id, body);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getStudentDocuments(req, res) {
    try {
      const { applicationId } = req.params;
      const result = await this.applicationService.getDocuments(applicationId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async addPayment(req, res) {
    try {
      const { applicationId } = req.params;
      const { id } = req.user;
      const body = req.body;
      const result = await this.applicationService.addPayment(applicationId, id, body);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPayments(req, res) {
    try {
      const { applicationId } = req.params;
      const result = await this.applicationService.getPayments(applicationId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getApplication(req, res) {
    try {
      const { applicationId } = req.params;
      const result = await this.applicationService.getApplication(applicationId);
      res.status(200).json(result);
    } catch (error) {
      console.log('errrorrr',error)
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ApplicationController();
