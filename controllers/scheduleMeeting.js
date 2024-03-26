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
              res.status(200).json(result);
            } catch (error) {
              console.error(error);
              res.status(500).json({ error: 'Internal Server Error' });
            }
          }
        
}
  
module.exports = ScheduleMeetingController;
  