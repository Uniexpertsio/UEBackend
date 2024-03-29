
const Invoice = require("../models/Invoice")

const DEFAULT_NULL_DATE_PAST = "1990-11-04";

class InvoiceService {
  constructor() {
   
  }

  async createInvoice(agentId, invoiceDto) {
    const invoice = await Invoice.create({
      ...invoiceDto,
      agentId,
      createdOn: new Date(invoiceDto.createdOn).toISOString(),
      createdAt: new Date(invoiceDto.createdOn).toISOString(),
    });
    return invoice.save();
  }

  async getInvoices(agentId, query) {
    let filter = { agentId };

    if (query.startDate !== DEFAULT_NULL_DATE_PAST && query.endDate !== DEFAULT_NULL_DATE_PAST) {
      filter = {
        agentId,
        createdAt: {
          $gte: new Date(query.startDate).toISOString(),
          $lte: new Date(query.endDate).toISOString(),
        },
      };
    }

    const invoices = await Invoice
      .find(filter)
      .skip(query.perPage * (query.pageNo - 1))
      .limit(query.perPage);

    return {
      data: invoices,
      meta: {
        perPage: query.perPage,
        pageNo: query.pageNo,
        total: (await Invoice.find(filter)).length,
      },
    };
  }
}

module.exports = InvoiceService;
