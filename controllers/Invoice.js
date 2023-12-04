// invoiceController.js
const express = require('express');
const router = express.Router();
const InvoiceService = require('../service/invoice.service');


async function createInvoice(req, res) {
  try {
    const { agentId } = req.user;
    const invoiceDto = req.body;
    const result = await InvoiceService.createInvoice(agentId, invoiceDto);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getInvoices(req, res) {
  try {
    const { agentId } = req.user;
    const query = req.query;
    const result = await InvoiceService.getInvoices(agentId, query);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


module.exports = { createInvoice, getInvoices };