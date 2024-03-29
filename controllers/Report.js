const axios = require('axios');
const ReportService = require('../service/report.service');

const reportService = new ReportService();

async function getTotalEarning(req, res) {
  try {
    const { agentId } = req.user;
    const query = req.query;
    const result = await reportService.getTotalEarning(agentId, query);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getAgentEarning(req, res) {
  try {
    const { agentId } = req.user;
    const query = req.query;
    const result = await reportService.getAgentEarning(agentId, query);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getReportData(req, res) {
  try {
    const { id, agentId } = req.user;
    const result = await reportService.getReportData(id, agentId);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getReportType(req, res) {
  try {
    const result = await reportService.getReportType();
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getReportList(req, res) {
  try {
    const result = await reportService.getReportList();
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getReport(req, res) {
  try {
    const { agentId } = req.user;
    const body = req.query;
    const { url, headers } = await reportService.getReport(agentId, body);

    const response = await axios.get(url, {
      headers,
      responseType: 'stream',
    });

    res.header({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    res.attachment(`${body.type}.xlsx`);
    response.data.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  getTotalEarning,
  getAgentEarning,
  getReportData,
  getReportType,
  getReportList,
  getReport,
};
