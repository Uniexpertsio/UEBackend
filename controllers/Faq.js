const {getFaqData}=require("../service/Faq.service");

class FaqController {

  async getAllFaq(req, res) {
    const {query}=req.query;
    const faq = await getFaqData(query);
    res.json(faq);
  }
}

module.exports = FaqController;
