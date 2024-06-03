const emailValidator = require("email-validator");

function validateEmail(email) {
  return emailValidator.validate(email);
}
function returnField(examType) {
  if (examType === "12th STD. English mark") {
    return "Pte_Gmat_12th_Total_Marks_of_English__c";
  } else if (examType === "GRE") {
    return "Gre_Analytical_reasoning_Percentile__c";
  } else if (examType === "GMAT") {
    return "Gmat_Total_Percentile__c";
  } else {
    return "Pte_Gmat_12th_Total_Marks_of_English__c";
  }
}
module.exports = { validateEmail, returnField };
