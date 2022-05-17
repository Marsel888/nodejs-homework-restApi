const express = require('express')
const logger = require('morgan')
const cors = require('cors')
const register = require('./routes/api/register')
const contactsRouter = require('./routes/api/contacts')
const avatar = require('./routes/api/avatar')
const multer = require('multer')
const patch = require('path')

const tempDir = patch.join(__dirname, 'temp')

require('dotenv').config()
const app = express()
require('dotenv').config()
const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'

const multerConfig = multer.diskStorage({
  destination: tempDir,
  filename: (req, res, cd) => {
    cd(null, res.originalname)
  },
})
const upload = multer({ storage: multerConfig })

app.use(logger(formatsLogger))
app.use(cors())
app.use(express.json())
// app.use(express.static(__dirname, 'public', 'avatar'))
app.use('/users/signup', register)
app.use('/users/avatars', upload.single('avatar'), avatar)
app.use('/api/contacts', contactsRouter)

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message })
})

module.exports = app
