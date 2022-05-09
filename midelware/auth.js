const jwt = require('jsonwebtoken')
const { Register } = require('../model/user')

const auth = async (req, res, next) => {
  try {
    const { authorization } = req.headers
    const [bearer, token] = authorization.split(' ')
    if (bearer !== 'Bearer') {
      res.status(401)
    }

    try {
      const { SECRET_KEY } = process.env

      const { id } = jwt.verify(token, SECRET_KEY)

      const user = await Register.findById(id)

      if (!user || !user.token) {
        res.status(401)
      }

      req.user = user
      next()
    } catch (error) {
      next(error)

      res.status(401)
    }
  } catch (error) {
    next(error)
  }
}
module.exports = { auth }
