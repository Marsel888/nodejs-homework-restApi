const express = require('express')
const router = express.Router()
const { Avatar } = require('../../model/avatar')
const { Register } = require('../../model/user')
const fs = require('fs/promises')
const patch = require('path')
const jimp = require('jimp')

const patchAvatart = patch.join(__dirname, 'public/avatar')

router.post('/', async (req, res, next) => {
  try {
    const { originalname, path: tempUpload } = req.file
    const newName = `${req.user._id}_${originalname}`
    const ava = await jimp.read(tempUpload)
    ava.resize(250, 250).write(tempUpload)
    const resultUpload = patch.join(patchAvatart, newName)
    await fs.rename(tempUpload, resultUpload)
    const avatarURL = patch.join('avatars', newName)
    await Register.findByIdAndUpdate(req.user._id, { avatarURL })
    res.status(201).json({ avatarURL })
  } catch (err) {
    next(err)
  }
})

module.exports = router
