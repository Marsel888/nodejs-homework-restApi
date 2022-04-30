const express = require('express')
const Joi = require('joi')
const router = express.Router()

const { Contact } = require('../../model/models')
// *! Получаем все контакты
router.get('/', async (req, res, next) => {
  const list = await Contact.find({})

  res.status(200).send(list)
})
// *!  Ищем контакт по ид
router.get('/:contactId', async (req, res, next) => {
  const getById = await Contact.findById(req.params.contactId)
  // *! Если нет ИД пишем ошибку
  if (!getById) {
    res.status(404).send({ message: 'Not found' })
  }

  res.status(200).send(getById)
})

// *! Добавляем новый контакт
router.post('/', async (req, res, next) => {
  try {
    const { error } = Contact.validate(req.body)

    if (error) {
      res.status(400).json('error')
      return
    }

    const newContact = await Contact.create(req.body)

    Validation(req, res)
    res.status(201).json(newContact)
  } catch (error) {
    res.status(400).json('message Error')
  }
})
// *!  Удаляем контакт по ИД
router.delete('/:contactId', async (req, res, next) => {
  const deleteId = await Contact.findByIdAndDelete(req.params.contactId)

  // *! Если нет ИД выдаём ошибку
  if (!deleteId) {
    res.status(404).json({ message: 'Not found' })
  }
  res
    .status(200)
    .json({ message: `contact deleted width id${req.params.contactId} ` })
})

// *!  Перезаписываем контакт по ИД
router.put('/:contactId', async (req, res, next) => {
  const update = await Contact.findByIdAndUpdate(req.params.contactId, req.body)

  const { name, email, phone } = req.body

  Validation(req, res)

  // *! если в Боди нету одного параметра выдаем ошибку
  if (!name && !email && !phone) {
    return res.status(400).json({ message: 'missing fields' })
  }
  // *! если нету ИД выдаем ошибку
  if (!update) {
    res.status(404).json({ message: 'Not found' })
  }

  res.status(200).send(update)
})

router.patch('/:contactId/favorite', async (req, res) => {
  try {
    const favorites = await Contact.findByIdAndUpdate(
      req.params.contactId,
      req.body,
    )

    if (Object.keys(req.body).length === 1) {
      res.status(201).send(favorites)
      return
    }

    res.status(400).json({ message: 'missing field favorite' })
  } catch (e) {
    res.status(404).json({ message: 'Not found' })
  }
})

function Validation(req, res) {
  // *! Делаем валидацию на входящие данные

  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net'] },
    }),
    phone: Joi.number().required(),
    favorite: Joi.boolean(),
  })

  // *! Ловим ошибку
  const validatError = schema.validate(req.body)

  if (validatError.error) {
    return res.status(400).json({ message: validatError.error })
  }
}
module.exports = router
