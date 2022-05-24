const { boolean } = require('joi')
const Joi = require('joi')
const { Schema, model } = require('mongoose')
const register = Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  subscription: {
    type: String,
    enum: ['starter', 'pro', 'business'],
    default: 'starter',
  },
  token: {
    type: String,
    default: null,
  },
  avatarURL: String,
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: [true, 'Verify token is required'],
  },
})
const Verify = Joi.object({
  email: Joi.string().required(),
})

const JoiSchema = Joi.object({
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ['com', 'net'] },
  }),
  password: Joi.string().min(3).max(30).required(),
})

const Register = model('register', register)

module.exports = {
  Register,
  JoiSchema,
  Verify,
}
