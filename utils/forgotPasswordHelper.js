const StaffModel = require('../models/Staff'); 

const forgotPasswordRateLimit = async (email) => {
  try {
    const staff = await StaffModel.findOne({ email: email.toLowerCase().trim() });

    const currentTime = new Date();
    const lastForgotPasswordRequest = staff.lastForgotPasswordRequest || currentTime;

    const timeDifference = currentTime - lastForgotPasswordRequest;
    const hoursDifference = Math.ceil(timeDifference / (1000 * 60 * 60));

    if (hoursDifference < 24 && staff.forgotPasswordAttempts >= 3) {
      throw new Error('Too many requests. Please try again later.');
    }

    if (hoursDifference >= 24) {
        staff.forgotPasswordAttempts = 0;
    }

    staff.forgotPasswordAttempts += 1;
    staff.lastForgotPasswordRequest = currentTime;
    const result = await staff.save();
    console.log('result ---',result)

    return { success: true };
  } catch (error) {
    console.error('Error in rate limiting middleware:', error);
    throw error;
  }
};

module.exports = { forgotPasswordRateLimit };
