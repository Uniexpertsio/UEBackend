const {getFaqData}=require("../service/Faq.service");

class FaqController {

  async getAllFaq(req, res) {
    try {
      const {query}=req.query;
      const faq = await getFaqData(query);
    logger.info(`Endpoint: ${req.originalUrl} - Status: 200 - Message: Success`);
      res.json(faq);
    } catch(err) {
      logger.error(`Endpoint: ${req.originalUrl} - Status: 400 - Message: ${err?.response?.data[0]?.message}`);
    } 
  }
}

module.exports = FaqController;
