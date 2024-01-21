const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  type: { type: String, required: true, enum: ['type1', 'type2', 'type3'] }, // Replace with actual NotificationType values
  
  // added color param new to notification change in service required
  
  color: { type: String, required: true},
  createdBy: { type: String, required: true },
  externalId: { type: String, required: true },
  modifiedBy: { type: String, required: true },
  staffId: { type: String, required: false },
  agentId: { type: String, required: false },
  subject: { type: String, required: false },
  isRead: { type: Boolean, required: false, default: false },
  isAnnouncement: { type: Boolean, required: false, default: false },
}, { timestamps: true });

notificationSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
