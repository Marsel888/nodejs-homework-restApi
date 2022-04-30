const { Schema, model } = require('mongoose')

const contact = Schema({
  name: {
    type: String,
    required: [true, 'Set name for contact'],
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
})
const Contact = model('contacts', contact)

module.exports = {
  Contact,
}
