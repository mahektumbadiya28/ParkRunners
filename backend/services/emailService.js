// Mock email service for now. Will connect to Nodemailer later.
export const sendEmail = async (options) => {
  console.log(`[Email Service] Mock sending email to ${options.to}`);
  console.log(`[Email Service] Subject: ${options.subject}`);
  // console.log(`[Email Service] Text: ${options.text}`);
  return true;
};
