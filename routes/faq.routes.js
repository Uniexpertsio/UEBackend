const express = require('express');
const router = express.Router();
const FaqController = require('../controllers/Faq');

const faqController = new FaqController();

router.post('/', faqController.getAllFaq.bind(faqController));
router.get('/', faqController.getAllFaq.bind(faqController));

module.exports = router;
