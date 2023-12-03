const mongoose = require('mongoose');

const CommissionStatus = {
  NEW: 'NEW',
  // Add other CommissionStatus values here
};

const CommissionSchema = new mongoose.Schema(
  {
    commissionTypeId: { type: String, required: true },
    status: { type: String, required: false, enum: Object.values(CommissionStatus), default: CommissionStatus.NEW },
    schoolId: { type: String, required: true },
    applicationId: { type: String, required: true },
    agentId: { type: String, required: true },
    commission: { type: Number, required: false },
    commissionRate: { type: Number, required: false },
    currency: { type: String, required: false },
    salesforceId: { type: String, required: false, default: '--' },
    externalId: { type: String, required: true },
    createdBy: { type: String, required: true },
    modifiedBy: { type: String, required: true },
  },
  { timestamps: true }
);

CommissionSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const CommissionModel = mongoose.model('Commission', CommissionSchema);

module.exports = CommissionModel;
