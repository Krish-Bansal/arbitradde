const jwt = require('jsonwebtoken')

const createJwt = (email) => {
  const jwtToken = jwt.sign(
    {
      email
    },
    process.env.JWT_TOKEN,
    {
      expiresIn: '30d',
    },
  )
  return jwtToken
}


const decryptToken = async (token) => {
  const data = jwt.verify(
    token,
    process.env.JWT_TOKEN
  )
  return data
}
module.exports = { createJwt, decryptToken }
