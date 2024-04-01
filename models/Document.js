const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    userId: { type: String, required: false },
    documentTypeId: { type: String, required: false },
    remark: { type: String, required: false, default: "" },
    url: { type: String, required: false },
    status: {
      type: String,
      required: false,
      enum: [
        "Pending",
        "Uploaded",
        "Re-Uploaded",
        "In Review",
        "Approved",
        "Conditionally Approved",
        "Rejected",
        "Requested",
      ],
      default: "Uploaded",
    },
    externalId: { type: String, required: true },
    createdBy: { type: String, required: true },
    modifiedBy: { type: String, required: true },
    isLocked: { type: Boolean, required: false, default: true },
    agentId: { type: String, required: false },
    studentId: { type: String, required: false },
    applicationId: { type: String, required: false },
    programId: { type: String, required: false },
    schoolId: { type: String, required: false },
    masterId: { type: String, required: false },
    name: { type: String, required: false },
    expiry: { type: Date, required: false },
    description: { type: String, required: false },
    mandatory: { type: String, required: false },
    isPublic: { type: String, required: false },
    purpose: { type: String, required: false },
    byPassDoc: { type: Boolean, required: false },
    isDownloaded: { type: Boolean, required: false },
    reviewRemarks: { type: String, required: false },
    fileType: { type: String, required: false },
    latestDocumentId: { type: String, required: false },
    // sharepointStatus: { type: String, required: false },
    //   sharePointFolderPath: { type: String, required: false },
    ///    changing sharePointFolderPath to S3 hosted
    S3Folder__c: { type: String, required: false },
    S3_DMS_URL__c: { type: String, required: false },

    sfId: { type: String, required: false },
  },

  { timestamps: true }
);

const Document = mongoose.model("Document", DocumentSchema);

module.exports = Document;
