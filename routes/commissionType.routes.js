// routes.js
const express = require('express');
const CommissionTypeController = require('../controllers/CommissionType');

const Middleware = require("../controllers/Middleware")

const router = express.Router();


const controller = new CommissionTypeController();

router.post('/type', Middleware.checkAuth, (req, res) => controller.addCommissionType(req, res));
router.get('/type', Middleware.checkAuth, (req, res) => controller.getCommissionType(req, res));
router.post('/slab', Middleware.checkAuth, (req, res) => controller.addCommissionSlab(req, res));


module.exports = router;
