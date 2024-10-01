const AWS = require("aws-sdk");
const { otpMailTemplate, staffMailTemplate } = require("./mailTemplate");

AWS.config.update({
  region: process.env.SES_REGION,
  accessKeyId: process.env.SES_ACCESS_KEY,
  secretAccessKey: process.env.SES_SECRET_KEY,
});

const SES = new AWS.SES({ apiVersion: "2010-12-01" });

async function sendEmailWithOTP(recipientEmail, otp) {
  return new Promise(async (resolve, reject) => {
    try {
      const params = {
        Destination: {
          ToAddresses: [recipientEmail.toLowerCase()],
        },
        Message: {
          Body: {
            Html: {
              Data: otpMailTemplate(otp),
            },
          },
          Subject: {
            Data: "Reset password otp",
          },
        },
        Source: process.env.EMAIL_ADDRESS,
      };
      // Send the email
      const result = await SES.sendEmail(params).promise();
      resolve(result);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
}

async function sendEmailToStaff(mailBody) {
  const params = {
    Destination: {
      ToAddresses: [mailBody?.mail.toLowerCase()],
    },
    Message: {
      Body: {
        Html: {
          Data: staffMailTemplate(mailBody),
        },
      },
      Subject: {
        Data: "Login Creds - Uniexperts",
      },
    },
    Source: process.env.EMAIL_ADDRESS,
  };
  // Send the email
  return await SES.sendEmail(params).promise();
}

module.exports = {
  sendEmailWithOTP,
  sendEmailToStaff,
};
