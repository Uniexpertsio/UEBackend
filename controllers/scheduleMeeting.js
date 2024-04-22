const ScheduleMeetingService = require("../service/scheduleMeeting.service")

class ScheduleMeetingController {
  constructor() {
    this.scheduleMeetingService = new ScheduleMeetingService();
  }
  scheduleMeeting = async (req, res) => {
    try {
      const { id } = req.user;
      const body = req.body;
      const result = await this.scheduleMeetingService.createMeeting(id, body);
      logger.info(`Id: ${id} Endpoint: ${req.originalUrl} - Status: 200 - Message: Success`);
      res.status(200).json(result);
    } catch (error) {
      logger.error(`Endpoint: ${req.originalUrl} - Status: 400 - Message: ${error?.response?.data[0]?.message}`);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

}

module.exports = ScheduleMeetingController;
