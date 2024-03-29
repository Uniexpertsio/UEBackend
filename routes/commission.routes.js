// routers/commissionRouter.js
const express = require("express");
const commissionController = require("../controllers/Commission");
const Middleware = require("../controllers/Middleware")


const commissionRouter = express.Router();

commissionRouter.post("/create", Middleware.checkAuth, commissionController.createCommission);
commissionRouter.get("/list", Middleware.checkAuth, commissionController.getCommissions);

module.exports = commissionRouter;
