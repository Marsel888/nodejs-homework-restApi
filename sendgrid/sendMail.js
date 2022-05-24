const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(
  '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',
)

const sendMail = async (data) => {
  try {
    const mail = { ...data, from: 'bjiad8787@gmail.com' }
    await sgMail.send(mail)
    return true
  } catch (err) {
    return false
  }
}
module.exports = sendMail
