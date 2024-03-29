const mongoose =  require("mongoose");

const ConfigSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, enum: ["AUTH_BACKGROUND_IMG","AGENT_BANK_FIELDS","AUTH_TNC","TEST_SCORE_EXAM_TYPE","TEST_SCORE_FIELDS","CASE_TYPE","CASE_SUB_TYPE","DASHBOARD_BANNERS","REPORT_TYPE"], unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

let configModel = mongoose.model("Config", ConfigSchema);
module.exports = configModel;