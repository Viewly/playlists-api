const mandrill = require('mandrill-api/mandrill');
const mandrillClient = new mandrill.Mandrill(process.env.MANDRILL_API_KEY);
const templates = require('./templates');


function sendConfirmEmail(user) {
  return sendEmail(templates.confirmEmail(user))
}

function sendResetPasswordEmail(user) {
  return sendEmail(templates.resetPasswordEmail(user))
}

function sendWelcomeEmail(user) {
  return sendEmail(templates.welcomeEmail(user))
}

function sendCommentActivityEmail(to_email, comment_sender, playlist, comment_id) {
  return sendEmail(templates.commentActivityEmail(to_email, comment_sender, playlist, comment_id))
}

function sendEmail(email) {
  return new Promise((resolve, reject) => {
    mandrillClient.messages.sendTemplate(
      email,
      (result) => resolve(result),
      (error) => reject(error)
    );
  });
}

module.exports = {
  sendConfirmEmail,
  sendResetPasswordEmail,
  sendWelcomeEmail,
  sendCommentActivityEmail
};
