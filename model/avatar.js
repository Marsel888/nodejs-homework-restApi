const { Schema, model } = require('mongoose')

const avtatar = Schema({
  avatarURL: String,
})

const Avatar = model('avatar', avtatar)
module.exports = {
  Avatar,
}
