const DashboardService = require('../service/dashboard.service')


class DashboardController {
    constructor() {
      this.dashboardService = new DashboardService();
    }
  
    getBanners(req, res) {
      this.dashboardService.getBanners()
        .then((banners) => res.status(200).json(banners))
        .catch((error) => res.status(500).json({ error: "Internal Server Error" }));
    }
  
    getIntakes(req, res) {
      this.dashboardService.getIntakes()
        .then((intakes) => res.status(200).json(intakes))
        .catch((error) => res.status(500).json({ error: "Internal Server Error" }));
    }
  
    getCount(req, res) {
      const { agentId } = req.user;
      this.dashboardService.getCount(agentId)
        .then((count) => res.status(200).json(count))
        .catch((error) => res.status(500).json({ error: "Internal Server Error" }));
    }
  
    getTopSchools(req, res) {
      this.dashboardService.getTopSchools()
        .then((topSchools) => res.status(200).json(topSchools))
        .catch((error) => res.status(500).json({ error: "Internal Server Error" }));
    }
  
    getRecentPrograms(req, res) {
      this.dashboardService.getRecentPrograms()
        .then((programs) => res.status(200).json(programs))
        .catch((error) => res.status(500).json({ error: "Internal Server Error" }));
    }
  
    getInterviews(req, res) {
      const { id } = req.user;
      this.dashboardService.getInterviews(id)
        .then((interviews) => res.status(200).json(interviews))
        .catch((error) => res.status(500).json({ error: "Internal Server Error" }));
    }
  
    getReport(req, res) {
      const { agentId } = req.user;
      const { type, year } = req.query;
      this.dashboardService.getReport(agentId, { type, year })
        .then((report) => res.status(200).json(report))
        .catch((error) => res.status(500).json({ error: "Internal Server Error" }));
    }
  }
  
  module.exports = DashboardController;
  