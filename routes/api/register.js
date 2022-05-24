const express = require('express')
const bcrypt = require('bcryptjs')
const { auth } = require('../../midelware/auth')
const jwt = require('jsonwebtoken')
const router = express.Router()
const { Register, JoiSchema, Verify } = require('../../model/user')
const gravatar = require('gravatar')
const { v4: uuidv4 } = require('uuid')

const sendMail = require('../../sendgrid/sendMail.js')
const verificationToken = uuidv4()
router.post('/register', async (req, res, next) => {
  const { email, password } = req.body

  try {
    const { error } = JoiSchema.validate(req.body)

    if (error) {
      res.status(400).json({
        ResponseBody: '<Ошибка от Joi или другой библиотеки валидации>',
      })
    }

    const result = await Register.findOne({ email })

    if (result) {
      res.status(409).json({
        ResponseBody: {
          message: 'Email in use',
        },
      })
    }
    const avatarURL = gravatar.url(email)
    const pass = await bcrypt.hash(password, 10)

    await Register.create({
      email,
      password: pass,
      avatarURL,
      verificationToken,
    })
    const mail = {
      to: email,
      subject: 'подтверждения регистрации',
      html: '<a> Подтверждения</a>',
    }
    await sendMail(mail)
    res.status(201).json({
      users: {
        email,
      },
    })
  } catch (error) {
    next(error)
  }
})

router.get(`/users/verify/${verificationToken}`, async (req, res, next) => {
  try {
    const { verificationToken } = req.params
    const user = await Register.findOne(verificationToken)
    if (!user) {
      res.status(404).json('Нету такого юзера')
    }
    await Register.findByIdAndUpdate(user._id, {
      verificationToken: null,
      verify: true,
    })
    res.status(200).json('verification successfulc')
  } catch (error) {
    next(error)
  }
})

router.post('/verify', async (req, res, next) => {
  try {
    const { error } = Verify.validate(req.body)
    if (error) {
      res.status(400).json('Шеф все пропало')
    }
    const { email } = req.body
    const user = await Register.findOne({ email })
    if (user.verify) {
      res.status(400).json('Шеф все пропало')
    }
    const mail = {
      to: 'bjiad7878@gmail.com',
      subject: 'Подтвеждение email',
      html: `<a target="_blank" href='http://localhost:3000/api/users/${user.verificationToken}'>Нажмите чтобы подтвердить свой email</a>`,
    }
    sendMail(mail)
    res.json({
      message: 'Verification email sentttt',
    })
  } catch (err) {
    next(err)
  }
})

router.post('/login', auth, async (req, res, nex) => {
  try {
    const { error } = JoiSchema.validate(req.body)

    if (error) {
      res.status(400).json({
        ResponseBody: '<Ошибка от Joi или другой библиотеки валидации>',
      })
    }

    const { email, password } = req.body

    const result = await Register.findOne({ email })
    if (!result) {
      res.status(401).json({
        ResponseBody: {
          message: 'Email or password is wrong',
        },
      })
    }

    const compare = await bcrypt.compare(password, result.password)

    if (!compare) {
      res.status(401).json({
        ResponseBody: {
          message: 'Email or password is wrong',
        },
      })
    }
    const payload = {
      id: result._id,
    }

    const { SECRET_KEY } = process.env

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '20h' })

    await Register.findByIdAndUpdate(result._id, { token })
    await res.status(200).json({
      ResponseBody: {
        token,
        user: {
          email,
          subscription: 'started',
        },
      },
    })
  } catch (error) {
    next(error)
  }
})

router.get('/curent', auth, async (req, res, next) => {
  const { email } = req.body
  const [, token] = req.headers.authorization.split(' ')

  if (!token) {
    res.status(401).json({
      ResponseBody: {
        message: 'Not authorized',
      },
    })
  }

  res.status(201).json({
    ResponseBody: {
      email,
    },
  })
})

router.get('/logout', auth, async (req, res, next) => {
  try {
    const { _id } = req.user
    await Register.findByIdAndUpdate(_id, { token: null })
    res.status(204).json('log : token')
  } catch (error) {
    next(error)
  }
})

module.exports = router
